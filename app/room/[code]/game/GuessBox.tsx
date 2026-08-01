"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface GuessBoxProps {
  roomCode: string;
}

export default function GuessBox({ roomCode }: GuessBoxProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  async function submitGuess() {
    console.log("submit clicked");

    if (!userId || !guess.trim()) return;

    console.log({
      roomCode,
      userId,
      guess,
    });

    const res = await fetch(`/api/rooms/${roomCode}/guess`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roomCode,
        userId,
        guess,
      }),
    });

    const data = await res.json();

    console.log("response:", data);

    setMessage(data.message);
    setGuess("");
  }

  return (
    <div className="flex gap-3 mt-8">
      <input
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        placeholder="Enter your guess..."
        className="border rounded px-3 py-2 w-80"
      />

      <button
        onClick={submitGuess}
        disabled={!userId}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Submit
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}