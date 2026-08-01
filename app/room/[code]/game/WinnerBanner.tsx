"use client";

import LeaveRoomButton from "../LeaveRoomButton";

interface WinnerBannerProps {
  winner: "A" | "B" | "NONE";
  roomCode: string;
}

export default function WinnerBanner({ winner, roomCode }: WinnerBannerProps) {
  if (winner === "NONE") {
    return null;
  }

  return (
    <div className="mt-6 rounded-lg bg-green-100 p-4 text-center">
      <div className="text-2xl font-bold text-green-700">Team {winner} wins!</div>
      <div className="mt-4 flex justify-center">
        <LeaveRoomButton roomCode={roomCode} />
      </div>
    </div>
  );
}