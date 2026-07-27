"use client";

import { useState } from "react";

const COLORS = ["#FF6B5B", "#7C3AED", "#22C55E", "#F59E0B"];

interface ConfettiPiece {
  id: number;
  color: string;
  left: number;
  tx: number;
  ty: number;
  rot: number;
  delay: number;
}

function makePieces(count: number): ConfettiPiece[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    color: COLORS[i % COLORS.length],
    left: 35 + Math.random() * 30,
    tx: (Math.random() - 0.5) * 320,
    ty: -(140 + Math.random() * 220),
    rot: Math.random() * 720 - 360,
    delay: Math.random() * 0.15,
  }));
}

export default function ConfettiBurst({ show }: { show: boolean }) {
  const [pieces] = useState(() => makePieces(28));

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[80] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-1/2 h-2.5 w-2.5 rounded-sm"
          style={
            {
              left: `${p.left}%`,
              backgroundColor: p.color,
              animation: `confetti-burst 900ms ease-out ${p.delay}s forwards`,
              "--tx": `${p.tx}px`,
              "--ty": `${p.ty}px`,
              "--rot": `${p.rot}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
