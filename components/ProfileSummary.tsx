"use client";

import { motion } from "framer-motion";
import { UserCircle2 } from "lucide-react";

interface ProfileSummaryProps {
  resumen: string;
}

export default function ProfileSummary({ resumen }: ProfileSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card border border-border rounded-2xl p-6 sm:p-7"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-md bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center">
          <UserCircle2 className="w-4 h-4 text-accent-blue" />
        </div>
        <div className="text-xs font-mono text-text/40 uppercase tracking-wider">
          Perfil detectado
        </div>
      </div>
      <p className="text-text/90 leading-relaxed text-[15px]">{resumen}</p>
    </motion.div>
  );
}
