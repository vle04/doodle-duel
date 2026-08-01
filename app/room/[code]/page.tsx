import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import TeamSelecter from "./TeamSelector";
import LeaveRoomButton from "./LeaveRoomButton";
import StartGameButton from "./StartGameButton";
import { RoomStatus } from "@/app/generated/prisma/enums";
import Lobby from "./Lobby";

interface RoomPageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function Room({ params }: RoomPageProps) {
  const { code } = await params;
  const room = await prisma.room.findUnique({
    where: {
      code
    },
    include: {
      players: {
        include: {
          profile: true,
        },
      },
    },
  });

  if (!room) {
    notFound();
  }

  if (room.status === RoomStatus.PLAYING) {
    redirect(`/room/${room.code}/game`);
  }

  const teamAPlayers = room.players.filter(player => player.team === "A");
  const teamBPlayers = room.players.filter(player => player.team === "B");

  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-2 bg-white text-black">
      <h1 className="text-2xl font-bold mb-4">
        Room {room.code}
      </h1>

      <Lobby
        roomCode={room.code}
        hostId={room.hostId}
        initialPlayers={room.players}
      />
    </main>
  );
}