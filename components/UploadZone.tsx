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
      if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
        return "Solo se aceptan archivos PDF";
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
        } rounded-2xl px-8 py-14 cursor-pointer flex flex-col items-center justify-center text-center transition-all`}
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {file ? (
          <div className="flex items-center gap-3 text-text">
            <div className="w-12 h-12 rounded-lg bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-accent-blue" />
            </div>
            <div className="text-left">
              <div className="font-mono text-sm">{file.name}</div>
              <div className="text-xs text-text/50 font-mono">
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
              className="ml-4 p-1.5 rounded-md hover:bg-border/50 transition-colors"
              aria-label="Quitar archivo"
            >
              <X className="w-4 h-4 text-text/60" />
            </button>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-xl bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-accent-blue" />
            </div>
            <div className="font-display text-xl text-text mb-1">
              Arrastrá tu CV en PDF
            </div>
            <div className="text-sm text-text/50">
              o hacé clic para seleccionar — máx. 5MB
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
