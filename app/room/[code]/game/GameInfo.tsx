"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface GameInfoProps {
  drawerAId: string;
  drawerBId: string;
  drawerAUsername: string;
  drawerBUsername: string;
  secretWord?: string | null;
}

export default function GameInfo({ drawerAId, drawerBId, drawerAUsername, drawerBUsername, secretWord }: GameInfoProps) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  const isDrawer =
    userId !== null && (userId === drawerAId || userId === drawerBId);

  return (
    <div className="mt-6">
      <p>
        <strong>Drawer:</strong> {drawerAUsername} / {drawerBUsername}
      </p>
      <p>
        <strong>Word:</strong> {isDrawer ? secretWord ?? "_____" : "_____"}
      </p>
    </div>
  );
}
