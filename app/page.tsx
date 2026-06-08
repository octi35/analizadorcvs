"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  User,
  Search,
  Check,
  ChevronDown,
} from "lucide-react";
import UploadZone from "@/components/UploadZone";
import MultiUploadZone from "@/components/MultiUploadZone";

const LOADING_STEPS = [
  "Leyendo documento...",
  "Detectando perfil y roles...",
  "Generando plan de mejora...",
];

const RANK_STEPS = [
  "Leyendo los CVs...",
  "Evaluando cada candidato...",
  "Armando el ranking...",
];

const MAX_CVS = 15;

type Mode = "candidato" | "reclutador";

const SENIORITIES = ["Junior", "Semi Senior", "Senior", "Tech Lead"];

const ROLES: { label: string; title: string }[] = [
  { label: "Frontend", title: "Frontend Developer" },
  { label: "Backend", title: "Backend Developer" },
  { label: "Fullstack", title: "Fullstack Developer" },
  { label: "Mobile", title: "Mobile Developer" },
  { label: "DevOps", title: "DevOps Engineer" },
  { label: "Cloud", title: "Cloud Engineer" },
  { label: "Data Eng", title: "Data Engineer" },
  { label: "Data Science", title: "Data Scientist" },
  { label: "QA", title: "QA Engineer" },
  { label: "UX/UI", title: "UX/UI Designer" },
  { label: "Ciberseguridad", title: "Security Engineer" },
  { label: "Product", title: "Product Manager" },
];

// Requisitos típicos para reclutadores — toggle en vez de redactar
const REQ_GROUPS: { group: string; items: string[] }[] = [
  {
    group: "Experiencia",
    items: ["1+ años", "3+ años", "5+ años", "Liderazgo de equipo"],
  },
  {
    group: "Modalidad",
    items: ["Remoto", "Híbrido", "Presencial", "Disponibilidad full-time"],
  },
  {
    group: "Idioma",
    items: ["Inglés A2-B1", "Inglés B2+", "Inglés C1/nativo"],
  },
  {
    group: "Stack",
    items: [
      "React",
      "Angular",
      "Vue",
      "Node.js",
      "Python",
      "Java",
      ".NET",
      "Go",
      "TypeScript",
      "SQL",
      "AWS",
      "Azure",
      "GCP",
      "Docker / K8s",
      "CI/CD",
      "Scrum / Agile",
    ],
  },
];

export default function HomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("candidato");
  const [file, setFile] = useState<File | null>(null);
  const [multiFiles, setMultiFiles] = useState<File[]>([]);

  // Puesto objetivo armado con chips (sin tipear)
  const [seniority, setSeniority] = useState("");
  const [role, setRole] = useState("");
  const [customPosition, setCustomPosition] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  // Requisitos via chips + extra opcional
  const [selectedReqs, setSelectedReqs] = useState<string[]>([]);
  const [extraReqs, setExtraReqs] = useState("");

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);

  const jobPosition = useMemo(() => {
    if (customPosition.trim()) return customPosition.trim();
    return [seniority, role].filter(Boolean).join(" ").trim();
  }, [customPosition, seniority, role]);

  const jobDescription = useMemo(() => {
    if (mode !== "reclutador") return "";
    const lines = selectedReqs.map((r) => `• ${r}`);
    if (extraReqs.trim()) lines.push(extraReqs.trim());
    return lines.join("\n");
  }, [mode, selectedReqs, extraReqs]);

  const isRanking = mode === "reclutador" && multiFiles.length > 1;
  const steps = isRanking ? RANK_STEPS : LOADING_STEPS;
  const hasInput = mode === "reclutador" ? multiFiles.length > 0 : !!file;

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

  const toggleReq = (item: string) =>
    setSelectedReqs((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !hasInput) return;
    setApiError(null);
    setLoading(true);

    try {
      // Modo reclutador con varios CVs → ranking
      if (mode === "reclutador" && multiFiles.length > 1) {
        const fd = new FormData();
        multiFiles.forEach((f) => fd.append("files", f));
        fd.append("jobPosition", jobPosition);
        fd.append("jobDescription", jobDescription);

        const res = await fetch("/api/rank", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al comparar los CVs");

        localStorage.setItem(
          "cvision:last-ranking",
          JSON.stringify({
            candidates: data.candidates,
            jobPosition: data.jobPosition,
            jobDescription: data.jobDescription,
            analyzedAt: new Date().toISOString(),
          })
        );
        router.push("/ranking");
        return;
      }

      // Análisis individual (candidato, o reclutador con 1 solo CV)
      const single = mode === "reclutador" ? multiFiles[0] : file;
      if (!single) return;
      const fd = new FormData();
      fd.append("file", single);
      fd.append("jobPosition", jobPosition);
      fd.append("jobDescription", jobDescription);

      const res = await fetch("/api/analyze", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al analizar el CV");

      localStorage.setItem(
        "cvision:last-analysis",
        JSON.stringify({
          analysis: data.analysis,
          fileName: data.fileName,
          analyzedAt: new Date().toISOString(),
        })
      );
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
          className="text-center mb-8 sm:mb-10"
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
            Análisis IT de CVs con IA. Subí el CV, elegí 2 o 3 opciones y listo.
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
              className="bg-card border border-border rounded-2xl p-4 sm:p-8 space-y-6"
            >
              {/* Toggle de modo */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-bg border border-border">
                {(
                  [
                    { id: "candidato", label: "Soy candidato", icon: User },
                    { id: "reclutador", label: "Soy reclutador", icon: Search },
                  ] as const
                ).map(({ id, label, icon: Icon }) => {
                  const active = mode === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setMode(id)}
                      className={`relative flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        active ? "text-white" : "text-text/50 hover:text-text/80"
                      }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="mode-pill"
                          className="absolute inset-0 rounded-lg bg-accent-blue"
                          transition={{ type: "spring", duration: 0.4 }}
                        />
                      )}
                      <Icon className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">{label}</span>
                    </button>
                  );
                })}
              </div>

              {mode === "reclutador" ? (
                <MultiUploadZone
                  files={multiFiles}
                  onChange={setMultiFiles}
                  maxFiles={MAX_CVS}
                />
              ) : (
                <UploadZone file={file} onFile={setFile} />
              )}

              {/* Puesto objetivo via chips */}
              <div>
                <div className="text-sm text-text/70 mb-2.5 font-mono">
                  {mode === "candidato"
                    ? "¿A qué puesto apuntás?"
                    : "¿Qué puesto buscás cubrir?"}
                  <span className="text-text/40"> (opcional)</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {SENIORITIES.map((s) => (
                    <ChipToggle
                      key={s}
                      label={s}
                      active={seniority === s}
                      onClick={() => {
                        setSeniority((cur) => (cur === s ? "" : s));
                        setCustomPosition("");
                        setShowCustom(false);
                      }}
                    />
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {ROLES.map((r) => (
                    <ChipToggle
                      key={r.title}
                      label={r.label}
                      active={role === r.title}
                      onClick={() => {
                        setRole((cur) => (cur === r.title ? "" : r.title));
                        setCustomPosition("");
                        setShowCustom(false);
                      }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowCustom((v) => !v)}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-mono text-text/40 hover:text-text/70 transition-colors"
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      showCustom ? "rotate-180" : ""
                    }`}
                  />
                  Escribir otro puesto
                </button>

                <AnimatePresence>
                  {showCustom && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <input
                        type="text"
                        value={customPosition}
                        onChange={(e) => {
                          setCustomPosition(e.target.value);
                          if (e.target.value) {
                            setSeniority("");
                            setRole("");
                          }
                        }}
                        placeholder="Ej: Staff Platform Engineer"
                        className="w-full mt-2.5 px-4 py-3 rounded-lg bg-bg border border-border text-text placeholder:text-text/30 focus:outline-none focus:border-accent-blue/60 transition-colors font-mono text-sm"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {jobPosition && (
                  <div className="mt-3 inline-flex items-center gap-2 text-xs font-mono text-accent-blue">
                    <Check className="w-3.5 h-3.5" />
                    Evaluando contra: {jobPosition}
                  </div>
                )}
              </div>

              {/* Requisitos — solo reclutador */}
              <AnimatePresence>
                {mode === "reclutador" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-1">
                      <div className="text-sm text-text/70 mb-1 font-mono">
                        Requisitos del puesto
                      </div>
                      <div className="text-[11px] font-mono text-text/40 mb-3">
                        Tocá los que apliquen — el resto agregalo abajo
                      </div>

                      <div className="space-y-3">
                        {REQ_GROUPS.map((g) => (
                          <div key={g.group}>
                            <div className="text-[10px] uppercase tracking-wider font-mono text-text/35 mb-1.5">
                              {g.group}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {g.items.map((item) => (
                                <ChipToggle
                                  key={item}
                                  label={item}
                                  active={selectedReqs.includes(item)}
                                  onClick={() => toggleReq(item)}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <textarea
                        value={extraReqs}
                        onChange={(e) => setExtraReqs(e.target.value)}
                        rows={3}
                        maxLength={3000}
                        placeholder="Otros requisitos específicos (opcional)..."
                        className="w-full mt-4 px-4 py-3 rounded-lg bg-bg border border-border text-text placeholder:text-text/30 focus:outline-none focus:border-accent-blue/60 transition-colors text-sm leading-relaxed resize-y"
                      />
                      {selectedReqs.length > 0 && (
                        <div className="mt-2 text-[11px] font-mono text-text/40">
                          {selectedReqs.length} requisito
                          {selectedReqs.length !== 1 ? "s" : ""} seleccionado
                          {selectedReqs.length !== 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {apiError && (
                <div className="px-4 py-3 rounded-lg border border-accent-red/30 bg-accent-red/5 text-sm text-accent-red font-mono">
                  {apiError}
                </div>
              )}

              <button
                type="submit"
                disabled={!hasInput}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-accent-blue text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors group"
              >
                {!hasInput
                  ? mode === "reclutador"
                    ? "Subí CVs para comparar"
                    : "Subí un CV para empezar"
                  : isRanking
                    ? `Comparar ${multiFiles.length} candidatos`
                    : "Analizar CV"}
                {hasInput && (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                )}
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
              <ScanningCV multiple={isRanking} count={multiFiles.length} />
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                  className="font-mono text-sm text-text/80"
                >
                  {steps[step]}
                </motion.div>
              </AnimatePresence>
              {isRanking && (
                <div className="mt-2 font-mono text-xs text-text/40">
                  {multiFiles.length} CVs · esto puede tardar un toque
                </div>
              )}
              <div className="mt-6 flex gap-1.5">
                {steps.map((_, i) => (
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

// Animación de "leyendo el CV": documento con línea de escaneo barriendo el texto.
function ScanningCV({ multiple, count }: { multiple: boolean; count: number }) {
  const lineWidths = ["85%", "70%", "92%", "60%", "78%", "45%"];
  return (
    <div className="relative w-28 sm:w-32 mb-8">
      {/* hojas apiladas detrás (solo en modo ranking) */}
      {multiple && (
        <>
          <div className="absolute -right-2 top-2 w-full h-full rounded-xl border border-border bg-card rotate-[6deg]" />
          <div className="absolute -left-2 top-1 w-full h-full rounded-xl border border-border bg-card -rotate-[5deg]" />
        </>
      )}

      {/* documento principal */}
      <div className="relative aspect-[3/4] rounded-xl border-2 border-accent-blue/40 bg-bg/80 overflow-hidden">
        {/* esquina doblada */}
        <div className="absolute top-0 right-0 w-5 h-5 bg-card border-l border-b border-accent-blue/40 rounded-bl-md" />

        {/* líneas de texto (skeleton) */}
        <div className="p-3.5 sm:p-4 pt-5 space-y-2">
          {lineWidths.map((w, i) => (
            <motion.div
              key={i}
              className="h-1.5 rounded-full bg-accent-blue/25"
              style={{ width: w }}
              animate={{ opacity: [0.25, 0.7, 0.25] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                delay: i * 0.18,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* halo de escaneo */}
        <motion.div
          className="absolute left-0 right-0 h-10 bg-gradient-to-b from-transparent via-accent-blue/25 to-transparent"
          animate={{ top: ["-15%", "100%"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* línea de escaneo brillante */}
        <motion.div
          className="absolute left-0 right-0 h-[2px] bg-accent-blue shadow-[0_0_10px_2px_#3b82f6]"
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {multiple && count > 0 && (
        <div className="absolute -bottom-2 -right-2 min-w-[22px] h-[22px] px-1.5 rounded-full bg-accent-blue text-white font-mono text-[11px] flex items-center justify-center border-2 border-card">
          {count}
        </div>
      )}
    </div>
  );
}

function ChipToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono transition-all ${
        active
          ? "border-accent-blue bg-accent-blue/15 text-accent-blue"
          : "border-border bg-bg text-text/60 hover:border-accent-blue/40 hover:text-text/90"
      }`}
    >
      {active && <Check className="w-3 h-3" />}
      {label}
    </button>
  );
}
