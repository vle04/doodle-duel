"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import TeamSelecter from "./TeamSelector";
import LeaveRoomButton from "./LeaveRoomButton";
import StartGameButton from "./StartGameButton";

interface Player {
  id: string;
  profileId: string;
  team: "A" | "B" | null;
  profile: {
    username: string;
  };
}

interface LobbyProps {
  roomCode: string;
  hostId: string;
  initialPlayers: Player[];
}

export default function Lobby({
  roomCode,
  hostId,
  initialPlayers,
}: LobbyProps) {
  const [players, setPlayers] = useState(initialPlayers);

  useEffect(() => {
    const channel = supabase.channel(`room:${roomCode}`);

    channel.on(
      "broadcast",
      { event: "team-update" },
      (payload) => {
        setPlayers(payload.payload.players);
      }
    );

    channel.on(
      "broadcast",
      { event: "room-update" },
      (payload) => {
        setPlayers(payload.payload.players);
      }
    );

    channel.on(
      "broadcast",
      { event: "game-started" },
      () => {
        window.location.href = `/room/${roomCode}/game`;
      }
    );

    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [roomCode]);

  const teamAPlayers = players.filter(
    (player) => player.team === "A"
  );

  const teamBPlayers = players.filter(
    (player) => player.team === "B"
  );

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-4">
        <TeamSelecter roomCode={roomCode} />
        <LeaveRoomButton roomCode={roomCode} />
        <StartGameButton roomCode={roomCode} hostId={hostId} />
      </div>

      <div className="flex flex-col items-center mt-4 w-full max-w-md">
        <div className="mb-4 w-full">
          <h2>Team A</h2>
          <hr />

          <ul>
            {teamAPlayers.map((player) => (
              <li key={player.id}>
                {player.profile.username}
                {player.profileId === hostId && (
                  <span className="ml-2 text-sm text-gray-500">
                    (Host)
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-4 w-full">
          <h2>Team B</h2>
          <hr />

          <ul>
            {teamBPlayers.map((player) => (
              <li key={player.id}>
                {player.profile.username}
                {player.profileId === hostId && (
                  <span className="ml-2 text-sm text-gray-500">
                    (Host)
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}