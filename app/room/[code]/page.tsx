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
  });

  if (!room) {
    notFound();
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-2 bg-white text-black">
      <h1>Room {room.code}</h1>
    </main>
  );
}