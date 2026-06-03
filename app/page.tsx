"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Sparkles, ArrowRight, ListChecks } from "lucide-react";
import UploadZone from "@/components/UploadZone";

const LOADING_STEPS = [
  "Leyendo documento...",
  "Detectando perfil y roles...",
  "Generando plan de mejora...",
];

export default function HomePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [jobPosition, setJobPosition] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) return;
    setStep(0);
    const t1 = setTimeout(() => setStep(1), 1400);
    const t2 = setTimeout(() => setStep(2), 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [loading]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || loading) return;
    setApiError(null);
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("jobPosition", jobPosition.trim());
      fd.append("jobDescription", jobDescription.trim());

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al analizar el CV");

      const payload = {
        analysis: data.analysis,
        fileName: data.fileName,
        analyzedAt: new Date().toISOString(),
      };
      localStorage.setItem("cvision:last-analysis", JSON.stringify(payload));
      router.push("/results");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Error desconocido");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-10 sm:py-16">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/60 mb-5 sm:mb-6">
            <Sparkles className="w-3.5 h-3.5 text-accent-blue" />
            <span className="text-[11px] sm:text-xs font-mono text-text/70">
              Powered by Llama 3.3 · Groq
            </span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-bold tracking-tight">
            CV<span className="text-accent-blue">ision</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-text/60 max-w-md mx-auto px-2">
            Análisis IT de CVs con IA. Para candidatos: roles, mejoras y plan de
            crecimiento. Para reclutadores: filtro contra requisitos, red flags
            y preguntas de entrevista.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!loading ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              onSubmit={onSubmit}
              className="bg-card border border-border rounded-2xl p-4 sm:p-8 space-y-5 sm:space-y-6"
            >
              <UploadZone file={file} onFile={setFile} />

              <div>
                <label
                  htmlFor="jobPosition"
                  className="flex items-center gap-2 text-sm text-text/70 mb-2 font-mono"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Puesto objetivo
                  <span className="text-text/40">(opcional)</span>
                </label>
                <input
                  id="jobPosition"
                  type="text"
                  value={jobPosition}
                  onChange={(e) => setJobPosition(e.target.value)}
                  placeholder="Ej: Senior Frontend Engineer"
                  className="w-full px-4 py-3 rounded-lg bg-bg border border-border text-text placeholder:text-text/30 focus:outline-none focus:border-accent-blue/60 transition-colors font-mono text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="jobDescription"
                  className="flex items-center gap-2 text-sm text-text/70 mb-2 font-mono flex-wrap"
                >
                  <ListChecks className="w-3.5 h-3.5" />
                  Requisitos del puesto / Job description
                  <span className="text-text/40">(opcional · reclutadores)</span>
                </label>
                <textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={5}
                  maxLength={4000}
                  placeholder={
                    "Pegá la descripción del puesto o un listado de requisitos. Ej:\n• 3+ años React + TypeScript\n• Experiencia con AWS\n• Inglés B2+\n• Remoto desde LATAM"
                  }
                  className="w-full px-4 py-3 rounded-lg bg-bg border border-border text-text placeholder:text-text/30 focus:outline-none focus:border-accent-blue/60 transition-colors text-sm leading-relaxed resize-y min-h-[120px]"
                />
                <div className="flex justify-between mt-1.5 px-1">
                  <span className="text-[10px] font-mono text-text/30">
                    Cuanto más detalle, mejor el matching
                  </span>
                  <span className="text-[10px] font-mono text-text/30">
                    {jobDescription.length}/4000
                  </span>
                </div>
              </div>

              {apiError && (
                <div className="px-4 py-3 rounded-lg border border-accent-red/30 bg-accent-red/5 text-sm text-accent-red font-mono">
                  {apiError}
                </div>
              )}

              <button
                type="submit"
                disabled={!file}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-accent-blue text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors group"
              >
                Analizar CV
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center min-h-[260px] sm:min-h-[280px]"
            >
              <div className="relative w-16 h-16 mb-8">
                <div className="absolute inset-0 rounded-full border-2 border-border" />
                <div className="absolute inset-0 rounded-full border-2 border-accent-blue border-t-transparent animate-spin" />
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                  className="font-mono text-sm text-text/80"
                >
                  {LOADING_STEPS[step]}
                </motion.div>
              </AnimatePresence>
              <div className="mt-6 flex gap-1.5">
                {LOADING_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 w-8 rounded-full transition-colors ${
                      i <= step ? "bg-accent-blue" : "bg-border"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 text-center text-xs font-mono text-text/30">
          PDF, DOCX o TXT hasta 5MB · tu archivo no se almacena
        </div>
      </div>
    </main>
  );
}
