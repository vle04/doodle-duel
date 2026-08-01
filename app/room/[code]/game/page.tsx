// page for the game loop

import { prisma } from "@/lib/prisma"; 
import { notFound, redirect } from "next/navigation";
import { RoomStatus } from "@/app/generated/prisma/enums";
import TeamCanvas from "./TeamCanvas";
import GameInfo from "./GameInfo";
import GuessBox from "./GuessBox";

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
          profile: true,
        },
      },
      rounds: {
        orderBy: {
          number: "desc",
        },
        take: 1,
        include: {
          secret: true,
          drawerA: true,
          drawerB: true,
        },
      },
    },
  });

  if (!room) notFound();
  if (room.status !== RoomStatus.PLAYING) redirect(`/room/${code}`);

  const currentRound = room.rounds[0];

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

      <GameInfo
        drawerAId={currentRound.drawerAId}
        drawerBId={currentRound.drawerBId}
        drawerAUsername={currentRound.drawerA.username}
        drawerBUsername={currentRound.drawerB.username}
        secretWord={currentRound.secret?.word}
      />

      {/* canvas & chat */}
      <div className="flex flex-row gap-10 mt-8 items-center">
        <TeamCanvas
          roomCode={code}
          roomPlayers={room.players.map((player) => ({
            profileId: player.profileId,
            team: player.team,
          }))}
          drawerAId={currentRound.drawerAId}
          drawerBId={currentRound.drawerBId}
        />
        <div className="border-2 border-gray-400 w-[40%] h-[450px] rounded-lg flex items-center justify-center bg-white">
          Chat
        </div>
      </div>

      {/* guess box */}
      <GuessBox roomCode={code} />
    </main>
  )
}