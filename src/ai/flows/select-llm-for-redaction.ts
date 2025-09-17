'use server';
/**
 * @fileOverview This file defines a Genkit flow to select an LLM for redaction based on user preference.
 *
 * - selectLlmForRedaction - A function that selects the appropriate LLM based on the specified mode.
 * - SelectLlmForRedactionInput - The input type for the selectLlmForRedaction function, specifying the redaction mode.
 * - SelectLlmForRedactionOutput - The output type for the selectLlmForRedaction function, indicating the selected LLM name.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SelectLlmForRedactionInputSchema = z.object({
  mode: z
    .enum(['gpt35', 'llama', 'gemma2'])
    .describe('The redaction mode selected by the user: gpt35, llama, or gemma2.'),
});
export type SelectLlmForRedactionInput = z.infer<typeof SelectLlmForRedactionInputSchema>;

const SelectLlmForRedactionOutputSchema = z.object({
  llmName: z.string().describe('The name of the selected LLM.').optional(),
});
export type SelectLlmForRedactionOutput = z.infer<typeof SelectLlmForRedactionOutputSchema>;

export async function selectLlmForRedaction(input: SelectLlmForRedactionInput): Promise<SelectLlmForRedactionOutput> {
  return selectLlmForRedactionFlow(input);
}

const selectLlmForRedactionFlow = ai.defineFlow(
  {
    name: 'selectLlmForRedactionFlow',
    inputSchema: SelectLlmForRedactionInputSchema,
    outputSchema: SelectLlmForRedactionOutputSchema,
  },
  async input => {
    let llmName: string;

    switch (input.mode) {
      case 'gpt35':
        llmName = 'GPT-3.5';
        break;
      case 'llama':
        llmName = 'LLaMA';
        break;
      case 'gemma2':
        llmName = 'Gemma 2';
        break;
      default:
        throw new Error(`Unsupported redaction mode: ${input.mode}`);
    }

    return { llmName };
  }
);
