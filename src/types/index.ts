import { Timestamp } from "firebase/firestore";

export type RedactionDocument = {
  id: string;
  userId: string;
  fileName: string;
  originalFileUrl: string;
  createdAt: Timestamp | Date;
  status: 'processing' | 'completed' | 'failed';
  llmUsed?: string;
  error?: string;
};
