// canvas component for the game page

"use client";

import { RealtimeChannel } from "@supabase/supabase-js";
import { useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface CanvasProps {
  roomCode: string;
}

export default function Canvas({ roomCode }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawing = useRef(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // initialize the drawing context once
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";

    // store context in a ref to access it inside mouse handlers
    ctxRef.current = ctx;

    // create realtime channel & subscribe
    const channel = supabase.channel(`room:${roomCode}`)
    channelRef.current = channel;
    channel.subscribe((status) => {
      console.log("Realtime status:", status);
    });

    // unsubscribe on unmount
    return () => {
      channel.unsubscribe();
    };
  }, [roomCode]);

  // mouse down
  async function startDrawing(event: React.MouseEvent<HTMLCanvasElement>) {
    drawing.current = true;

    // get mouse coordinates
    const x = event.nativeEvent.offsetX;
    const y = event.nativeEvent.offsetY;

    beginStroke(x, y);

    // broadcast message
    await channelRef.current?.send({
      type: "broadcast",
      event: "drawing",
      payload: {
        type: "start",
        x,
        y,
      },
    });
  }

  // mouse move
  async function draw(event: React.MouseEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;

    // get mouse coordinates
    const x = event.nativeEvent.offsetX;
    const y = event.nativeEvent.offsetY;

    continueStroke(x, y);

    // broadcast message
    await channelRef.current?.send({
      type: "broadcast",
      event: "drawing",
      payload: {
        type: "draw",
        x,
        y,
      },
    });
  }

  async function stopDrawing() {
    drawing.current = false;
    endStroke();

    // broadcast message
    await channelRef.current?.send({
      type: "broadcast",
      event: "drawing",
      payload: {
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