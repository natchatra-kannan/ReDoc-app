'use server';
/**
 * @fileOverview This flow generates a report on the PII found in a document.
 *
 * - generateAnonymizationReport - A function that creates the PII report.
 * - AnonymizationReportInput - The input type for the function.
 * - AnonymizationReportOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnonymizationReportInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The document to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnonymizationReportInput = z.infer<typeof AnonymizationReportInputSchema>;

const PiiCategorySchema = z.object({
    category: z.string().describe("The category of PII found (e.g., Name, Address, Phone Number, Signature, ID)."),
    count: z.number().describe("The number of instances found for this category."),
});

const AnonymizationReportOutputSchema = z.object({
  report: z.array(PiiCategorySchema).describe('A list of PII categories found and their counts.'),
});
export type AnonymizationReportOutput = z.infer<typeof AnonymizationReportOutputSchema>;

export async function generateAnonymizationReport(input: AnonymizationReportInput): Promise<AnonymizationReportOutput> {
  return anonymizationReportFlow(input);
}

const reportPrompt = ai.definePrompt({
  name: 'anonymizationReportPrompt',
  input: {schema: AnonymizationReportInputSchema},
  output: {schema: AnonymizationReportOutputSchema},
  prompt: `You are a data privacy expert. Your task is to analyze the provided document and create a report on the Personally Identifiable Information (PII) it contains.
Identify categories of PII such as 'Name', 'Address', 'Phone Number', 'Signature', and 'ID'.
Count the occurrences of each category.
Return a structured report of your findings. If no PII is found, return an empty array.

Document:
{{media url=documentDataUri}}
`,
});

const anonymizationReportFlow = ai.defineFlow(
  {
    name: 'anonymizationReportFlow',
    inputSchema: AnonymizationReportInputSchema,
    outputSchema: AnonymizationReportOutputSchema,
  },
  async input => {
    const {output} = await reportPrompt(input);
    if (!output) {
      throw new Error('Failed to generate anonymization report.');
    }
    return { report: output.report };
  }
);
