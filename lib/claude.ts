import Anthropic from "@anthropic-ai/sdk";

export const CLAUDE_MODEL = "claude-sonnet-4-20250514";

export type Verdict = "APTO" | "APTO CON RESERVAS" | "NO APTO";

export interface AnalysisResult {
  score: number;
  position: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvements: { area: string; suggestion: string }[];
  keywords: string[];
  verdict: Verdict;
  verdictReason: string;
}

const SYSTEM_PROMPT =
  "Eres un experto en recursos humanos y reclutamiento con 15 años de experiencia. Analizás CVs de forma objetiva y constructiva. Respondés ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin markdown, sin explicaciones.";

function buildUserPrompt(cvText: string, jobPosition: string): string {
  return `Analizá este CV y devolvé un JSON con esta estructura exacta:
{
  "score": número del 0 al 100,
  "position": "puesto analizado o 'General' si no se especificó",
  "summary": "resumen de 2 líneas del perfil del candidato",
  "strengths": ["punto fuerte 1", "punto fuerte 2", "punto fuerte 3"],
  "weaknesses": ["punto débil 1", "punto débil 2", "punto débil 3"],
  "improvements": [
    { "area": "nombre del área", "suggestion": "qué hacer concretamente" }
  ],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "verdict": "APTO" | "APTO CON RESERVAS" | "NO APTO",
  "verdictReason": "una línea explicando el veredicto"
}

Puesto objetivo: ${jobPosition}

CV a analizar:
${cvText}`;
}

function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : raw;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) return candidate.trim();
  return candidate.slice(start, end + 1).trim();
}

function validateResult(data: unknown): AnalysisResult {
  if (!data || typeof data !== "object") {
    throw new Error("La respuesta de Claude no es un objeto válido");
  }
  const r = data as Record<string, unknown>;
  const requiredKeys = [
    "score",
    "position",
    "summary",
    "strengths",
    "weaknesses",
    "improvements",
    "keywords",
    "verdict",
    "verdictReason",
  ];
  for (const key of requiredKeys) {
    if (!(key in r)) throw new Error(`Falta el campo "${key}" en la respuesta`);
  }
  const score = Math.max(0, Math.min(100, Number(r.score) || 0));
  const verdict = String(r.verdict) as Verdict;
  return {
    score,
    position: String(r.position || "General"),
    summary: String(r.summary || ""),
    strengths: Array.isArray(r.strengths) ? r.strengths.map(String) : [],
    weaknesses: Array.isArray(r.weaknesses) ? r.weaknesses.map(String) : [],
    improvements: Array.isArray(r.improvements)
      ? (r.improvements as Array<Record<string, unknown>>).map((i) => ({
          area: String(i.area || ""),
          suggestion: String(i.suggestion || ""),
        }))
      : [],
    keywords: Array.isArray(r.keywords) ? r.keywords.map(String) : [],
    verdict:
      verdict === "APTO" || verdict === "APTO CON RESERVAS" || verdict === "NO APTO"
        ? verdict
        : "APTO CON RESERVAS",
    verdictReason: String(r.verdictReason || ""),
  };
}

export async function analyzeCv(
  cvText: string,
  jobPosition?: string
): Promise<AnalysisResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY no está configurada");
  }

  const client = new Anthropic({ apiKey });
  const targetPosition = jobPosition?.trim() || "General";

  const message = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildUserPrompt(cvText, targetPosition),
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude no devolvió contenido de texto");
  }

  const jsonText = extractJson(textBlock.text);
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("La respuesta de Claude no es un JSON válido");
  }

  return validateResult(parsed);
}
