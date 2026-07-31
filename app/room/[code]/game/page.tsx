// page for the game loop

import { prisma } from "@/lib/prisma"; 
import { notFound, redirect } from "next/navigation";
import { RoomStatus } from "@/app/generated/prisma/enums";
import Canvas from "./Canvas";

interface GamePageProps {
  params: Promise<{
    code: string
  }>;
}

export default async function GamePage({ params }: GamePageProps) {
  const { code } = await params;

  const room = await prisma.room.findUnique({
    where: {
      code
    },
    include: {
      players: {
        include: {
          profile: true
        }
      }
    }
  });

  if (!room) {
    notFound();
  }

  if (room.status !== RoomStatus.PLAYING) {
    redirect(`/room/${code}`);
  }

  return (
    <main className="flex w-full p-20 flex-col bg-white text-black">
      {/* header */}
      <div className="flex flex-row justify-between">
        <h1 className="text-3xl font-bold">Room {room.code}</h1>
        <p className="text-xl">Round {room.currentRound}</p>
      </div>

      {/* scoreboard */}
      <div className="flex justify-between w-full mt-6">
        <div className="text-xl font-semibold">
          Team A: {room.scoreA}
        </div>
        <div className="text-xl font-semibold">
          Team B: {room.scoreB}
        </div>
      </div>

      {/* drawer & word */}
      <div className="mt-6">
        <p>
          <strong>Drawer:</strong> TBD
        </p>
        <p>
          <strong>Word:</strong> _______
        </p>
      </div>

      {/* canvas & chat */}
      <div className="flex flex-row gap-10 mt-8">
        <Canvas roomCode={code} />
        <div className="border-2 border-gray-400 w-[40%] h-[450px] rounded-lg flex items-center justify-center bg-white">
          Chat
        </div>
      </div>

      {/* guess box */}
      <div className="flex gap-3 mt-8">
        <input
          placeholder="Enter your guess..."
          className="border rounded px-3 py-2 w-80"
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Submit
        </button>
      </div>
    </main>
  )
}