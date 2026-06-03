"use client";

import { motion } from "framer-motion";
import { Rocket, Wrench, Sparkles } from "lucide-react";
import type { HabilidadSumar, Prioridad } from "@/lib/llm";

interface SkillsRoadmapProps {
  items: HabilidadSumar[];
}

const PRIO_STYLES: Record<Prioridad, { label: string; cls: string }> = {
  Alta: {
    label: "ALTA",
    cls: "bg-accent-red/10 text-accent-red border-accent-red/40",
  },
  Media: {
    label: "MEDIA",
    cls: "bg-accent-yellow/10 text-accent-yellow border-accent-yellow/40",
  },
  Baja: {
    label: "BAJA",
    cls: "bg-accent-green/10 text-accent-green border-accent-green/40",
  },
};

export default function SkillsRoadmap({ items }: SkillsRoadmapProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-card border border-border rounded-2xl p-6 sm:p-7"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-md bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center">
          <Rocket className="w-4 h-4 text-accent-blue" />
        </div>
        <h3 className="font-display text-lg text-text">Plan de crecimiento</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((h, i) => {
          const prio = PRIO_STYLES[h.prioridad];
          const Icon = h.tipo === "Technical" ? Wrench : Sparkles;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="border border-border rounded-xl p-4 bg-bg/40 hover:border-accent-blue/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="w-3.5 h-3.5 text-accent-blue flex-shrink-0" />
                  <div className="font-display text-[15px] text-text truncate">
                    {h.habilidad}
                  </div>
                </div>
                <span
                  className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${prio.cls} flex-shrink-0`}
                >
                  {prio.label}
                </span>
              </div>
              <div className="text-[11px] font-mono text-text/40 uppercase tracking-wider mb-1.5">
                {h.tipo === "Technical" ? "Técnica" : "Blanda"}
              </div>
              <p className="text-sm text-text/75 leading-relaxed">
                {h.recurso_sugerido}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
