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
  documentContent: z
    .string()
    .describe(
      "The document to redact, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
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
  output: {schema: z.object({ redactedContent: z.string() }) },
  prompt: `You are an AI assistant specializing in redacting Personally Identifiable Information (PII) from documents.
Your task is to identify and redact PII from the document provided.
First, extract all the text from the document.
Then, replace any identified PII (Names, addresses, phone numbers, signatures, IDs) with the string '[REDACTED]'.
Finally, return the full extracted text with the redactions applied.

Document:
{{media url=documentContent}}
`,
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
    if (currentLlmIndex === -1) currentLlmIndex = 0;

    let lastError: Error | null = null;

    while (currentLlmIndex < llms.length) {
      const llm = llms[currentLlmIndex] as 'GPT-3.5' | 'LLaMA' | 'Gemma 2';
      try {
        const {output} = await redactPrompt({
          ...input,
          llmSelection: llm,
        });
        if (!output) {
          throw new Error('No output from redaction prompt');
        }
        return {
          redactedContent: output.redactedContent,
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
