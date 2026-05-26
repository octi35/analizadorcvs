import { NextRequest, NextResponse } from "next/server";
import { analyzeCv } from "@/lib/claude";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const jobPosition = (formData.get("jobPosition") as string | null) ?? "";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No se recibió ningún archivo PDF" },
        { status: 400 }
      );
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "El PDF está vacío" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "El PDF supera el tamaño máximo de 5MB" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let cvText = "";
    try {
      const pdfParse = (await import("pdf-parse")).default;
      const parsed = await pdfParse(buffer);
      cvText = (parsed.text || "").trim();
    } catch (err) {
      return NextResponse.json(
        { error: "No se pudo leer el PDF. ¿El archivo es válido?" },
        { status: 400 }
      );
    }

    if (!cvText || cvText.length < 40) {
      return NextResponse.json(
        {
          error:
            "El PDF parece estar vacío o ser ilegible (puede ser un PDF escaneado sin OCR)",
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
    const message =
      err instanceof Error ? err.message : "Error desconocido al analizar el CV";
    const isJsonError =
      message.includes("JSON") || message.includes("respuesta de Claude");
    return NextResponse.json(
      { error: message },
      { status: isJsonError ? 502 : 500 }
    );
  }
}
