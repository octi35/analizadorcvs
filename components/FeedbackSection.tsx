"use client";

import { motion } from "framer-motion";
import { Check, X, Lightbulb, Hash } from "lucide-react";

interface FeedbackSectionProps {
  strengths: string[];
  weaknesses: string[];
  improvements: { area: string; suggestion: string }[];
  keywords: string[];
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35 },
  }),
};

export default function FeedbackSection({
  strengths,
  weaknesses,
  improvements,
  keywords,
}: FeedbackSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-md bg-accent-green/10 border border-accent-green/30 flex items-center justify-center">
              <Check className="w-4 h-4 text-accent-green" />
            </div>
            <h3 className="font-display text-lg text-text">Puntos fuertes</h3>
          </div>
          <ul className="space-y-3">
            {strengths.map((s, i) => (
              <motion.li
                key={i}
                custom={i}
                initial="hidden"
                animate="show"
                variants={itemVariants}
                className="flex gap-3 text-sm text-text/80 leading-relaxed"
              >
                <Check className="w-4 h-4 text-accent-green flex-shrink-0 mt-0.5" />
                <span>{s}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-md bg-accent-red/10 border border-accent-red/30 flex items-center justify-center">
              <X className="w-4 h-4 text-accent-red" />
            </div>
            <h3 className="font-display text-lg text-text">Puntos débiles</h3>
          </div>
          <ul className="space-y-3">
            {weaknesses.map((w, i) => (
              <motion.li
                key={i}
                custom={i}
                initial="hidden"
                animate="show"
                variants={itemVariants}
                className="flex gap-3 text-sm text-text/80 leading-relaxed"
              >
                <X className="w-4 h-4 text-accent-red flex-shrink-0 mt-0.5" />
                <span>{w}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-md bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-accent-blue" />
          </div>
          <h3 className="font-display text-lg text-text">Mejoras sugeridas</h3>
        </div>
        <ul className="space-y-4">
          {improvements.map((imp, i) => (
            <motion.li
              key={i}
              custom={i}
              initial="hidden"
              animate="show"
              variants={itemVariants}
              className="border-l-2 border-accent-blue/40 pl-4 py-1"
            >
              <div className="font-mono text-xs text-accent-blue uppercase tracking-wider mb-1">
                {imp.area}
              </div>
              <div className="text-sm text-text/80 leading-relaxed">
                {imp.suggestion}
              </div>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-md bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center">
            <Hash className="w-4 h-4 text-accent-blue" />
          </div>
          <h3 className="font-display text-lg text-text">Keywords detectadas</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {keywords.map((kw, i) => (
            <motion.span
              key={i}
              custom={i}
              initial="hidden"
              animate="show"
              variants={itemVariants}
              className="chip"
            >
              {kw}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
