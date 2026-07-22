import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

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

  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-2 bg-white text-black">
      <h1 className="text-2xl font-bold mb-4">Room {room.code}</h1>

      <h2 className="text-xl font-semibold mb-2">Players:</h2>
      <ul>
        {room.players.map((player) => (
          <li key={player.id} className="text-lg">
            {player.profile.username}
          </li>
        ))}
      </ul>
    </main>
  );
}