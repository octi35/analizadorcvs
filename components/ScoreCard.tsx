"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Verdict } from "@/lib/claude";

const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const VERDICT_STYLES: Record<
  Verdict,
  { color: string; bg: string; border: string; label: string }
> = {
  APTO: {
    color: "text-accent-green",
    bg: "bg-accent-green/10",
    border: "border-accent-green/40",
    label: "APTO",
  },
  "APTO CON RESERVAS": {
    color: "text-accent-yellow",
    bg: "bg-accent-yellow/10",
    border: "border-accent-yellow/40",
    label: "APTO CON RESERVAS",
  },
  "NO APTO": {
    color: "text-accent-red",
    bg: "bg-accent-red/10",
    border: "border-accent-red/40",
    label: "NO APTO",
  },
};

interface ScoreCardProps {
  score: number;
  verdict: Verdict;
  verdictReason: string;
  position: string;
}

export default function ScoreCard({
  score,
  verdict,
  verdictReason,
  position,
}: ScoreCardProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const styles = VERDICT_STYLES[verdict];

  const arcColor =
    verdict === "APTO"
      ? "#22c55e"
      : verdict === "APTO CON RESERVAS"
      ? "#f59e0b"
      : "#ef4444";

  useEffect(() => {
    const duration = 1600;
    const startTime = performance.now();
    let raf = 0;

    const tick = (t: number) => {
      const elapsed = t - startTime;
      const ratio = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - ratio, 3);
      setDisplayScore(Math.round(eased * score));
      setProgress(eased * score);
      if (ratio < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const offset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card border border-border rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-8"
    >
      <div className="relative w-[180px] h-[180px] flex-shrink-0">
        <svg width="180" height="180" viewBox="0 0 180 180">
          <circle
            cx="90"
            cy="90"
            r={RADIUS}
            className="score-track"
            strokeWidth="10"
          />
          <circle
            cx="90"
            cy="90"
            r={RADIUS}
            className="score-progress"
            stroke={arcColor}
            strokeWidth="10"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-mono font-semibold text-5xl text-text">
            {displayScore}
          </div>
          <div className="font-mono text-xs text-text/40 mt-1">/ 100</div>
        </div>
      </div>

      <div className="flex-1 text-center sm:text-left">
        <div className="text-xs font-mono text-text/40 uppercase tracking-wider mb-2">
          Puesto evaluado
        </div>
        <div className="font-display text-2xl text-text mb-4">{position}</div>

        <div
          className={`inline-flex items-center px-3 py-1.5 rounded-full border ${styles.bg} ${styles.border} ${styles.color} font-mono text-xs tracking-wider mb-3`}
        >
          {styles.label}
        </div>
        <p className="text-sm text-text/70 leading-relaxed">{verdictReason}</p>
      </div>
    </motion.div>
  );
}
