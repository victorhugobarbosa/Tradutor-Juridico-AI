import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

const systemPrompt = `
Você é um advogado especialista em defesa do consumidor. Sua missão é traduzir contratos para uma linguagem extremamente simples (nível 5ª série) e destacar armadilhas. 

Saída obrigatória em JSON com a seguinte estrutura:
{ 
  "riskLevel": "HIGH" | "MEDIUM" | "LOW", 
  "summary": "Resumo de 2 linhas...", 
  "redFlags": [ 
    {"clause": "Texto original curto", "explanation": "Por que isso é ruim"} 
  ], 
  "goodPoints": ["Pontos positivos se houver"] 
}
`;

export async function POST(req: Request) {
    try {
        // Rate Limiting Logic (Simple Cookie-based for Portfolio)
        const cookieStore = await cookies();
        const usageCount = parseInt(cookieStore.get("usage-count")?.value || "0", 10);
        const MAX_USAGE = 3;

        if (usageCount >= MAX_USAGE) {
            return NextResponse.json(
                { error: "Limite de análises atingido. Como este é um projeto de portfólio, o uso é limitado a 3 análises por pessoa." },
                { status: 429 }
            );
        }

        let text = "";

        const contentType = req.headers.get("content-type") || "";

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            const file = formData.get("file") as File;

            if (!file) {
                return NextResponse.json(
                    { error: "Nenhum arquivo enviado." },
                    { status: 400 }
                );
            }

            if (file.type !== "application/pdf") {
                return NextResponse.json(
                    { error: "Apenas arquivos PDF são permitidos." },
                    { status: 400 }
                );
            }

            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            try {
                // Import directly from lib to avoid index.js debug mode issue in Next.js
                const pdfLib = require("pdf-parse/lib/pdf-parse.js");
                const pdfData = await pdfLib(buffer);
                text = pdfData.text;
                console.log("PDF Text extracted:", text.substring(0, 100) + "...");
            } catch (pdfError) {
                console.error("Error parsing PDF:", pdfError);
                return NextResponse.json(
                    { error: "Erro ao processar o arquivo PDF.", details: String(pdfError) },
                    { status: 500 }
                );
            }

        } else {
            const body = await req.json();
            text = body.text;
        }

        if (!text) {
            return NextResponse.json(
                { error: "Texto não encontrado no arquivo ou na requisição." },
                { status: 400 }
            );
        }

        if (!process.env.GOOGLE_API_KEY) {
            console.error("Erro: GOOGLE_API_KEY não encontrada");
            return NextResponse.json(
                { error: "GOOGLE_API_KEY não configurada" },
                { status: 500 }
            );
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemPrompt,
            generationConfig: { responseMimeType: "application/json" },
        });

        console.log("Iniciando geração de conteúdo...");
        const result = await model.generateContent(text);
        const geminiResponse = await result.response;
        const jsonString = geminiResponse.text();
        console.log("Conteúdo gerado:", jsonString);

        // Parse JSON to ensure it's valid before sending
        const data = JSON.parse(jsonString);

        // Increment usage count
        const response = NextResponse.json(data);
        response.cookies.set("usage-count", (usageCount + 1).toString(), {
            httpOnly: false, // Allow client to read for UI counter
            path: "/",
            maxAge: 60 * 60 * 24, // 24 hours
        });

        return response;
    } catch (error) {
        console.error("Erro detalhado na análise:", error);
        return NextResponse.json(
            { error: "Falha ao analisar o contrato", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
