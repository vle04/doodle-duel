// api route for starting a game. should only be allowed by the host

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RoomStatus } from "@/app/generated/prisma/enums";
import { WORDS } from "@/lib/words";

export async function POST(req: NextRequest) {
  try {
    const { userId, roomCode } = await req.json();
    
    // validate request
    if (!userId || !roomCode) {
      return NextResponse.json({ error: "Missing userId or roomCode" }, { status: 400 });
    }

    // find the room
    const room = await prisma.room.findUnique({
      where: {
        code: roomCode,
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // verify the requester is the host
    if (room.hostId !== userId) {
      return NextResponse.json({ error: "Requester is not the host" }, { status: 403 });
    }

    // don't start an already started game
    if (room.status === RoomStatus.PLAYING) {
      return NextResponse.json({ error: "Game has already started" }, { status: 400 });
    }

    // get players
    const players = await prisma.roomPlayer.findMany({
      where: {
        roomId: room.id,
      },
    });

    // split teams
    const teamAPlayers = players.filter((player) => player.team === "A");
    const teamBPlayers = players.filter((player) => player.team === "B");

    if (teamAPlayers.length === 0 || teamBPlayers.length === 0) {
      return NextResponse.json(
        { error: "Both teams need at least one player" },
        { status: 400 }
      );
    }

    // pick drawers
    const drawerA = teamAPlayers[Math.floor(Math.random() * teamAPlayers.length)];
    const drawerB = teamBPlayers[Math.floor(Math.random() * teamBPlayers.length)];

    // pick word
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];

    // create the round
    const round = await prisma.round.create({
      data: {
        roomId: room.id,
        number: 1,
        drawerAId: drawerA.profileId,
        drawerBId: drawerB.profileId,
        wordChooserTeam: "A",
        secret: {
          create: {
            word,
          },
        },
        startedAt: new Date(),
      },
    });

    // update the room status
    const updatedRoom = await prisma.room.update({
      where: {
        id: room.id,
      },
      data: {
        status: RoomStatus.PLAYING,
        currentRound: 1,
      }
    });

    console.log(updatedRoom?.status);

    return NextResponse.json({ success: true, message: "Game start successfully" });
  } catch (error) {
    console.error("START GAME ERROR:", error);
    return NextResponse.json({ error: "Failed to start game" }, { status: 500 });
  }
}