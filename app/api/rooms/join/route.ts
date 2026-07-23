// api route for joining a room, should accept room code
// user enters code -> find room by code -> create RoomPlayer -> redirect to lobby

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, roomCode } = await req.json();

    // validate request
    if (!userId || !roomCode) {
      return NextResponse.json({ error: "Missing userId or roomCode" }, { status: 400 });
    }

    // find the room by code
    const room = await prisma.room.findUnique({
      where: {
        code: roomCode,
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // check if the user is already in the room
    const existingPlayer = await prisma.roomPlayer.findUnique({
      where: {
        roomId_profileId: {
          roomId: room.id,
          profileId: userId,
        },
      },
    });

    // add the user to the room
    if (!existingPlayer) {
      await prisma.roomPlayer.create({
        data: {
          roomId: room.id,
          profileId: userId,
        },
      });
    }

    return NextResponse.json({ roomCode: room.code });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}