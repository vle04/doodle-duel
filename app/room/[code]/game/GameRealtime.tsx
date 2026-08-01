// listens for winner updates

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import WinnerBanner from "./WinnerBanner";

interface GameRealtimeProps {
  roomCode: string;
  initialWinner: "A" | "B" | "NONE";
}

export default function GameRealtime({
  roomCode,
  initialWinner,
}: GameRealtimeProps) {
  const [winner, setWinner] = useState(initialWinner);

  useEffect(() => {
    const channel = supabase.channel(`room:${roomCode}`);

    channel.on(
      "broadcast",
      { event: "round-ended" },
      ({ payload }) => {
        setWinner(payload.winner);
      }
    );

    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [roomCode]);

  return <WinnerBanner winner={winner} roomCode={roomCode} />;
}