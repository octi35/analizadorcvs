"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, ShieldX, AlertCircle, CheckCircle2 } from "lucide-react";
import type { AtsCheck, AtsEstado } from "@/lib/llm";

interface ATSCheckProps {
  ats: AtsCheck;
}

const TONE: Record<
  AtsEstado,
  {
    Icon: typeof ShieldCheck;
    text: string;
    bar: string;
    bg: string;
    ring: string;
    pill: string;
    label: string;
  }
> = {
  PASA: {
    Icon: ShieldCheck,
    text: "text-accent-green",
    bar: "bg-accent-green",
    bg: "bg-accent-green/5",
    ring: "border-accent-green/40",
    pill: "bg-accent-green/10 border-accent-green/40 text-accent-green",
    label: "PASA",
  },
  PARCIAL: {
    Icon: ShieldAlert,
    text: "text-accent-yellow",
    bar: "bg-accent-yellow",
    bg: "bg-accent-yellow/5",
    ring: "border-accent-yellow/40",
    pill: "bg-accent-yellow/10 border-accent-yellow/40 text-accent-yellow",
    label: "PARCIAL",
  },
  "NO PASA": {
    Icon: ShieldX,
    text: "text-accent-red",
    bar: "bg-accent-red",
    bg: "bg-accent-red/5",
    ring: "border-accent-red/40",
    pill: "bg-accent-red/10 border-accent-red/40 text-accent-red",
    label: "NO PASA",
  },
};

export default function ATSCheck({ ats }: ATSCheckProps) {
  const t = TONE[ats.estado];
  const [w, setW] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setW(ats.score), 80);
    return () => clearTimeout(id);
  }, [ats.score]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.03 }}
      className={`border ${t.ring} ${t.bg} rounded-2xl p-6 sm:p-7`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-md ${t.bg} border ${t.ring} flex items-center justify-center`}>
            <t.Icon className={`w-4 h-4 ${t.text}`} />
          </div>
          <h3 className="font-display text-lg text-text">Filtros ATS</h3>
        </div>
        <span
          className={`font-mono text-[11px] px-2.5 py-1 rounded-full border ${t.pill} tracking-wider`}
        >
          {t.label}
        </span>
      </div>

      <div className="flex items-end justify-between gap-3 mb-2">
        <div className="text-xs font-mono text-text/40 uppercase tracking-wider">
          Score de compatibilidad
        </div>
        <div className={`font-mono text-2xl font-semibold ${t.text}`}>
          {ats.score}
          <span className="text-sm text-text/30 font-normal">/100</span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-border/60 overflow-hidden mb-5">
        <div
          className={`h-full ${t.bar} transition-[width] duration-[1200ms] ease-out`}
          style={{ width: `${w}%` }}
        />
      </div>

      {ats.problemas.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-mono text-text/40 uppercase tracking-wider mb-2">
            Problemas detectados
          </div>
          <ul className="space-y-2">
            {ats.problemas.map((p, i) => (
              <li
                key={i}
                className="flex gap-2 text-sm text-text/80 leading-relaxed"
              >
                <AlertCircle className="w-3.5 h-3.5 text-accent-red flex-shrink-0 mt-1" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {ats.recomendaciones.length > 0 && (
        <div>
          <div className="text-xs font-mono text-text/40 uppercase tracking-wider mb-2">
            Cómo mejorar
          </div>
          <ul className="space-y-2">
            {ats.recomendaciones.map((p, i) => (
              <li
                key={i}
                className="flex gap-2 text-sm text-text/80 leading-relaxed"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-green flex-shrink-0 mt-1" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
