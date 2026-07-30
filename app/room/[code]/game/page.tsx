// page for the game loop

import { prisma } from "@/lib/prisma"; 
import { notFound, redirect } from "next/navigation";
import { RoomStatus } from "@/app/generated/prisma/enums";

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
    }
  });

  if (!room) {
    notFound();
  }

  if (room.status !== RoomStatus.PLAYING) {
    redirect(`/room/${code}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-3xl font-bold">
        Game Started!
      </h1>
    </main>
  )
}