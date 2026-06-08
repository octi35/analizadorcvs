"use client";

import { useCallback, useRef, useState } from "react";
import { FileText, Upload, X, Layers } from "lucide-react";

interface MultiUploadZoneProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

const MAX_BYTES = 5 * 1024 * 1024;

function validate(f: File): string | null {
  const name = f.name.toLowerCase();
  const isPdf = f.type === "application/pdf" || name.endsWith(".pdf");
  const isTxt = f.type === "text/plain" || name.endsWith(".txt");
  const isDocx =
    f.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx");
  if (name.endsWith(".doc") && !isDocx)
    return "Formato .doc no soportado (guardalo como .docx)";
  if (!isPdf && !isTxt && !isDocx) return "Formato no soportado";
  if (f.size > MAX_BYTES) return "Supera 5MB";
  return null;
}

export default function MultiUploadZone({
  files,
  onChange,
  maxFiles = 15,
  disabled,
}: MultiUploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return;
      const errs: string[] = [];
      const valid: File[] = [];
      Array.from(list).forEach((f) => {
        const err = validate(f);
        if (err) errs.push(`${f.name}: ${err}`);
        else valid.push(f);
      });

      // Evitar duplicados por nombre+tamaño
      const key = (f: File) => `${f.name}__${f.size}`;
      const existing = new Set(files.map(key));
      const merged = [...files];
      valid.forEach((f) => {
        if (!existing.has(key(f))) {
          existing.add(key(f));
          merged.push(f);
        }
      });

      if (merged.length > maxFiles) {
        errs.push(`Máximo ${maxFiles} CVs`);
        merged.length = maxFiles;
      }
      setError(errs.length ? errs[0] : null);
      onChange(merged);
    },
    [files, maxFiles, onChange]
  );

  const remove = (i: number) =>
    onChange(files.filter((_, idx) => idx !== i));

  return (
    <div className="w-full">
      <div
        className={`dashed-box ${dragActive ? "active" : ""} ${
          disabled ? "opacity-60 pointer-events-none" : ""
        } rounded-2xl px-4 py-8 sm:px-8 sm:py-10 cursor-pointer flex flex-col items-center justify-center text-center transition-all`}
        onClick={() => inputRef.current?.click()}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(false);
          if (!disabled) addFiles(e.dataTransfer.files);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(false);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="application/pdf,.pdf,text/plain,.txt,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            if (inputRef.current) inputRef.current.value = "";
          }}
        />
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center mb-3">
          <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-accent-blue" />
        </div>
        <div className="font-display text-lg sm:text-xl text-text mb-1">
          Arrastrá varios CVs
        </div>
        <div className="text-xs sm:text-sm text-text/50">
          PDF, DOCX o TXT — hasta {maxFiles} archivos · clic para seleccionar
        </div>
      </div>

      {error && (
        <div className="mt-3 text-sm text-accent-red font-mono">{error}</div>
      )}

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-mono text-text/50">
              {files.length} CV{files.length !== 1 ? "s" : ""} listo
              {files.length !== 1 ? "s" : ""} para comparar
            </span>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-[11px] font-mono text-text/40 hover:text-accent-red transition-colors"
            >
              Limpiar todo
            </button>
          </div>
          {files.map((f, i) => (
            <div
              key={`${f.name}-${i}`}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-bg border border-border"
            >
              <FileText className="w-4 h-4 text-accent-blue flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-mono text-xs truncate">{f.name}</div>
              </div>
              <span className="text-[10px] font-mono text-text/40 flex-shrink-0">
                {(f.size / 1024).toFixed(0)} KB
              </span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="p-1 rounded hover:bg-border/50 transition-colors flex-shrink-0"
                aria-label="Quitar"
              >
                <X className="w-3.5 h-3.5 text-text/60" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-xs font-mono text-text/50 hover:border-accent-blue/40 hover:text-text/80 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Agregar más
          </button>
        </div>
      )}
    </div>
  );
}
