'use server';

/**
 * @fileOverview Implements a fallback mechanism for LLM-based redaction, retrying with
 * different models (GPT-3.5, LLaMA, Gemma 2) if the primary LLM fails.
 *
 * - redactWithFallback - A function that handles the redaction process with fallback.
 * - RedactWithFallbackInput - The input type for the redactWithFallback function.
 * - RedactWithFallbackOutput - The return type for the redactWithFallback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RedactWithFallbackInputSchema = z.object({
  documentContent: z.string().describe('The content of the document to redact.'),
  llmSelection: z.enum(['GPT-3.5', 'LLaMA', 'Gemma 2']).default('GPT-3.5').describe('The LLM to use for redaction.'),
});
export type RedactWithFallbackInput = z.infer<typeof RedactWithFallbackInputSchema>;

const RedactWithFallbackOutputSchema = z.object({
  redactedContent: z.string().describe('The redacted content of the document.'),
  llmUsed: z.string().describe('The LLM that was successfully used for redaction.'),
});
export type RedactWithFallbackOutput = z.infer<typeof RedactWithFallbackOutputSchema>;

export async function redactWithFallback(input: RedactWithFallbackInput): Promise<RedactWithFallbackOutput> {
  return redactWithFallbackFlow(input);
}

const redactPrompt = ai.definePrompt({
  name: 'redactPrompt',
  input: {schema: RedactWithFallbackInputSchema},
  output: {schema: RedactWithFallbackOutputSchema},
  prompt: `You are an AI assistant specializing in redacting Personally Identifiable Information (PII) from documents.
  Your task is to identify and redact PII in the following document content. Replace any identified PII with a visual blur (baby pink colored glass blur).
  The document content is as follows:
  \n\n{{{documentContent}}}\n\n  Return the redacted content.`,
});

const redactWithFallbackFlow = ai.defineFlow(
  {
    name: 'redactWithFallbackFlow',
    inputSchema: RedactWithFallbackInputSchema,
    outputSchema: RedactWithFallbackOutputSchema,
  },
  async input => {
    const llms = ['GPT-3.5', 'LLaMA', 'Gemma 2'];
    let currentLlmIndex = llms.indexOf(input.llmSelection);
    let lastError: Error | null = null;

    while (currentLlmIndex < llms.length) {
      const llm = llms[currentLlmIndex];
      try {
        // Dynamically select the model here based on the current LLM in the loop.  No models have
        // been set up outside of the googleAI defaults in genkit.ts, so this code will only work
        // after the OpenAI and HuggingFace plugins are installed and configured.
        // Also the underlying `ai.generate` calls (in ai.definePrompt) must be configured
        // with the safetySettings as described in the documentation.
        const {output} = await redactPrompt({
          ...input,
          llmSelection: llm,
        });
        return {
          redactedContent: output!.redactedContent,
          llmUsed: llm,
        };
      } catch (error: any) {
        console.error(`Redaction with ${llm} failed:`, error);
        lastError = error;
        currentLlmIndex++;
      }
    }

    throw new Error(`All LLMs failed: ${lastError?.message ?? 'Unknown error'}`);
  }
);
