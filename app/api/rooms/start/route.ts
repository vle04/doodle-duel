// api route for starting a game. should only be allowed by the host

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RoomStatus } from "@/app/generated/prisma/enums";

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

    // update the room status
    await prisma.room.update({
      where: {
        id: room.id
      },
      data: {
        status: RoomStatus.PLAYING
      }
    });

    return NextResponse.json({ success: true, message: "Game start successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to start game" }, { status: 500 });
  }
}