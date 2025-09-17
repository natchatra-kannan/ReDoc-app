"use server";

import { redactPiiAndDisplayContent } from "@/ai/flows/redact-pii-and-display-content";
import { db, storage } from "@/lib/firebase/config";
import { RedactionDocument } from "@/types";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { z } from "zod";

const LlmEnum = z.enum(["GPT-3.5", "LaMDA", "Gemma 2"]);

type RedactActionResult = {
  success: boolean;
  redactedContent?: string;
  error?: string;
  documentId?: string;
};

export async function redactDocument(formData: FormData): Promise<RedactActionResult> {
  const file = formData.get("file") as File;
  const llm = formData.get("llm") as string;
  const userId = formData.get("userId") as string | null;

  if (!file) {
    return { success: false, error: "No file provided." };
  }

  const parsedLlm = LlmEnum.safeParse(llm);
  if (!parsedLlm.success) {
    return { success: false, error: "Invalid LLM selection." };
  }

  let docRefId: string | undefined;

  try {
    const buffer = await file.arrayBuffer();
    const dataURI = `data:${file.type};base64,${Buffer.from(buffer).toString("base64")}`;

    if (userId) {
      const docData: Omit<RedactionDocument, "id"> = {
        userId: userId,
        fileName: file.name,
        originalFileUrl: "",
        createdAt: serverTimestamp(),
        status: "processing",
        llmUsed: parsedLlm.data,
      };
      const docRef = await addDoc(collection(db, "redactions"), docData);
      docRefId = docRef.id;

      const storageRef = ref(storage, `uploads/${userId}/${docRefId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      await updateDoc(doc(db, "redactions", docRefId), { originalFileUrl: downloadURL });
    }

    const result = await redactPiiAndDisplayContent({
      documentDataUri: dataURI,
      llmSelection: parsedLlm.data,
    });
    
    if (userId && docRefId) {
        await updateDoc(doc(db, "redactions", docRefId), { status: 'completed' });
    }

    return {
      success: true,
      redactedContent: result.redactedContent,
      documentId: docRefId,
    };
  } catch (e: any) {
    if (userId && docRefId) {
        await updateDoc(doc(db, "redactions", docRefId), { status: 'failed', error: e.message });
    }
    console.error("Redaction Error:", e);
    return { success: false, error: e.message || "An unexpected error occurred during redaction." };
  }
}
