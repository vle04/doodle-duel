// api route for joining a room, should accept room code
// user enters code -> find room by code -> create RoomPlayer -> redirect to lobby

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, roomCode, team } = await req.json();

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
    let roomPlayer = await prisma.roomPlayer.findUnique({
      where: {
        roomId_profileId: {
          roomId: room.id,
          profileId: userId,
        },
      },
    });

    if (!roomPlayer) {
      roomPlayer = await prisma.roomPlayer.create({
        data: {
          roomId: room.id,
          profileId: userId,
        },
      });
    }

    const updatedPlayers = await prisma.roomPlayer.findMany({
      where: {
        roomId: room.id,
      },
      include: {
        profile: true,
      },
    });

    const supabase = await createClient();

    await supabase.channel(`room:${roomCode}`).send({
      type: "broadcast",
      event: "room-update",
      payload: {
        players: updatedPlayers,
      },
    });

    return NextResponse.json({ code: room.code });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}