import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const roomCode = req.nextUrl.pathname.split("/")[3];
    const team = req.nextUrl.searchParams.get("team");

    if (!roomCode) {
      return NextResponse.json({ error: "Missing roomCode" }, { status: 400 });
    }

    if (team && team !== "A" && team !== "B") {
      return NextResponse.json({ error: "Invalid team" }, { status: 400 });
    }

    const room = await prisma.room.findUnique({
      where: {
        code: roomCode,
      },
      include: {
        players: true,
        rounds: {
          orderBy: {
            number: "desc",
          },
          take: 1,
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const currentRound = room.rounds[0];

    if (!currentRound) {
      return NextResponse.json({ error: "No active round found" }, { status: 404 });
    }

    const guesses = await prisma.guess.findMany({
      where: {
        roundId: currentRound.id,
      },
      include: {
        profile: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const playerMap = new Map(
      room.players.map((player) => [player.profileId, player.team])
    );

    const messages = guesses.map((guess) => ({
      id: guess.id,
      userId: guess.profileId,
      username: guess.profile.username,
      text: guess.text,
      createdAt: guess.createdAt.toISOString(),
      team: playerMap.get(guess.profileId) ?? null,
    }));

    return NextResponse.json({
      messages: team ? messages.filter((message) => message.team === team) : messages,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load guesses" }, { status: 500 });
  }
}
