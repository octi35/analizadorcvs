"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight } from "lucide-react";
import type { PuntoMejora } from "@/lib/llm";

interface ImprovementsListProps {
  items: PuntoMejora[];
}

export default function ImprovementsList({ items }: ImprovementsListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-card border border-border rounded-2xl p-6 sm:p-7"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-md bg-accent-yellow/10 border border-accent-yellow/40 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-accent-yellow" />
        </div>
        <h3 className="font-display text-lg text-text">Mejoras para tu CV</h3>
      </div>

      <ul className="space-y-4">
        {items.map((it, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="border-l-2 border-accent-yellow/50 pl-4 py-1"
          >
            <div className="font-mono text-[11px] text-accent-yellow uppercase tracking-wider mb-1.5">
              {it.seccion}
            </div>
            <div className="text-sm text-accent-red/90 mb-2 leading-relaxed">
              <span className="text-text/40 font-mono text-xs mr-1">
                problema:
              </span>
              {it.problema}
            </div>
            <div className="flex gap-2 text-sm text-accent-green/90 leading-relaxed">
              <ArrowRight className="w-3.5 h-3.5 mt-1 flex-shrink-0 text-accent-green" />
              <div>
                <span className="text-text/40 font-mono text-xs mr-1">
                  solución:
                </span>
                {it.solucion}
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
