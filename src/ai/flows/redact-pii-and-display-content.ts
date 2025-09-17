'use server';
/**
 * @fileOverview This flow extracts all content from a document, displays it, and redacts PII.
 *
 * - redactPiiAndDisplayContent - A function that handles the document redaction process.
 * - RedactPiiAndDisplayContentInput - The input type for the redactPiiAndDisplayContent function.
 * - RedactPiiAndDisplayContentOutput - The return type for the redactPiiAndDisplayContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {redactWithFallback} from './fallback-llm-on-failure';

const RedactPiiAndDisplayContentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The document to redact, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  llmSelection: z.enum(['GPT-3.5', 'LLaMA', 'Gemma 2']).describe('The LLM to use for redaction.'),
});
export type RedactPiiAndDisplayContentInput = z.infer<typeof RedactPiiAndDisplayContentInputSchema>;

const RedactPiiAndDisplayContentOutputSchema = z.object({
  redactedContent: z.string().describe('The full content of the document with PII redacted.'),
});
export type RedactPiiAndDisplayContentOutput = z.infer<typeof RedactPiiAndDisplayContentOutputSchema>;

export async function redactPiiAndDisplayContent(
  input: RedactPiiAndDisplayContentInput
): Promise<RedactPiiAndDisplayContentOutput> {
  return redactPiiAndDisplayContentFlow(input);
}

const redactPiiAndDisplayContentFlow = ai.defineFlow(
  {
    name: 'redactPiiAndDisplayContentFlow',
    inputSchema: RedactPiiAndDisplayContentInputSchema,
    outputSchema: RedactPiiAndDisplayContentOutputSchema,
  },
  async input => {
    const fallbackResult = await redactWithFallback({
      documentContent: input.documentDataUri,
      llmSelection: input.llmSelection,
    });
    
    // The visual blur will be handled by the frontend by replacing [REDACTED] with the appropriate class.
    return {
      redactedContent: fallbackResult.redactedContent,
    };
  }
);
