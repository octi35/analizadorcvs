import { NextRequest, NextResponse } from "next/server";
import { analyzeCv, computeCandidateScore, type AnalysisResult } from "@/lib/llm";
import { extractCvText, ExtractError, MAX_BYTES } from "@/lib/extract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MAX_FILES = 15;
const CONCURRENCY = 3;

export interface RankedCandidate {
  fileName: string;
  score: number;
  analysis: AnalysisResult | null;
  error: string | null;
}

/** Procesa una lista con un límite de concurrencia para no saturar el rate limit de Groq. */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData
      .getAll("files")
      .filter((f): f is File => f instanceof File);
    const jobPosition = (formData.get("jobPosition") as string | null) ?? "";
    const jobDescription =
      (formData.get("jobDescription") as string | null) ?? "";

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No se recibió ningún CV" },
        { status: 400 }
      );
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Máximo ${MAX_FILES} CVs por comparación` },
        { status: 400 }
      );
    }

    const candidates = await mapWithConcurrency<File, RankedCandidate>(
      files,
      CONCURRENCY,
      async (file) => {
        if (file.size > MAX_BYTES) {
          return {
            fileName: file.name,
            score: 0,
            analysis: null,
            error: "Supera 5MB",
          };
        }
        try {
          const cvText = await extractCvText(file);
          const analysis = await analyzeCv(cvText, jobPosition, jobDescription);
          return {
            fileName: file.name,
            score: computeCandidateScore(analysis),
            analysis,
            error: null,
          };
        } catch (err) {
          const msg =
            err instanceof ExtractError
              ? err.message
              : err instanceof Error
                ? err.message
                : "Error al analizar";
          return { fileName: file.name, score: 0, analysis: null, error: msg };
        }
      }
    );

    // Éxitos primero, ordenados por score desc; errores al final.
    candidates.sort((a, b) => {
      if (a.analysis && !b.analysis) return -1;
      if (!a.analysis && b.analysis) return 1;
      return b.score - a.score;
    });

    const ok = candidates.filter((c) => c.analysis).length;
    if (ok === 0) {
      return NextResponse.json(
        { error: "No se pudo analizar ningún CV. Revisá los archivos." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      candidates,
      jobPosition,
      jobDescription,
      analyzed: ok,
      total: candidates.length,
    });
  } catch (err) {
    const raw =
      err instanceof Error ? err.message : "Error desconocido al rankear";
    let message = raw;
    let status = 500;
    if (raw.includes("Groq API 401") || raw.includes("invalid_api_key")) {
      message = "La GROQ_API_KEY es inválida. Revisá .env.local.";
      status = 401;
    } else if (raw.includes("Groq API 429") || raw.includes("rate_limit")) {
      message = "Groq devolvió rate limit. Esperá unos segundos y reintentá.";
      status = 429;
    }
    return NextResponse.json({ error: message }, { status });
  }
}
