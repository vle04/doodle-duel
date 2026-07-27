// api route for choosing which team to join, should accept team name, room code, and userId

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, roomCode, team } = await req.json();

    // validate request
    if (!userId || !roomCode || !team) {
      return NextResponse.json({ error: "Missing userId, roomCode, or team" }, { status: 400 });
    }

    // validate team name
    if (team !== "A" && team !== "B") {
      return NextResponse.json({ error: "Invalid team" }, { status: 400 });
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

    // finds the room player
    const roomPlayer = await prisma.roomPlayer.findUnique({
      where: {
        roomId_profileId: {
          roomId: room.id,
          profileId: userId,
        },
      },
    });

    if (!roomPlayer) {
      return NextResponse.json({ error: "User is not in the room" }, { status: 404 });
    }

    // update the team of the user
    await prisma.roomPlayer.update({
      where: {
        id: roomPlayer.id,
      },
      data: {
        team,
      },
    });

    return NextResponse.json({ message: "Joined team successfully", success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to join team" }, { status: 500 });
  }
}