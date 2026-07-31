// canvas component for the game page

"use client";

import { useRef, useEffect } from "react";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawing = useRef(false);

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
  }, []);

  // mouse down
  function startDrawing(event: React.MouseEvent<HTMLCanvasElement>) {
    const ctx = ctxRef.current;
    if (!ctx) return;

    drawing.current = true;

    // get mouse coordinates
    const x = event.nativeEvent.offsetX;
    const y = event.nativeEvent.offsetY;

    // move the drawing cursor to the starting point
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  // mouse move
  function draw(event: React.MouseEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;

    const ctx = ctxRef.current;
    if (!ctx) return;

    // get mouse coordinates
    const x = event.nativeEvent.offsetX;
    const y = event.nativeEvent.offsetY;

    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function stopDrawing() {
    drawing.current = false;

    const ctx = ctxRef.current;
    if (!ctx) return;

    // finish the path
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