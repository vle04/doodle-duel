"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function LeaveRoomButton({
  roomCode,
}: {
  roomCode: string;
}) {
  const router = useRouter();

  async function leaveRoom() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await fetch("/api/rooms/leave", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        roomCode,
      }),
    });

    router.push("/dashboard");
  }

  return (
    <button
      onClick={leaveRoom}
      className="text-red-500 hover:underline flex justify-center items-center text-center flex-col"
    >
      Leave Room
    </button>
  );
}