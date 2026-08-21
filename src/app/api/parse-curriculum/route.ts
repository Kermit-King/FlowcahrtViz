import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
// @ts-ignore - bypassing buggy index.js in pdf-parse that causes ENOENT in webpack/turbopack
import pdfParse from "pdf-parse/lib/pdf-parse.js";

// In a real application, you'd use your actual API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy_key" });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF text using classic pdf-parse
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text;

    // Use Gemini to extract structured JSON data
    // We enforce a strict JSON schema for the response
    const schema = {
      type: "array",
      items: {
        type: "object",
        properties: {
          code: { type: "string" },
          title: { type: "string" },
          units: { type: "number" },
          year: { type: "number" },
          term: { type: "number" },
          prerequisites: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["code", "title", "units", "year", "term", "prerequisites"]
      }
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Extract the curriculum data, but only the main courses, exclude general courses and elective subjects from the following text and return a JSON array of courses:\n\n${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const coursesText = response.text;
    const courses = JSON.parse(coursesText || "[]");

    return NextResponse.json({ courses });
  } catch (error: any) {
    console.error("Error parsing curriculum:", error);
    return NextResponse.json({ error: error.message || "Failed to process curriculum" }, { status: 500 });
  }
}
