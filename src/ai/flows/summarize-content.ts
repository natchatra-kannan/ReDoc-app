'use server';
/**
 * @fileOverview This flow generates a one-line summary of a document.
 *
 * - summarizeContent - A function that handles the document summarization.
 * - SummarizeContentInput - The input type for the summarizeContent function.
 * - SummarizeContentOutput - The return type for the summarizeContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeContentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The document to summarize, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SummarizeContentInput = z.infer<typeof SummarizeContentInputSchema>;

const SummarizeContentOutputSchema = z.object({
  summary: z.string().describe('A concise one-line summary of the document content.'),
});
export type SummarizeContentOutput = z.infer<typeof SummarizeContentOutputSchema>;

export async function summarizeContent(input: SummarizeContentInput): Promise<SummarizeContentOutput> {
  return summarizeContentFlow(input);
}

const summarizePrompt = ai.definePrompt({
  name: 'summarizePrompt',
  input: {schema: SummarizeContentInputSchema},
  output: {schema: SummarizeContentOutputSchema},
  prompt: `You are an AI assistant that specializes in summarizing document content.
Analyze the provided document and generate a concise, one-line summary.
For example, if it is a resume, describe the candidate's primary role or expertise.

Document:
{{media url=documentDataUri}}
`,
});

const summarizeContentFlow = ai.defineFlow(
  {
    name: 'summarizeContentFlow',
    inputSchema: SummarizeContentInputSchema,
    outputSchema: SummarizeContentOutputSchema,
  },
  async input => {
    const {output} = await summarizePrompt(input);
    if (!output) {
      throw new Error('Failed to generate summary.');
    }
    return { summary: output.summary };
  }
);
