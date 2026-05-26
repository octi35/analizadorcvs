"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileX } from "lucide-react";
import AnalysisResult from "@/components/AnalysisResult";
import type { AnalysisResult as Analysis } from "@/lib/claude";

interface StoredAnalysis {
  analysis: Analysis;
  fileName: string;
  analyzedAt: string;
}

export default function ResultsPage() {
  const [data, setData] = useState<StoredAnalysis | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cvision:last-analysis");
      if (raw) {
        setData(JSON.parse(raw) as StoredAnalysis);
      }
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="font-mono text-sm text-text/40">Cargando análisis...</div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="bg-card border border-border rounded-2xl p-10 max-w-md text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-accent-red/10 border border-accent-red/30 flex items-center justify-center">
            <FileX className="w-5 h-5 text-accent-red" />
          </div>
          <h2 className="font-display text-2xl mb-2">Sin análisis disponible</h2>
          <p className="text-sm text-text/60 mb-6">
            No encontramos un análisis reciente. Subí un CV para empezar.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent-blue text-white font-medium hover:bg-blue-500 transition-colors"
          >
            Ir al inicio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <AnalysisResult analysis={data.analysis} fileName={data.fileName} />
    </main>
  );
}
