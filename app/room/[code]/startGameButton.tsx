"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function StartGameButton({
  roomCode,
  hostId,
}: {
  roomCode: string;
  hostId: string;
}) {
  const router = useRouter();

  async function startGame() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("User not logged in");
      return;
    }

    // only the host should see the button
    if (user.id !== hostId) {
      return;
    }

    const res = await fetch("/api/rooms/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        roomCode,
      }),
    });

    if (!res.ok) {
      alert("Failed to start game");
      return;
    }

    router.push(`/room/${roomCode}/game`);
  }

  // hide button for non-hosts
  const [show, setShow] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setShow(data.user?.id === hostId);
    });
  }, [hostId]);

  if (!show) return null;

  return (
    <button
      onClick={startGame}
      className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mt-4"
    >
      Start Game
    </button>
  );
}