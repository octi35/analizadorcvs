"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Crosshair,
  CheckCircle2,
  MinusCircle,
  Flag,
  MessageCircleQuestion,
} from "lucide-react";
import type { MatchObjetivo, Veredicto } from "@/lib/llm";

interface TargetMatchProps {
  match: MatchObjetivo;
}

const VERDICT_TONE: Record<
  Veredicto,
  { text: string; bar: string; bg: string; ring: string; pill: string }
> = {
  APTO: {
    text: "text-accent-green",
    bar: "bg-accent-green",
    bg: "bg-accent-green/5",
    ring: "border-accent-green/40",
    pill: "bg-accent-green/10 border-accent-green/40 text-accent-green",
  },
  "CON RESERVAS": {
    text: "text-accent-yellow",
    bar: "bg-accent-yellow",
    bg: "bg-accent-yellow/5",
    ring: "border-accent-yellow/40",
    pill: "bg-accent-yellow/10 border-accent-yellow/40 text-accent-yellow",
  },
  "NO APTO": {
    text: "text-accent-red",
    bar: "bg-accent-red",
    bg: "bg-accent-red/5",
    ring: "border-accent-red/40",
    pill: "bg-accent-red/10 border-accent-red/40 text-accent-red",
  },
};

function List({
  items,
  Icon,
  iconClass,
}: {
  items: string[];
  Icon: typeof CheckCircle2;
  iconClass: string;
}) {
  if (!items.length) return null;
  return (
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li
          key={i}
          className="flex gap-2 text-sm text-text/80 leading-relaxed"
        >
          <Icon className={`w-3.5 h-3.5 ${iconClass} flex-shrink-0 mt-1`} />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

export default function TargetMatch({ match }: TargetMatchProps) {
  const t = VERDICT_TONE[match.veredicto];
  const [w, setW] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setW(match.porcentaje_match), 80);
    return () => clearTimeout(id);
  }, [match.porcentaje_match]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.04 }}
      className={`border ${t.ring} ${t.bg} rounded-2xl p-6 sm:p-7`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-7 h-7 rounded-md ${t.bg} border ${t.ring} flex items-center justify-center`}>
            <Crosshair className={`w-4 h-4 ${t.text}`} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-mono text-text/40 uppercase tracking-wider">
              Match con puesto objetivo
            </div>
            <h3 className="font-display text-lg text-text truncate">
              {match.puesto}
            </h3>
          </div>
        </div>
        <span
          className={`font-mono text-[11px] px-2.5 py-1 rounded-full border ${t.pill} tracking-wider flex-shrink-0`}
        >
          {match.veredicto}
        </span>
      </div>

      <div className="flex items-end justify-between gap-3 mb-2">
        <div className="text-xs font-mono text-text/40 uppercase tracking-wider">
          Afinidad con el puesto
        </div>
        <div className={`font-mono text-2xl font-semibold ${t.text}`}>
          {match.porcentaje_match}
          <span className="text-sm text-text/30 font-normal">%</span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-border/60 overflow-hidden mb-5">
        <div
          className={`h-full ${t.bar} transition-[width] duration-[1200ms] ease-out`}
          style={{ width: `${w}%` }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        {match.fortalezas.length > 0 && (
          <div>
            <div className="text-xs font-mono text-accent-green uppercase tracking-wider mb-2">
              Fortalezas para el puesto
            </div>
            <List
              items={match.fortalezas}
              Icon={CheckCircle2}
              iconClass="text-accent-green"
            />
          </div>
        )}
        {match.gaps.length > 0 && (
          <div>
            <div className="text-xs font-mono text-accent-yellow uppercase tracking-wider mb-2">
              Gaps a cubrir
            </div>
            <List
              items={match.gaps}
              Icon={MinusCircle}
              iconClass="text-accent-yellow"
            />
          </div>
        )}
        {match.red_flags.length > 0 && (
          <div>
            <div className="text-xs font-mono text-accent-red uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Flag className="w-3 h-3" />
              Red flags (reclutador)
            </div>
            <List
              items={match.red_flags}
              Icon={Flag}
              iconClass="text-accent-red"
            />
          </div>
        )}
        {match.preguntas_entrevista.length > 0 && (
          <div>
            <div className="text-xs font-mono text-accent-blue uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MessageCircleQuestion className="w-3 h-3" />
              Preguntas de entrevista
            </div>
            <List
              items={match.preguntas_entrevista}
              Icon={MessageCircleQuestion}
              iconClass="text-accent-blue"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
