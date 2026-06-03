import { NextRequest, NextResponse } from "next/server";
import { analyzeCv } from "@/lib/llm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BYTES = 5 * 1024 * 1024;

function isPdf(file: File): boolean {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
}

function isTxt(file: File): boolean {
  return (
    file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")
  );
}

function isDocx(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  );
}

function isLegacyDoc(file: File): boolean {
  return file.name.toLowerCase().endsWith(".doc") && !isDocx(file);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const jobPosition = (formData.get("jobPosition") as string | null) ?? "";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No se recibió ningún archivo" },
        { status: 400 }
      );
    }
    if (file.size === 0) {
      return NextResponse.json(
        { error: "El archivo está vacío" },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "El archivo supera el tamaño máximo de 5MB" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let cvText = "";

    if (isPdf(file)) {
      try {
        const pdfParse = (await import("pdf-parse")).default;
        const parsed = await pdfParse(buffer);
        cvText = (parsed.text || "").trim();
      } catch {
        return NextResponse.json(
          { error: "No se pudo leer el PDF. ¿El archivo es válido?" },
          { status: 400 }
        );
      }
    } else if (isDocx(file)) {
      try {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        cvText = (result.value || "").trim();
      } catch {
        return NextResponse.json(
          { error: "No se pudo leer el .docx. ¿El archivo es válido?" },
          { status: 400 }
        );
      }
    } else if (isLegacyDoc(file)) {
      return NextResponse.json(
        {
          error:
            "Formato .doc (Word 97-2003) no soportado. Guardalo como .docx, PDF o TXT.",
        },
        { status: 400 }
      );
    } else if (isTxt(file)) {
      cvText = buffer.toString("utf-8").trim();
    } else {
      return NextResponse.json(
        { error: "Formato no soportado. Subí un PDF, DOCX o TXT." },
        { status: 400 }
      );
    }

    if (!cvText || cvText.length < 40) {
      return NextResponse.json(
        {
          error:
            "El contenido parece vacío o ilegible (si es PDF, puede ser un escaneo sin OCR)",
        },
        { status: 400 }
      );
    }

    const analysis = await analyzeCv(cvText, jobPosition);

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
