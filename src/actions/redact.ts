"use server";

import { redactPiiAndDisplayContent } from "@/ai/flows/redact-pii-and-display-content";
import { summarizeContent } from "@/ai/flows/summarize-content";
import { z } from "zod";

const LlmEnum = z.enum(["GPT-3.5", "LLaMA", "Gemma 2"]);

type RedactActionResult = {
  success: boolean;
  redactedContent?: string;
  summary?: string;
  error?: string;
  documentId?: string;
};

export async function redactDocument(formData: FormData): Promise<RedactActionResult> {
  const file = formData.get("file") as File;
  const llm = formData.get("llm") as string;
  const userId = formData.get("userId") as string | null;
  const generateSummary = formData.get("generateSummary") === "true";

  if (!file) {
    return { success: false, error: "No file provided." };
  }

  const parsedLlm = LlmEnum.safeParse(llm);
  if (!parsedLlm.success) {
    return { success: false, error: "Invalid LLM selection." };
  }

  try {
    const buffer = await file.arrayBuffer();
    const dataURI = `data:${file.type};base64,${Buffer.from(buffer).toString("base64")}`;

    // Since auth is faked, we don't need to save to Firestore/Storage.
    // We can add this back later if real auth is restored.
    const docRefId = userId ? `fake-doc-${Date.now()}` : undefined;


    const redactionPromise = redactPiiAndDisplayContent({
      documentDataUri: dataURI,
      llmSelection: parsedLlm.data,
    });

    const summaryPromise =
      generateSummary && userId
        ? summarizeContent({ documentDataUri: dataURI })
        : Promise.resolve(null);

    const [redactionResult, summaryResult] = await Promise.all([
      redactionPromise,
      summaryPromise,
    ]);
    
    return {
      success: true,
      redactedContent: redactionResult.redactedContent,
      summary: summaryResult?.summary,
      documentId: docRefId,
    };
  } catch (e: any) {
    console.error("Redaction Error:", e);
    return { success: false, error: e.message || "An unexpected error occurred during redaction." };
  }
}
