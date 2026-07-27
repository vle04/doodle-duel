import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import TeamSelecter from "./teamSelector";
import LeaveRoomButton from "./leaveRoomButton";

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

  const teamAPlayers = room.players.filter(player => player.team === "A");
  const teamBPlayers = room.players.filter(player => player.team === "B");

  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-2 bg-white text-black">
      <h1 className="text-2xl font-bold mb-4">Room {room.code}</h1>

      <div className="flex flex-col items-center justify-center gap-4">
        <TeamSelecter roomCode={room.code} />
        <LeaveRoomButton roomCode={room.code} />
      </div>

      <div className="flex flex-col items-center mt-4 w-full max-w-md">
        <div className="mb-4 w-full">
          <h2>Team A</h2>
          <hr className="border-gray-300 w-full mb-4" />
          <ul>
            {teamAPlayers.map((player) => (
              <li key={player.id} className="">
                {player.profile.username}
                {player.profileId === room.hostId && (
                  <span className="ml-2 text-sm text-gray-500">(Host)</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-4 w-full">
          <h2>Team B</h2>
          <hr className="border-gray-300 w-full mb-4" />
          <ul>
            {teamBPlayers.map((player) => (
              <li key={player.id} className="">
                {player.profile.username}
                {player.profileId === room.hostId && (
                  <span className="ml-2 text-sm text-gray-500">(Host)</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}