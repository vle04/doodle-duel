// signup -> supabase user created -> create profile -> done
// keeps prisma on the server

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { id, email } = await req.json();

  // use upsert; if profile already exists, it won't create duplicate
  const profile = await prisma.profile.upsert({
    where: {
      id,
    },
    update: {},
    create: {
      id,
      // this makes it possible for users to have the same username
      // can change later to choose name during signup
      username: email?.split("@")[0] || "user", // temporary username
    },
  });

  return NextResponse.json(profile);
}