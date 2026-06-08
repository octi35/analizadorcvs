"use client";

import { useEffect, useState } from "react";

interface ScoreRingProps {
  value: number; // 0-100
  size?: number;
  stroke?: number;
  suffix?: string;
  label?: string;
  /** tailwind text-* color para el progreso y el número */
  colorClass?: string;
  /** color CSS para el trazo del arco (default usa currentColor del colorClass) */
}

const R = 45;
const CIRC = 2 * Math.PI * R; // ≈ 283

export default function ScoreRing({
  value,
  size = 120,
  stroke = 9,
  suffix = "%",
  label,
  colorClass = "text-accent-blue",
}: ScoreRingProps) {
  const v = Math.max(0, Math.min(100, value));
  const [offset, setOffset] = useState(CIRC);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => setOffset(CIRC * (1 - v / 100)), 120);
    // animación numérica
    const start = performance.now();
    const dur = 1400;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(v * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      clearTimeout(id);
      cancelAnimationFrame(raf);
    };
  }, [v]);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={colorClass}
      >
        <circle className="score-track" cx="50" cy="50" r={R} strokeWidth={stroke} />
        <circle
          className="score-progress"
          cx="50"
          cy="50"
          r={R}
          strokeWidth={stroke}
          stroke="currentColor"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={`font-mono font-bold leading-none ${colorClass}`} style={{ fontSize: size * 0.26 }}>
          {display}
          <span className="text-text/30 font-normal" style={{ fontSize: size * 0.13 }}>
            {suffix}
          </span>
        </div>
        {label && (
          <div className="mt-1 text-[10px] font-mono text-text/40 uppercase tracking-wider">
            {label}
          </div>
        )}
      </div>
    </div>
  );
}
