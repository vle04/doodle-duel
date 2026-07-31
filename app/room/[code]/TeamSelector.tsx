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

    await fetch("/api/rooms/team", {
      method: "POST",
      body: JSON.stringify({
        userId: user.id,
        roomCode,
        team,
      }),
    });

    // refresh the page to update the team selection
    // this is only for the current user, other users will not see the change until they refresh the page themselves
    // later can use supabase realtime to update the team selection for all users in the room
    router.refresh();
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