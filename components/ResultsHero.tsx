"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Target,
  ClipboardCheck,
  Wrench,
  Lightbulb,
} from "lucide-react";
import type { AnalysisResult as Analysis } from "@/lib/llm";
import ScoreRing from "./ScoreRing";

function tone(v: number) {
  if (v >= 75) return "text-accent-green";
  if (v >= 50) return "text-accent-yellow";
  return "text-accent-red";
}

function StatCard({
  Icon,
  value,
  label,
  sub,
  color = "text-accent-blue",
}: {
  Icon: typeof Target;
  value: string | number;
  label: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg/40 p-3 sm:p-4 flex flex-col gap-1">
      <Icon className={`w-4 h-4 ${color}`} />
      <div className="flex items-baseline gap-1">
        <span className={`font-mono text-xl sm:text-2xl font-bold ${color}`}>
          {value}
        </span>
        {sub && <span className="font-mono text-xs text-text/40">{sub}</span>}
      </div>
      <div className="text-[10px] sm:text-[11px] font-mono text-text/45 uppercase tracking-wider leading-tight">
        {label}
      </div>
    </div>
  );
}

export default function ResultsHero({ analysis }: { analysis: Analysis }) {
  const match = analysis.match_objetivo;
  const reqs = analysis.requisitos_check;
  const reqOk = reqs.filter((r) => r.cumple === "Sí").length;
  const bestRole = analysis.roles_compatibles[0]?.porcentaje_match ?? 0;

  // Métrica principal: match contra el puesto si existe, si no el ATS.
  const primaryValue = match ? match.porcentaje_match : analysis.ats.score;
  const primaryLabel = match ? "Match puesto" : "Score ATS";
  const primaryColor = tone(primaryValue);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl border border-border bg-card p-5 sm:p-7"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
        {/* Anillo principal */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0 self-center">
          <ScoreRing
            value={primaryValue}
            size={140}
            colorClass={primaryColor}
            label={primaryLabel}
          />
          {match && (
            <span
              className={`font-mono text-[11px] px-3 py-1 rounded-full border border-border bg-bg/40 ${primaryColor}`}
            >
              {match.veredicto}
            </span>
          )}
        </div>

        {/* Grid de stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 flex-1 w-full">
          <StatCard
            Icon={ShieldCheck}
            value={analysis.ats.score}
            sub="/100"
            label="ATS"
            color={tone(analysis.ats.score)}
          />
          {match ? (
            <StatCard
              Icon={Target}
              value={`${match.porcentaje_match}%`}
              label="Afinidad puesto"
              color={tone(match.porcentaje_match)}
            />
          ) : (
            <StatCard
              Icon={Target}
              value={`${bestRole}%`}
              label="Mejor rol"
              color={tone(bestRole)}
            />
          )}
          {reqs.length > 0 && (
            <StatCard
              Icon={ClipboardCheck}
              value={reqOk}
              sub={`/${reqs.length}`}
              label="Requisitos"
              color={
                reqOk === reqs.length
                  ? "text-accent-green"
                  : reqOk === 0
                    ? "text-accent-red"
                    : "text-accent-yellow"
              }
            />
          )}
          <StatCard
            Icon={Target}
            value={analysis.roles_compatibles.length}
            label="Roles afines"
          />
          <StatCard
            Icon={Lightbulb}
            value={analysis.puntos_mejora_cv.length}
            label="Mejoras"
            color="text-accent-yellow"
          />
          <StatCard
            Icon={Wrench}
            value={analysis.habilidades_a_sumar.length}
            label="Skills a sumar"
          />
        </div>
      </div>
    </motion.div>
  );
}
