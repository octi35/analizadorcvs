"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  FileX,
  ArrowLeft,
  ChevronDown,
  AlertTriangle,
  Crown,
  Medal,
  CheckCircle2,
  MinusCircle,
} from "lucide-react";
import type { AnalysisResult as Analysis } from "@/lib/llm";
import ProfileSummary from "@/components/ProfileSummary";
import ATSCheck from "@/components/ATSCheck";
import TargetMatch from "@/components/TargetMatch";
import RequisitosCheck from "@/components/RequisitosCheck";
import RoleMatches from "@/components/RoleMatches";
import ImprovementsList from "@/components/ImprovementsList";
import SkillsRoadmap from "@/components/SkillsRoadmap";

interface RankedCandidate {
  fileName: string;
  score: number;
  analysis: Analysis | null;
  error: string | null;
}

interface StoredRanking {
  candidates: RankedCandidate[];
  jobPosition: string;
  jobDescription: string;
  analyzedAt: string;
}

function scoreTone(score: number) {
  if (score >= 75)
    return { text: "text-accent-green", ring: "border-accent-green/40", bar: "bg-accent-green" };
  if (score >= 50)
    return { text: "text-accent-yellow", ring: "border-accent-yellow/40", bar: "bg-accent-yellow" };
  return { text: "text-accent-red", ring: "border-accent-red/40", bar: "bg-accent-red" };
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <div className="w-9 h-9 rounded-full bg-accent-yellow/15 border border-accent-yellow/50 flex items-center justify-center flex-shrink-0">
        <Crown className="w-4 h-4 text-accent-yellow" />
      </div>
    );
  if (rank <= 3)
    return (
      <div className="w-9 h-9 rounded-full bg-accent-blue/10 border border-accent-blue/40 flex items-center justify-center flex-shrink-0">
        <Medal className="w-4 h-4 text-accent-blue" />
      </div>
    );
  return (
    <div className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center flex-shrink-0 font-mono text-sm text-text/50">
      {rank}
    </div>
  );
}

function CandidateDetail({ a }: { a: Analysis }) {
  return (
    <div className="space-y-5 pt-4">
      <ProfileSummary resumen={a.perfil_resumen} />
      {a.match_objetivo && <TargetMatch match={a.match_objetivo} />}
      <RequisitosCheck items={a.requisitos_check} />
      <ATSCheck ats={a.ats} />
      <RoleMatches roles={a.roles_compatibles} />
      <ImprovementsList items={a.puntos_mejora_cv} />
      <SkillsRoadmap items={a.habilidades_a_sumar} />
    </div>
  );
}

export default function RankingPage() {
  const [data, setData] = useState<StoredRanking | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState<number | null>(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cvision:last-ranking");
      if (raw) {
        const parsed = JSON.parse(raw) as StoredRanking;
        if (Array.isArray(parsed?.candidates) && parsed.candidates.length > 0) {
          setData(parsed);
        } else {
          localStorage.removeItem("cvision:last-ranking");
        }
      }
    } catch {
      localStorage.removeItem("cvision:last-ranking");
    }
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="font-mono text-sm text-text/40">Cargando ranking...</div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="bg-card border border-border rounded-2xl p-10 max-w-md text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-accent-red/10 border border-accent-red/30 flex items-center justify-center">
            <FileX className="w-5 h-5 text-accent-red" />
          </div>
          <h2 className="font-display text-2xl mb-2">Sin ranking disponible</h2>
          <p className="text-sm text-text/60 mb-6">
            No encontramos una comparación reciente. Subí varios CVs para empezar.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent-blue text-white font-medium hover:bg-blue-500 transition-colors"
          >
            Ir al inicio
          </Link>
        </div>
      </main>
    );
  }

  const ok = data.candidates.filter((c) => c.analysis);
  const failed = data.candidates.filter((c) => !c.analysis);

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-accent-yellow/10 border border-accent-yellow/30 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-5 h-5 text-accent-yellow" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-2xl sm:text-3xl text-text leading-tight">
                Ranking de candidatos
              </h1>
              <div className="text-xs font-mono text-text/50 truncate">
                {ok.length} CV{ok.length !== 1 ? "s" : ""} analizado
                {ok.length !== 1 ? "s" : ""}
                {data.jobPosition ? ` · ${data.jobPosition}` : ""}
              </div>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:border-accent-blue/40 transition-colors text-sm font-mono text-text/80 flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Nueva comparación
          </Link>
        </motion.header>

        {/* Mejor candidato destacado */}
        {ok[0]?.analysis && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="rounded-2xl border border-accent-yellow/40 bg-accent-yellow/5 p-5 sm:p-6"
          >
            <div className="flex items-center gap-2 mb-3 text-accent-yellow">
              <Crown className="w-4 h-4" />
              <span className="font-mono text-xs uppercase tracking-wider">
                Mejor match
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="font-display text-xl text-text truncate">
                  {ok[0].fileName}
                </div>
                {ok[0].analysis.match_objetivo && (
                  <div className="text-xs font-mono text-text/50 mt-0.5">
                    Veredicto: {ok[0].analysis.match_objetivo.veredicto}
                  </div>
                )}
              </div>
              <div className={`font-mono text-4xl font-bold ${scoreTone(ok[0].score).text}`}>
                {ok[0].score}
                <span className="text-lg text-text/30 font-normal">%</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Lista rankeada */}
        <div className="space-y-3">
          {ok.map((c, i) => {
            const tone = scoreTone(c.score);
            const isOpen = open === i;
            const m = c.analysis!.match_objetivo;
            return (
              <motion.div
                key={`${c.fileName}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="rounded-2xl border border-border bg-card overflow-hidden"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 text-left hover:bg-bg/40 transition-colors"
                >
                  <RankBadge rank={i + 1} />
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-sm text-text truncate">
                      {c.fileName}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="h-1.5 w-24 sm:w-40 rounded-full bg-border/60 overflow-hidden">
                        <div
                          className={`h-full ${tone.bar}`}
                          style={{ width: `${c.score}%` }}
                        />
                      </div>
                      {m && (
                        <span className="hidden sm:inline-flex items-center gap-3 text-[11px] font-mono text-text/50">
                          <span className="inline-flex items-center gap-1 text-accent-green">
                            <CheckCircle2 className="w-3 h-3" />
                            {m.fortalezas.length}
                          </span>
                          <span className="inline-flex items-center gap-1 text-accent-yellow">
                            <MinusCircle className="w-3 h-3" />
                            {m.gaps.length}
                          </span>
                          {m.red_flags.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-accent-red">
                              <AlertTriangle className="w-3 h-3" />
                              {m.red_flags.length}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`font-mono text-2xl font-bold ${tone.text} flex-shrink-0`}>
                    {c.score}
                    <span className="text-xs text-text/30 font-normal">%</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-text/40 flex-shrink-0 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-5 pb-5 border-t border-border">
                        <CandidateDetail a={c.analysis!} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* CVs que fallaron */}
        {failed.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3 text-text/50">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-mono text-xs uppercase tracking-wider">
                No analizados ({failed.length})
              </span>
            </div>
            <ul className="space-y-1.5">
              {failed.map((c, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 text-xs font-mono"
                >
                  <span className="text-text/70 truncate">{c.fileName}</span>
                  <span className="text-accent-red flex-shrink-0">
                    {c.error}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
