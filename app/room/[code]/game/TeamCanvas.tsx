"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Canvas from "./Canvas";

interface RoomPlayer {
  profileId: string;
  team: "A" | "B" | null;
}

interface TeamCanvasProps {
  roomCode: string;
  roomPlayers: RoomPlayer[];
  drawerAId: string;
  drawerBId: string;
}

export default function TeamCanvas({ roomCode, roomPlayers, drawerAId, drawerBId }: TeamCanvasProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userTeam, setUserTeam] = useState<"A" | "B" | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const id = data.user?.id ?? null;
      setUserId(id);
      setUserTeam(
        roomPlayers.find((player) => player.profileId === id)?.team ?? null,
      );
    });
  }, [roomPlayers]);

  if (!userId || !userTeam) {
    return (
      <div className="border rounded-lg p-6 w-full text-center">
        Waiting for team assignment...
      </div>
    );
  }

  const isDrawer =
    (userTeam === "A" && userId === drawerAId) ||
    (userTeam === "B" && userId === drawerBId);

  return (
    <div className="flex flex-col">
      <div className="text-lg font-semibold">Team {userTeam} Canvas</div>
      <Canvas roomCode={roomCode} team={userTeam} userId={userId} isDrawer={isDrawer} />
      {!isDrawer && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-900">
          Only the current drawer may draw on this canvas.
        </div>
      )}
    </div>
  );
}
