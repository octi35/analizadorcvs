"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Sparkles, ArrowRight } from "lucide-react";
import UploadZone from "@/components/UploadZone";

const LOADING_STEPS = [
  "Leyendo documento...",
  "Analizando perfil...",
  "Generando reporte...",
];

export default function HomePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [jobPosition, setJobPosition] = useState("");
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
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/60 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-accent-blue" />
            <span className="text-xs font-mono text-text/70">
              Powered by Claude
            </span>
          </div>
          <h1 className="font-display text-6xl font-bold tracking-tight">
            CV<span className="text-accent-blue">ision</span>
          </h1>
          <p className="mt-4 text-text/60 max-w-md mx-auto">
            Análisis estructurado de currículums con IA. Subí un PDF, obtené
            feedback accionable en segundos.
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
              className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6"
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
              className="bg-card border border-border rounded-2xl p-12 flex flex-col items-center justify-center min-h-[280px]"
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
          PDFs hasta 5MB · Tu archivo no se almacena
        </div>
      </div>
    </main>
  );
}
