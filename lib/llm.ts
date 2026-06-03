export const LLM_MODEL = "llama-3.3-70b-versatile";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

export type Prioridad = "Alta" | "Media" | "Baja";
export type TipoHabilidad = "Technical" | "Soft";
export type AtsEstado = "PASA" | "PARCIAL" | "NO PASA";
export type Veredicto = "APTO" | "CON RESERVAS" | "NO APTO";
export type CumpleEstado = "Sí" | "Parcial" | "No";

export interface RequisitoCheck {
  requisito: string;
  cumple: CumpleEstado;
  evidencia: string;
}

export interface RoleMatch {
  puesto: string;
  porcentaje_match: number;
  motivo: string;
}

export interface PuntoMejora {
  seccion: string;
  problema: string;
  solucion: string;
}

export interface HabilidadSumar {
  habilidad: string;
  tipo: TipoHabilidad;
  prioridad: Prioridad;
  recurso_sugerido: string;
}

export interface AtsCheck {
  score: number;
  estado: AtsEstado;
  problemas: string[];
  recomendaciones: string[];
}

export interface MatchObjetivo {
  puesto: string;
  porcentaje_match: number;
  veredicto: Veredicto;
  fortalezas: string[];
  gaps: string[];
  red_flags: string[];
  preguntas_entrevista: string[];
}

export interface AnalysisResult {
  perfil_resumen: string;
  ats: AtsCheck;
  match_objetivo: MatchObjetivo | null;
  requisitos_check: RequisitoCheck[];
  roles_compatibles: RoleMatch[];
  puntos_mejora_cv: PuntoMejora[];
  habilidades_a_sumar: HabilidadSumar[];
}

const SYSTEM_PROMPT = `Sos un Tech Recruiter senior con 15 años de experiencia en perfiles IT (LATAM y mercado global). Analizás CVs de forma objetiva, accionable y constructiva. Respondés ÚNICAMENTE con un objeto JSON válido siguiendo exactamente el esquema solicitado. Sin markdown, sin texto introductorio, sin explicaciones fuera del JSON.`;

function buildUserPrompt(
  cvText: string,
  jobPosition: string,
  jobDescription: string
): string {
  const hasTarget = jobPosition.length > 0;
  const hasJD = jobDescription.length > 0;
  const targetLine = hasTarget
    ? `El usuario evalúa el CV contra el puesto objetivo: "${jobPosition}". Completá obligatoriamente el bloque "match_objetivo" pensando en uso por reclutador (red flags + preguntas para validar en entrevista). Priorizá ese rol primero en roles_compatibles si encaja.`
    : `No se especificó un puesto objetivo. Devolvé "match_objetivo": null. Sugerí los 3-4 roles IT donde mejor encaje en roles_compatibles.`;

  const jdBlock = hasJD
    ? `\n\nDESCRIPCIÓN DEL PUESTO / REQUISITOS PROVISTOS POR EL RECLUTADOR:\n"""\n${jobDescription}\n"""\n\nDebés extraer cada requisito concreto del texto (años de experiencia, tecnologías específicas, certificaciones, idiomas, soft skills, modalidad, etc.) y completar "requisitos_check" con UN ítem por requisito relevante. "cumple" debe ser "Sí" / "Parcial" / "No" y "evidencia" debe citar literalmente o resumir la sección del CV que lo prueba (o decir "No mencionado en el CV"). Tu match_objetivo y red_flags deben basarse principalmente en este JD.`
    : `\n\nNo se proporcionó descripción del puesto. Devolvé "requisitos_check": [].`;

  return `Analizá el siguiente CV y devolvé un único JSON con esta estructura EXACTA (sin claves adicionales, sin texto fuera del JSON):

{
  "perfil_resumen": "2-3 líneas describiendo el perfil detectado: seniority, stack principal y foco",
  "ats": {
    "score": 0-100,
    "estado": "PASA" | "PARCIAL" | "NO PASA",
    "problemas": ["Problemas que un parser ATS encuentra: tablas, columnas, imágenes, headers/footers raros, fuentes no estándar, falta de keywords, secciones sin nombre estándar, formato no parseable, etc."],
    "recomendaciones": ["Acciones concretas para que pase ATS"]
  },
  "match_objetivo": null | {
    "puesto": "El puesto objetivo indicado",
    "porcentaje_match": 0-100,
    "veredicto": "APTO" | "CON RESERVAS" | "NO APTO",
    "fortalezas": ["Qué del CV encaja con el puesto"],
    "gaps": ["Qué le falta al candidato vs el puesto"],
    "red_flags": ["Señales de alerta para el reclutador: gaps largos sin explicar, cambios cada 6 meses, falta de seniority declarado, claims sin evidencia, etc."],
    "preguntas_entrevista": ["3-5 preguntas concretas que un reclutador debería hacerle para validar el fit"]
  },
  "roles_compatibles": [
    { "puesto": "Nombre del rol IT", "porcentaje_match": 0-100, "motivo": "Una línea explicando por qué encaja" }
  ],
  "puntos_mejora_cv": [
    { "seccion": "Ej: Experiencia / Educación / Formato", "problema": "Qué está mal o falta", "solucion": "Cómo redactarlo o mejorarlo concretamente" }
  ],
  "habilidades_a_sumar": [
    { "habilidad": "Nombre", "tipo": "Technical" | "Soft", "prioridad": "Alta" | "Media" | "Baja", "recurso_sugerido": "Ej: AWS Solutions Architect Associate, curso de System Design, proyecto open source" }
  ],
  "requisitos_check": [
    { "requisito": "Texto del requisito tal cual aparece en el JD (ej: '3+ años React')", "cumple": "Sí" | "Parcial" | "No", "evidencia": "Cita del CV que lo prueba, o 'No mencionado en el CV'" }
  ]
}

Reglas:
- En "ats" usá estado "PASA" si score>=80, "PARCIAL" si 50-79, "NO PASA" si <50. Listá entre 2 y 5 problemas y entre 2 y 5 recomendaciones.
- En "roles_compatibles" devolvé entre 3 y 5 roles, ordenados de mayor a menor porcentaje_match.
- En "puntos_mejora_cv" devolvé entre 3 y 6 ítems, los más críticos primero.
- En "habilidades_a_sumar" devolvé entre 4 y 7 ítems pensados para el siguiente nivel del rol con mayor match.
- En "match_objetivo": veredicto "APTO" si porcentaje_match>=75, "CON RESERVAS" si 50-74, "NO APTO" si <50. 2-4 ítems por lista (fortalezas, gaps, red_flags) y 3-5 preguntas.
- En "requisitos_check": un ítem por requisito del JD. Si no hay JD, dejalo en [].
- "porcentaje_match" es un entero entre 0 y 100.
- Texto en español rioplatense, conciso y profesional.

${targetLine}${jdBlock}

CV a analizar:
"""
${cvText}
"""`;
}

function normalizePrioridad(v: unknown): Prioridad {
  const s = String(v ?? "").toLowerCase();
  if (s.startsWith("alta") || s === "high") return "Alta";
  if (s.startsWith("baja") || s === "low") return "Baja";
  return "Media";
}

function normalizeTipo(v: unknown): TipoHabilidad {
  const s = String(v ?? "").toLowerCase();
  if (s.startsWith("soft") || s.includes("blanda")) return "Soft";
  return "Technical";
}

function clampPct(n: unknown): number {
  const num = Number(n);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
}

function normalizeAtsEstado(score: number, v: unknown): AtsEstado {
  const s = String(v ?? "").toUpperCase();
  if (s === "PASA" || s === "PARCIAL" || s === "NO PASA") return s as AtsEstado;
  if (score >= 80) return "PASA";
  if (score >= 50) return "PARCIAL";
  return "NO PASA";
}

function normalizeVeredicto(score: number, v: unknown): Veredicto {
  const s = String(v ?? "").toUpperCase();
  if (s === "APTO" || s === "CON RESERVAS" || s === "NO APTO")
    return s as Veredicto;
  if (score >= 75) return "APTO";
  if (score >= 50) return "CON RESERVAS";
  return "NO APTO";
}

function normalizeCumple(v: unknown): CumpleEstado {
  const s = String(v ?? "").toLowerCase().trim();
  if (s.startsWith("si") || s.startsWith("sí") || s === "yes") return "Sí";
  if (s.startsWith("parcial") || s.startsWith("partial")) return "Parcial";
  return "No";
}

function strList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x ?? "").trim()).filter((x) => x.length > 0);
}

function validateResult(data: unknown): AnalysisResult {
  if (!data || typeof data !== "object") {
    throw new Error("La respuesta del modelo no es un objeto válido");
  }
  const r = data as Record<string, unknown>;

  const atsRaw = (r.ats as Record<string, unknown> | undefined) ?? {};
  const atsScore = clampPct(atsRaw.score);
  const ats: AtsCheck = {
    score: atsScore,
    estado: normalizeAtsEstado(atsScore, atsRaw.estado),
    problemas: strList(atsRaw.problemas),
    recomendaciones: strList(atsRaw.recomendaciones),
  };

  let match_objetivo: MatchObjetivo | null = null;
  if (r.match_objetivo && typeof r.match_objetivo === "object") {
    const m = r.match_objetivo as Record<string, unknown>;
    const pct = clampPct(m.porcentaje_match);
    match_objetivo = {
      puesto: String(m.puesto || "").trim(),
      porcentaje_match: pct,
      veredicto: normalizeVeredicto(pct, m.veredicto),
      fortalezas: strList(m.fortalezas),
      gaps: strList(m.gaps),
      red_flags: strList(m.red_flags),
      preguntas_entrevista: strList(m.preguntas_entrevista),
    };
  }

  const roles = Array.isArray(r.roles_compatibles)
    ? (r.roles_compatibles as Array<Record<string, unknown>>).map((it) => ({
        puesto: String(it.puesto || "").trim() || "Rol IT",
        porcentaje_match: clampPct(it.porcentaje_match),
        motivo: String(it.motivo || "").trim(),
      }))
    : [];
  roles.sort((a, b) => b.porcentaje_match - a.porcentaje_match);

  const mejoras = Array.isArray(r.puntos_mejora_cv)
    ? (r.puntos_mejora_cv as Array<Record<string, unknown>>).map((it) => ({
        seccion: String(it.seccion || "").trim() || "General",
        problema: String(it.problema || "").trim(),
        solucion: String(it.solucion || "").trim(),
      }))
    : [];

  const habs = Array.isArray(r.habilidades_a_sumar)
    ? (r.habilidades_a_sumar as Array<Record<string, unknown>>).map((it) => ({
        habilidad: String(it.habilidad || "").trim() || "Habilidad",
        tipo: normalizeTipo(it.tipo),
        prioridad: normalizePrioridad(it.prioridad),
        recurso_sugerido: String(it.recurso_sugerido || "").trim(),
      }))
    : [];

  const PRIO_ORDER: Record<Prioridad, number> = { Alta: 0, Media: 1, Baja: 2 };
  habs.sort((a, b) => PRIO_ORDER[a.prioridad] - PRIO_ORDER[b.prioridad]);

  const reqs = Array.isArray(r.requisitos_check)
    ? (r.requisitos_check as Array<Record<string, unknown>>).map((it) => ({
        requisito: String(it.requisito || "").trim() || "Requisito",
        cumple: normalizeCumple(it.cumple),
        evidencia: String(it.evidencia || "").trim(),
      }))
    : [];
  const CUMPLE_ORDER: Record<CumpleEstado, number> = { No: 0, Parcial: 1, "Sí": 2 };
  reqs.sort((a, b) => CUMPLE_ORDER[a.cumple] - CUMPLE_ORDER[b.cumple]);

  return {
    perfil_resumen: String(r.perfil_resumen || "").trim(),
    ats,
    match_objetivo,
    requisitos_check: reqs,
    roles_compatibles: roles,
    puntos_mejora_cv: mejoras,
    habilidades_a_sumar: habs,
  };
}

interface GroqResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string; type?: string };
}

export async function analyzeCv(
  cvText: string,
  jobPosition?: string,
  jobDescription?: string
): Promise<AnalysisResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY no está configurada. Sacá una key gratis en console.groq.com/keys y pegala en .env.local"
    );
  }

  const target = jobPosition?.trim() || "";
  const jd = (jobDescription || "").trim().slice(0, 4000);
  const body = {
    model: LLM_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: buildUserPrompt(cvText.slice(0, 12000), target, jd),
      },
    ],
    response_format: { type: "json_object" as const },
    temperature: 0.3,
    max_tokens: 4000,
  };

  const res = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const errJson = (await res.json()) as GroqResponse;
      detail = errJson.error?.message || JSON.stringify(errJson);
    } catch {
      detail = await res.text();
    }
    throw new Error(`Groq API ${res.status}: ${detail}`);
  }

  const data = (await res.json()) as GroqResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("El modelo no devolvió contenido");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("La respuesta del modelo no es un JSON válido");
  }

  return validateResult(parsed);
}
