// canvas component for the game page
// possibly add throttle for drawing events?
// add types for the payload?

"use client";

import { RealtimeChannel } from "@supabase/supabase-js";
import { useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface CanvasProps {
  roomCode: string;
  team: "A" | "B";
  userId: string;
  isDrawer: boolean;
}

export default function Canvas({ roomCode, team, userId, isDrawer }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawing = useRef(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // initialize the drawing context once
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || !userId) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";

    // store context in a ref to access it inside mouse handlers
    ctxRef.current = ctx;

    // create realtime channel & subscribe to the team-only channel
    const channel = supabase.channel(`room:${roomCode}:team:${team}`);

    // listen for broadcasts
    channel.on(
      "broadcast",
      { event: "drawing" },
      ({ payload }) => {
        if (payload.userId === userId) return;

        switch (payload.type) {
          case "start":
            beginStroke(payload.x, payload.y);
            break;

          case "draw":
            continueStroke(payload.x, payload.y);
            break;

          case "end":
            endStroke();
            break;
        }
      }
    );

    channel.subscribe((status) => {
      console.log("Realtime status:", status);
    });
    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [roomCode, team, userId]);

  // mouse down
  function startDrawing(event: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawer) return;

    drawing.current = true;

    // get mouse coordinates
    const x = event.nativeEvent.offsetX;
    const y = event.nativeEvent.offsetY;

    beginStroke(x, y);

    // broadcast message
    channelRef.current?.send({
      type: "broadcast",
      event: "drawing",
      payload: {
        userId,
        type: "start",
        x,
        y,
      },
    });
  }

  // mouse move
  function draw(event: React.MouseEvent<HTMLCanvasElement>) {
    if (!drawing.current || !isDrawer) return;

    // get mouse coordinates
    const x = event.nativeEvent.offsetX;
    const y = event.nativeEvent.offsetY;

    continueStroke(x, y);

    // broadcast message
    channelRef.current?.send({
      type: "broadcast",
      event: "drawing",
      payload: {
        userId,
        type: "draw",
        x,
        y,
      },
    });
  }

  function stopDrawing() {
    if (!isDrawer) return;

    drawing.current = false;
    endStroke();

    // broadcast message
    channelRef.current?.send({
      type: "broadcast",
      event: "drawing",
      payload: {
        userId,
        type: "end",
      },
    });
  }

  // drawing helper functions
  function beginStroke(x: number, y: number) {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function continueStroke(x: number, y: number) {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function endStroke() {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.closePath();
  }

  function clearCanvas() {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;

    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  return (  
    <canvas
      ref={canvasRef}
      width={700}
      height={500}
      className="border rounded-lg bg-white"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
    />
  )
}