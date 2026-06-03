"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target } from "lucide-react";
import type { RoleMatch } from "@/lib/llm";

interface RoleMatchesProps {
  roles: RoleMatch[];
}

function tone(pct: number) {
  if (pct >= 75) {
    return {
      bar: "bg-accent-green",
      text: "text-accent-green",
      ring: "border-accent-green/40",
      bg: "bg-accent-green/5",
    };
  }
  if (pct >= 50) {
    return {
      bar: "bg-accent-yellow",
      text: "text-accent-yellow",
      ring: "border-accent-yellow/40",
      bg: "bg-accent-yellow/5",
    };
  }
  return {
    bar: "bg-accent-red",
    text: "text-accent-red",
    ring: "border-accent-red/40",
    bg: "bg-accent-red/5",
  };
}

function MatchBar({ pct, color }: { pct: number; color: string }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 80);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div className="h-2 rounded-full bg-border/60 overflow-hidden">
      <div
        className={`h-full ${color} transition-[width] duration-[1200ms] ease-out`}
        style={{ width: `${w}%` }}
      />
    </div>
  );
}

export default function RoleMatches({ roles }: RoleMatchesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="bg-card border border-border rounded-2xl p-6 sm:p-7"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-md bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center">
          <Target className="w-4 h-4 text-accent-blue" />
        </div>
        <h3 className="font-display text-lg text-text">Roles compatibles</h3>
      </div>

      <div className="space-y-4">
        {roles.map((r, i) => {
          const t = tone(r.porcentaje_match);
          return (
            <motion.div
              key={`${r.puesto}-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              className={`border ${t.ring} ${t.bg} rounded-xl p-4`}
            >
              <div className="flex items-baseline justify-between gap-3 mb-2">
                <div className="font-display text-base sm:text-lg text-text">
                  {r.puesto}
                </div>
                <div className={`font-mono text-lg font-semibold ${t.text}`}>
                  {r.porcentaje_match}%
                </div>
              </div>
              <MatchBar pct={r.porcentaje_match} color={t.bar} />
              {r.motivo && (
                <p className="mt-3 text-sm text-text/70 leading-relaxed">
                  {r.motivo}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
