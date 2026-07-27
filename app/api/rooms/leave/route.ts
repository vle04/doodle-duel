// api route for leaving a lobby

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, roomCode } = await req.json();
    if (!userId || !roomCode) {
      return NextResponse.json(
        { error: "Missing userId or roomCode" },
        { status: 400 }
      );
    }

    const room = await prisma.room.findUnique({
      where: {
        code: roomCode
      }
    });

    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    // remove the player from the room
    await prisma.roomPlayer.delete({
      where: {
        roomId_profileId: {
          roomId: room.id,
          profileId: userId
        },
      },
    });

    // if the host leaves, delete the room
    if (room.hostId === userId) {
      await prisma.room.delete({
        where: {
          id: room.id
        }
      });
    }

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to leave room" },
      { status: 500 }
    );
  }
}