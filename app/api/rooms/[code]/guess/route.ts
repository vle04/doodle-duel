import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { roomCode, userId, guess } = await req.json();

    // validate request
    if (!roomCode || !userId || !guess) {
      return NextResponse.json({ error: "Missing roomCode, userId, or guess" }, { status: 400 });
    }

    // find the room and current round
    const room = await prisma.room.findUnique({
      where: {
        code: roomCode,
      },
      include: {
        rounds: {
          orderBy: {
            number: "desc",
          },
          take: 1,
          include: {
            secret: true,
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const currentRound = room.rounds[0];

    if (!currentRound || !currentRound.secret) {
      return NextResponse.json({ error: "No active round found" }, { status: 400 });
    }

    // prevent guesses after the round ends
    if (currentRound.winner !== "NONE") {
      return NextResponse.json({ error: "Round has already ended" }, { status: 400 });
    }

    // find player in room
    const player = await prisma.roomPlayer.findUnique({
      where: {
        roomId_profileId: {
          roomId: room.id,
          profileId: userId,
        },
      },
    });

    if (!player) {
      return NextResponse.json({ error: "Player not found in this room" }, { status: 404 });
    }

    // check guess
    const isCorrectGuess = guess.trim().toLowerCase() === currentRound.secret.word.toLowerCase();

    // save guess
    await prisma.guess.create({
      data: {
        roundId: currentRound.id,
        profileId: userId,
        text: guess,
        isCorrect: isCorrectGuess,
      },
    });

    // incorrect guess
    if (!isCorrectGuess) {
      return NextResponse.json({ message: "Incorrect guess!", correct: false });
    }

    // a player can technically have no team according to the schema, but this should not happen in a normal game flow
    if (!player.team) {
      return NextResponse.json({ error: "Player is not assigned to a team" }, { status: 400 });
    }

    // update round winner
    await prisma.round.update({
      where: {
        id: currentRound.id,
      },
      data: {
        winner: player.team!,
        endedAt: new Date(),
      },
    });

    // update team score
    const updatedRoom = await prisma.room.update({
      where: {
        id: room.id,
      },
      data: {
        scoreA: player.team === "A" ? { increment: 1 } : undefined,
        scoreB: player.team === "B" ? { increment: 1 } : undefined,
      },
    });

    return NextResponse.json({
      message: "Correct guess!",
      correct: true,
      winnerTeam: player.team,
      updatedRoom,
    });

  } catch (error) {
    console.error("Error processing guess:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}