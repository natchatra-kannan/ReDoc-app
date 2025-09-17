'use server';
/**
 * @fileOverview This flow extracts all content from a document, displays it, and redacts PII with a visual blur.
 *
 * - redactPiiAndDisplayContent - A function that handles the document redaction process.
 * - RedactPiiAndDisplayContentInput - The input type for the redactPiiAndDisplayContent function.
 * - RedactPiiAndDisplayContentOutput - The return type for the redactPiiAndDisplayContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RedactPiiAndDisplayContentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The document to redact, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  llmSelection: z.enum(['GPT-3.5', 'LaMDA', 'Gemma 2']).describe('The LLM to use for redaction.'),
});
export type RedactPiiAndDisplayContentInput = z.infer<typeof RedactPiiAndDisplayContentInputSchema>;

const RedactPiiAndDisplayContentOutputSchema = z.object({
  redactedContent: z.string().describe('The full content of the document with PII redacted using a baby pink glass blur.'),
});
export type RedactPiiAndDisplayContentOutput = z.infer<typeof RedactPiiAndDisplayContentOutputSchema>;

export async function redactPiiAndDisplayContent(
  input: RedactPiiAndDisplayContentInput
): Promise<RedactPiiAndDisplayContentOutput> {
  return redactPiiAndDisplayContentFlow(input);
}

const piiRedactionPrompt = ai.definePrompt({
  name: 'piiRedactionPrompt',
  input: {schema: RedactPiiAndDisplayContentInputSchema},
  output: {schema: RedactPiiAndDisplayContentOutputSchema},
  prompt: `You are an expert at redacting Personally Identifiable Information (PII) from documents.

You will receive the full content of a document. Your task is to identify and redact all PII, replacing it with a visual blur.

Document Content: {{{documentDataUri}}}

Specific PII to redact: Names, addresses, phone numbers, signatures, IDs.

Output:
The full document content with all identified PII replaced with a baby pink colored glass blur. Ensure the surrounding content remains intact and only the PII is redacted.  Do not extract the text, process and then return, instead take the original document then replace the words in the document and return the document as is with the whole content being available.`,
});

const redactPiiAndDisplayContentFlow = ai.defineFlow(
  {
    name: 'redactPiiAndDisplayContentFlow',
    inputSchema: RedactPiiAndDisplayContentInputSchema,
    outputSchema: RedactPiiAndDisplayContentOutputSchema,
  },
  async input => {
    const {output} = await piiRedactionPrompt(input);
    return output!;
  }
);
