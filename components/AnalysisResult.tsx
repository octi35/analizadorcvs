"use client";

import { motion } from "framer-motion";
import { FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { AnalysisResult as Analysis } from "@/lib/llm";
import ProfileSummary from "./ProfileSummary";
import ATSCheck from "./ATSCheck";
import TargetMatch from "./TargetMatch";
import RequisitosCheck from "./RequisitosCheck";
import RoleMatches from "./RoleMatches";
import ImprovementsList from "./ImprovementsList";
import SkillsRoadmap from "./SkillsRoadmap";

interface AnalysisResultProps {
  analysis: Analysis;
  fileName: string;
}

export default function AnalysisResult({
  analysis,
  fileName,
}: AnalysisResultProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-5 sm:space-y-6">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-accent-blue" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-mono text-text/40 uppercase tracking-wider">
              Análisis de
            </div>
            <div className="font-mono text-sm text-text truncate">
              {fileName}
            </div>
          </div>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:border-accent-blue/40 transition-colors text-sm font-mono text-text/80"
        >
          <ArrowLeft className="w-4 h-4" />
          Analizar otro CV
        </Link>
      </motion.header>

      <ProfileSummary resumen={analysis.perfil_resumen} />
      {analysis.match_objetivo && (
        <TargetMatch match={analysis.match_objetivo} />
      )}
      <RequisitosCheck items={analysis.requisitos_check} />
      <ATSCheck ats={analysis.ats} />
      <RoleMatches roles={analysis.roles_compatibles} />
      <ImprovementsList items={analysis.puntos_mejora_cv} />
      <SkillsRoadmap items={analysis.habilidades_a_sumar} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center pt-2"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent-blue text-white font-medium hover:bg-blue-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Analizar otro CV
        </Link>
      </motion.div>
    </div>
  );
}
