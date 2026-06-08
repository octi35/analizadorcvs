import { NextRequest, NextResponse } from "next/server";
import { analyzeCv } from "@/lib/llm";
import { extractCvText, ExtractError, MAX_BYTES } from "@/lib/extract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const jobPosition = (formData.get("jobPosition") as string | null) ?? "";
    const jobDescription =
      (formData.get("jobDescription") as string | null) ?? "";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No se recibió ningún archivo" },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "El archivo supera el tamaño máximo de 5MB" },
        { status: 400 }
      );
    }

    let cvText: string;
    try {
      cvText = await extractCvText(file);
    } catch (err) {
      if (err instanceof ExtractError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }

    const analysis = await analyzeCv(cvText, jobPosition, jobDescription);

    return NextResponse.json({
      analysis,
      fileName: file.name,
    });
  } catch (err) {
    const raw =
      err instanceof Error ? err.message : "Error desconocido al analizar el CV";

    let message = raw;
    let status = 500;

    if (raw.includes("Groq API 401") || raw.includes("invalid_api_key")) {
      message = "La GROQ_API_KEY es inválida. Revisá .env.local.";
      status = 401;
    } else if (raw.includes("Groq API 429") || raw.includes("rate_limit")) {
      message = "Groq devolvió rate limit. Esperá unos segundos y reintentá.";
      status = 429;
    } else if (raw.includes("JSON") || raw.includes("respuesta del modelo")) {
      status = 502;
    }

    return NextResponse.json({ error: message }, { status });
  }
}
