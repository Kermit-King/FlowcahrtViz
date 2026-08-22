import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, type Part } from "@google/genai";
// @ts-expect-error - bypassing buggy index.js in pdf-parse that causes ENOENT in webpack/turbopack
import pdfParse from "pdf-parse/lib/pdf-parse.js";

// In a real application, you'd use your actual API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy_key" });

function getErrorStatus(error: unknown): number | null {
  if (typeof error === "object" && error !== null && "status" in error) {
    const { status } = error as { status: unknown };
    if (typeof status === "number") return status;
  }
  return null;
}

const SUPPORTED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const isPdf = file.type === "application/pdf";
    const isImage = SUPPORTED_IMAGE_TYPES.has(file.type);

    if (!isPdf && !isImage) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type || "unknown"}. Please upload a PDF or an image (PNG, JPG, WebP, HEIC).` },
        { status: 422 }
      );
    }

    if (buffer.length > 15 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File is larger than 15MB — too big to send inline to Gemini. Please split or compress it and try again." },
        { status: 413 }
      );
    }

    let hasTextLayer = false;
    let text = "";

    if (isPdf) {
      const pdfData = await pdfParse(buffer);
      text = pdfData.text;
      hasTextLayer = text.trim().length >= 50;
    }

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
          },
          softPrerequisites: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["code", "title", "units", "year", "term", "prerequisites", "softPrerequisites"]
      }
    };

    const extractionInstruction =
      'Classify prerequisites: HARD prerequisites (must be PASSED before taking the course — usually drawn with solid lines/arrows) go in "prerequisites"; ' +
      'SOFT prerequisites (must have been taken previously but need not be passed, failing still allows enrollment — usually drawn with dashed lines) go in "softPrerequisites"; ' +
      "use an empty softPrerequisites array when the curriculum does not distinguish them. " +
      "Extract the curriculum data, but only the main courses, exclude general courses and elective subjects";

    const parts: Part[] = isImage
      ? [
          { inlineData: { mimeType: file.type, data: buffer.toString("base64") } },
          { text: `${extractionInstruction} from this curriculum image, reading it via OCR, and return a JSON array of courses.` },
        ]
      : hasTextLayer
      ? [{ text: `${extractionInstruction} from the following text and return a JSON array of courses:\n\n${text}` }]
      : [
          { inlineData: { mimeType: "application/pdf", data: buffer.toString("base64") } },
          { text: `${extractionInstruction} from this scanned (image-based) curriculum PDF, reading it via OCR, and return a JSON array of courses.` },
        ];

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: parts,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const coursesText = response.text;
    const parsed = JSON.parse(coursesText || "[]");
    const courses = Array.isArray(parsed) ? parsed : [];

    if (courses.length === 0) {
      return NextResponse.json(
        {
          error: isImage
            ? "Gemini read the image but found no recognizable main courses. Try a clearer, higher-resolution photo that shows the full curriculum."
            : hasTextLayer
            ? "Gemini returned an empty course list. The extracted PDF text may be garbled (broken font encoding) or contained no recognizable main courses. Try re-exporting the PDF with embedded text."
            : "Gemini read the scanned pages but found no recognizable main courses. The scan quality may be too low — try a higher-resolution scan or re-export with OCR.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ courses });
  } catch (error: unknown) {
    console.error("Error parsing curriculum:", error);

    if (getErrorStatus(error) === 429) {
      return NextResponse.json(
        {
          error:
            "Gemini API quota exceeded. The free tier allows 20 requests/day for this model — it resets daily (midnight Pacific time). Try again after the reset, or enable billing on your Google AI project.",
        },
        { status: 429 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : "Failed to process curriculum";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
