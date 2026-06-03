"use client";

import { useCallback, useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";

interface UploadZoneProps {
  file: File | null;
  onFile: (file: File | null) => void;
  disabled?: boolean;
}

const MAX_BYTES = 5 * 1024 * 1024;

export default function UploadZone({ file, onFile, disabled }: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback(
    (f: File): string | null => {
      const name = f.name.toLowerCase();
      const isPdf =
        f.type === "application/pdf" || name.endsWith(".pdf");
      const isTxt = f.type === "text/plain" || name.endsWith(".txt");
      const isDocx =
        f.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        name.endsWith(".docx");
      if (name.endsWith(".doc") && !isDocx) {
        return "Formato .doc (Word 97-2003) no soportado. Guardalo como .docx";
      }
      if (!isPdf && !isTxt && !isDocx) {
        return "Solo se aceptan archivos PDF, DOCX o TXT";
      }
      if (f.size > MAX_BYTES) {
        return "El archivo supera el tamaño máximo de 5MB";
      }
      return null;
    },
    []
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const f = files[0];
      const err = validate(f);
      if (err) {
        setError(err);
        onFile(null);
        return;
      }
      setError(null);
      onFile(f);
    },
    [onFile, validate]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  return (
    <div className="w-full">
      <div
        className={`dashed-box ${dragActive ? "active" : ""} ${
          disabled ? "opacity-60 pointer-events-none" : ""
        } rounded-2xl px-4 py-10 sm:px-8 sm:py-14 cursor-pointer flex flex-col items-center justify-center text-center transition-all`}
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf,text/plain,.txt,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {file ? (
          <div className="flex items-center gap-3 text-text w-full max-w-full">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-accent-blue" />
            </div>
            <div className="text-left min-w-0 flex-1">
              <div className="font-mono text-xs sm:text-sm truncate">
                {file.name}
              </div>
              <div className="text-[11px] sm:text-xs text-text/50 font-mono">
                {(file.size / 1024).toFixed(1)} KB
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="p-1.5 rounded-md hover:bg-border/50 transition-colors flex-shrink-0"
              aria-label="Quitar archivo"
            >
              <X className="w-4 h-4 text-text/60" />
            </button>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center mb-3 sm:mb-4">
              <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-accent-blue" />
            </div>
            <div className="font-display text-lg sm:text-xl text-text mb-1">
              Arrastrá tu CV
            </div>
            <div className="text-xs sm:text-sm text-text/50">
              PDF, DOCX o TXT — máx. 5MB · clic para seleccionar
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="mt-3 text-sm text-accent-red font-mono">{error}</div>
      )}
    </div>
  );
}
