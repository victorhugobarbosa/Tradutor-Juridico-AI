"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, Shield, FileText, ArrowRight, Loader2, Upload } from "lucide-react";

interface AnalysisResult {
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  summary: string;
  redFlags: { clause: string; explanation: string }[];
  goodPoints: string[];
}

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    // Read usage count from cookie on mount
    const match = document.cookie.match(/(^| )usage-count=([^;]+)/);
    if (match) {
      const count = parseInt(match[2], 10);
      setUsageCount(count);
      if (count >= 3) setIsRateLimited(true);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setText(`Arquivo selecionado: ${selectedFile.name}`);
      } else {
        alert("Por favor, selecione apenas arquivos PDF.");
      }
    }
  };

  const analyzeContract = async () => {
    console.log("Iniciando análise...");
    if (!text.trim() && !file) {
      console.log("Texto ou arquivo vazio, abortando.");
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      console.log("Enviando requisição para /api/analyze...");

      let response;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        response = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
      }

      console.log("Resposta recebida:", response.status);

      const data = await response.json();
      console.log("Dados recebidos:", data);

      if (!response.ok) {
        if (response.status === 429) {
          setIsRateLimited(true);
          return;
        }
        throw new Error(data.error || "Erro na requisição");
      }

      setResult(data);
      setUsageCount((prev) => {
        const newCount = prev + 1;
        if (newCount >= 3) setIsRateLimited(true);
        return newCount;
      });
    } catch (error) {
      console.error("Error analyzing contract:", error);
      alert(error instanceof Error ? error.message : "Erro ao analisar o contrato. Tente novamente.");
    } finally {
      setLoading(false);
      setFile(null); // Reset file after analysis
      if (file) setText(""); // Clear text if it was just the file name
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "HIGH":
        return (
          <span className="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Risco Alto
          </span>
        );
      case "MEDIUM":
        return (
          <span className="bg-yellow-100 text-yellow-800 text-sm font-bold px-3 py-1 rounded-full flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Risco Médio
          </span>
        );
      case "LOW":
        return (
          <span className="bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Risco Baixo
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          Simplifica<span className="text-blue-600">.ai</span>
        </h1>
        <span className="text-sm text-slate-500 ml-auto hidden sm:inline">
          Entenda o que você está assinando
        </span>
      </header>

      {/* Main Area */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden h-[calc(100vh-64px)]">

        {/* Left Column: Input */}
        <div className="w-full md:w-1/2 p-6 bg-slate-50 flex flex-col border-r border-slate-200 overflow-y-auto">
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Cole seu contrato aqui
              </label>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${usageCount >= 3 ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                Análises hoje: {usageCount}/3
              </span>
            </div>

            {isRateLimited && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="bg-red-100 p-2 rounded-full shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-red-800">Limite de análises atingido</h3>
                  <p className="text-sm text-red-700 mt-1">
                    Como este é um projeto de portfólio, o uso é limitado a 3 análises por pessoa para controlar custos.
                  </p>
                  <p className="text-xs text-red-500 mt-2 font-medium">
                    Obrigado por testar o Simplifica.ai!
                  </p>
                </div>
              </div>
            )}

            <div className="relative">
              <textarea
                className="w-full p-4 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none transition-all text-slate-700 bg-white shadow-sm disabled:opacity-50 disabled:bg-slate-100 min-h-[200px]"
                placeholder={isRateLimited ? "Limite atingido." : "Cole seu contrato aqui ou envie um PDF..."}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setFile(null); // Clear file if user types
                }}
                disabled={isRateLimited}
              />

              {!isRateLimited && !text && !file && (
                <div className="absolute bottom-4 right-4">
                  <input
                    type="file"
                    accept="application/pdf"
                    id="pdf-upload"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <Upload className="w-4 h-4" /> Anexar PDF
                  </label>
                </div>
              )}
            </div>

            <button
              onClick={analyzeContract}
              disabled={loading || (!text.trim() && !file) || isRateLimited}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Analisando...
                </>
              ) : isRateLimited ? (
                <>
                  <Shield className="w-5 h-5" /> Limite Atingido
                </>
              ) : (
                <>
                  Analisar Riscos <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="w-full md:w-1/2 p-6 bg-white overflow-y-auto">
          {!result && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
              <Shield className="w-16 h-16 opacity-20" />
              <p className="text-center max-w-xs">
                O resultado da análise aparecerá aqui. Cole um texto e clique em analisar.
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center text-blue-600 gap-4 animate-pulse">
              <Shield className="w-16 h-16" />
              <p className="font-medium">Traduzindo o juridiquês...</p>
            </div>
          )}

          {result && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Header Result */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-2xl font-bold text-slate-800">Resultado</h2>
                {getRiskBadge(result.riskLevel)}
              </div>

              {/* Summary */}
              <section className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h3 className="text-blue-800 font-bold mb-2 flex items-center gap-2">
                  <span className="text-xl">💡</span> O que eu estou contratando?
                </h3>
                <p className="text-slate-700 leading-relaxed text-lg">
                  {result.summary}
                </p>
              </section>

              {/* Red Flags */}
              <section className="space-y-4">
                <h3 className="text-red-600 font-bold text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Red Flags (Cuidado!)
                </h3>
                {result.redFlags?.length === 0 ? (
                  <p className="text-slate-500 italic">Nenhuma cláusula perigosa encontrada.</p>
                ) : (
                  result.redFlags?.map((flag, idx) => (
                    <div key={idx} className="bg-red-50 p-4 rounded-lg border border-red-100 hover:shadow-md transition-shadow">
                      <p className="text-xs font-mono text-red-400 mb-1 uppercase tracking-wider">Cláusula Original</p>
                      <p className="text-slate-500 text-sm italic mb-3 border-l-2 border-red-200 pl-2">
                        "{flag.clause}"
                      </p>
                      <p className="text-red-800 font-medium">
                        🚨 {flag.explanation}
                      </p>
                    </div>
                  ))
                )}
              </section>

              {/* Good Points */}
              {result.goodPoints && result.goodPoints?.length > 0 && (
                <section className="space-y-4">
                  <h3 className="text-green-600 font-bold text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Pontos Positivos
                  </h3>
                  <ul className="space-y-2">
                    {result.goodPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700">
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
