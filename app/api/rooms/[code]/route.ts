import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const room = await prisma.room.findUnique({
    where: { code },
    include: {
      players: {
        include: {
          profile: true,
        },
      },
      rounds: {
        orderBy: {
          number: "desc",
        },
        take: 1,
        include: {
          secret: true,
          drawerA: true,
          drawerB: true,
        },
      },
    },
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  return NextResponse.json(room);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const body = await req.json();

  const allowedUpdates = ["status", "currentRound", "scoreA", "scoreB"] as const;
  const data: Record<string, unknown> = {};

  for (const field of allowedUpdates) {
    if (field in body) {
      data[field] = body[field];
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  const room = await prisma.room.findUnique({ where: { code } });
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const updatedRoom = await prisma.room.update({
    where: { code },
    data,
  });

  return NextResponse.json(updatedRoom);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const room = await prisma.room.findUnique({ where: { code } });
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  await prisma.room.delete({ where: { code } });
  return NextResponse.json({ success: true });
}
