"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";

interface RoomPlayer {
  profileId: string;
  team: "A" | "B" | null;
  username?: string | null;
}

interface TeamChatProps {
  roomCode: string;
  roomPlayers: RoomPlayer[];
}

interface ChatMessage {
  id: string;
  userId: string;
  username?: string;
  text: string;
  createdAt: string;
  team: "A" | "B" | null;
}

export default function TeamChat({ roomCode, roomPlayers }: TeamChatProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userTeam, setUserTeam] = useState<"A" | "B" | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const channelRef = useRef<any>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const id = data.user?.id ?? null;
      setUserId(id);
      setUserTeam(
        roomPlayers.find((p) => p.profileId === id)?.team ?? null,
      );
      setUsername(
        roomPlayers.find((p) => p.profileId === id)?.username ?? null,
      );
    });
  }, [roomPlayers]);

  useEffect(() => {
    if (!userTeam) return;

    async function loadHistory() {
      const res = await fetch(
        `/api/rooms/${roomCode}/guesses?team=${userTeam}`
      );

      if (!res.ok) {
        console.error("Failed to load chat history");
        return;
      }

      const data = await res.json();
      setMessages(data.messages ?? []);
    }

    loadHistory();

    const channel = supabase.channel(`room:${roomCode}:team:${userTeam}:chat`);

    channel.on("broadcast", { event: "chat" }, (payload) => {
      const msg = payload.payload as ChatMessage;
      setMessages((m) => [...m, msg]);
    });

    channel.subscribe((status) => {
      console.log("chat channel status", status);
    });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [roomCode, userTeam]);

  useEffect(() => {
    // auto-scroll
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || !userId || !userTeam) return;

    const text = input.trim();

    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      userId,
      username: username ?? undefined,
      text,
      createdAt: new Date().toISOString(),
      team: userTeam,
    };

    // show message immediately
    setMessages((m) => [...m, msg]);

    // send to team chat
    await channelRef.current?.send({
      type: "broadcast",
      event: "chat",
      payload: msg,
    });

    // persist the message as a guess
    const res = await fetch(`/api/rooms/${roomCode}/guess`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roomCode,
        userId,
        guess: text,
      }),
    });

    if (!res.ok) {
      console.error("Failed to persist message");
    }

    setInput("");
  }

  if (!userTeam) {
    return <div className="p-4">Joining teams...</div>;
  }

  return (
    <div className="flex flex-col w-full">
      <div ref={listRef} className="h-[360px] overflow-auto p-3 border rounded mb-3 bg-white">
        {messages.map((m) => (
          <div key={m.id} className="mb-2">
            <div className="text-sm text-gray-500">{m.username ?? m.userId} • {new Date(m.createdAt).toLocaleTimeString()}</div>
            <div className="bg-gray-100 rounded px-2 py-1 inline-block">{m.text}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
          placeholder="Message your team..."
          className="border rounded px-3 py-2 w-full"
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded">Send</button>
      </div>
    </div>
  );
}
