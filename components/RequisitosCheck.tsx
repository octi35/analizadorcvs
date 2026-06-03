"use client";

import { motion } from "framer-motion";
import { ClipboardCheck, Check, AlertTriangle, X } from "lucide-react";
import type { RequisitoCheck, CumpleEstado } from "@/lib/llm";

interface RequisitosCheckProps {
  items: RequisitoCheck[];
}

const STYLE: Record<
  CumpleEstado,
  { Icon: typeof Check; pill: string; iconCls: string; label: string }
> = {
  Sí: {
    Icon: Check,
    pill: "bg-accent-green/10 border-accent-green/40 text-accent-green",
    iconCls: "text-accent-green",
    label: "CUMPLE",
  },
  Parcial: {
    Icon: AlertTriangle,
    pill: "bg-accent-yellow/10 border-accent-yellow/40 text-accent-yellow",
    iconCls: "text-accent-yellow",
    label: "PARCIAL",
  },
  No: {
    Icon: X,
    pill: "bg-accent-red/10 border-accent-red/40 text-accent-red",
    iconCls: "text-accent-red",
    label: "NO CUMPLE",
  },
};

export default function RequisitosCheck({ items }: RequisitosCheckProps) {
  if (!items.length) return null;

  const counts = items.reduce<Record<CumpleEstado, number>>(
    (acc, it) => {
      acc[it.cumple] = (acc[it.cumple] || 0) + 1;
      return acc;
    },
    { Sí: 0, Parcial: 0, No: 0 }
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.06 }}
      className="bg-card border border-border rounded-2xl p-5 sm:p-7"
    >
      <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-md bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center">
            <ClipboardCheck className="w-4 h-4 text-accent-blue" />
          </div>
          <h3 className="font-display text-base sm:text-lg text-text">
            Checklist de requisitos
          </h3>
        </div>
        <div className="flex gap-1.5 font-mono text-[10px] sm:text-[11px]">
          <span className={`px-2 py-0.5 rounded-full border ${STYLE.Sí.pill}`}>
            {counts["Sí"]} cumple
          </span>
          <span
            className={`px-2 py-0.5 rounded-full border ${STYLE.Parcial.pill}`}
          >
            {counts.Parcial} parcial
          </span>
          <span className={`px-2 py-0.5 rounded-full border ${STYLE.No.pill}`}>
            {counts.No} falta
          </span>
        </div>
      </div>

      <ul className="space-y-3">
        {items.map((it, i) => {
          const s = STYLE[it.cumple];
          return (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="flex gap-3 border border-border rounded-xl p-3 sm:p-4 bg-bg/40"
            >
              <div
                className={`w-6 h-6 rounded-md border ${s.pill} flex items-center justify-center flex-shrink-0 mt-0.5`}
              >
                <s.Icon className={`w-3.5 h-3.5 ${s.iconCls}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-1">
                  <span className="text-text text-sm sm:text-[15px] font-medium leading-snug">
                    {it.requisito}
                  </span>
                  <span
                    className={`font-mono text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full border ${s.pill} tracking-wider flex-shrink-0`}
                  >
                    {s.label}
                  </span>
                </div>
                {it.evidencia && (
                  <p className="text-xs sm:text-sm text-text/60 leading-relaxed">
                    <span className="text-text/40 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider mr-1">
                      evidencia:
                    </span>
                    {it.evidencia}
                  </p>
                )}
              </div>
            </motion.li>
          );
        })}
      </ul>
    </motion.div>
  );
}
