import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// helper function to generate a random room code
// can add collision checking later
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(req: NextRequest) {
  try {
    // get the currently logged in user
    const { hostId } = await req.json();

    // create the room 
    const room = await prisma.room.create({
      data: {
        code: generateRoomCode(),
        hostId,
      },
    });

    // add the host as the first player in the room
    await prisma.roomPlayer.create({
      data: {
        roomId: room.id,
        profileId: hostId,
      },
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}