// get current user form supabase, call /api/rooms/team endpoint, refresh page afterwards to update the team selection

"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function TeamSelecter({
  roomCode,
}: {
  roomCode: string;
}) {
  const router = useRouter();

  async function joinTeam(team: "A" | "B") {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("User not logged in");
      return;
    }

    const res = await fetch(`/api/rooms/team`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        roomCode,
        team,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error ?? "Failed to join team");
      return;
    }

    // the lobby listens for realtime team-update broadcasts, so refresh is not required
    // if you still want the current user to refresh state immediately, you can
    // keep router.refresh();
  }

  return (
    <div className="flex flex-row items-center mt-4 gap-4">
      <button onClick={() => joinTeam("A")} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Join Team A
      </button>
      <button onClick={() => joinTeam("B")} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
        Join Team B
      </button>
    </div>
  );
}