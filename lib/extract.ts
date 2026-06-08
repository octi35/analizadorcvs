export const MAX_BYTES = 5 * 1024 * 1024;

export class ExtractError extends Error {}

function isPdf(file: File): boolean {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
}

function isTxt(file: File): boolean {
  return file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt");
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

/**
 * Lee un File de CV (PDF / DOCX / TXT) y devuelve su texto plano.
 * Lanza ExtractError con un mensaje listo para mostrar al usuario.
 */
export async function extractCvText(file: File): Promise<string> {
  if (file.size === 0) {
    throw new ExtractError(`"${file.name}" está vacío`);
  }
  if (file.size > MAX_BYTES) {
    throw new ExtractError(`"${file.name}" supera el tamaño máximo de 5MB`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let cvText = "";

  if (isPdf(file)) {
    try {
      const pdfParse = (await import("pdf-parse")).default;
      const parsed = await pdfParse(buffer);
      cvText = (parsed.text || "").trim();
    } catch {
      throw new ExtractError(`No se pudo leer el PDF "${file.name}"`);
    }
  } else if (isDocx(file)) {
    try {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      cvText = (result.value || "").trim();
    } catch {
      throw new ExtractError(`No se pudo leer el .docx "${file.name}"`);
    }
  } else if (isLegacyDoc(file)) {
    throw new ExtractError(
      `Formato .doc (Word 97-2003) no soportado en "${file.name}". Guardalo como .docx, PDF o TXT.`
    );
  } else if (isTxt(file)) {
    cvText = buffer.toString("utf-8").trim();
  } else {
    throw new ExtractError(
      `Formato no soportado en "${file.name}". Subí PDF, DOCX o TXT.`
    );
  }

  if (!cvText || cvText.length < 40) {
    throw new ExtractError(
      `"${file.name}" parece vacío o ilegible (si es PDF, puede ser un escaneo sin OCR)`
    );
  }

  return cvText;
}
