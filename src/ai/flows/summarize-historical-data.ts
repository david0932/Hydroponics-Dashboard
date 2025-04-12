'use server';
/**
 * @fileOverview Summarizes historical sensor data to identify trends and patterns.
 *
 * - summarizeHistoricalData - A function that handles the summarization process.
 * - SummarizeHistoricalDataInput - The input type for the summarizeHistoricalData function.
 * - SummarizeHistoricalDataOutput - The return type for the summarizeHistoricalData function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeHistoricalDataInputSchema = z.object({
  historicalData: z.string().describe('Historical sensor data in JSON format.'),
});
export type SummarizeHistoricalDataInput = z.infer<typeof SummarizeHistoricalDataInputSchema>;

const SummarizeHistoricalDataOutputSchema = z.object({
  summary: z.string().describe('A summary of the trends and patterns in the historical sensor data.'),
});
export type SummarizeHistoricalDataOutput = z.infer<typeof SummarizeHistoricalDataOutputSchema>;

export async function summarizeHistoricalData(input: SummarizeHistoricalDataInput): Promise<SummarizeHistoricalDataOutput> {
  return summarizeHistoricalDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeHistoricalDataPrompt',
  input: {
    schema: z.object({
      historicalData: z.string().describe('Historical sensor data in JSON format.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A summary of the trends and patterns in the historical sensor data.'),
    }),
  },
  prompt: `You are an AI assistant that analyzes historical sensor data from a hydroponic system and summarizes the trends and patterns.

Analyze the following historical data and provide a concise summary of the key trends and patterns. Be sure to identify any potential issues or areas for improvement.

Historical Data: {{{historicalData}}}`,
});

const summarizeHistoricalDataFlow = ai.defineFlow<
  typeof SummarizeHistoricalDataInputSchema,
  typeof SummarizeHistoricalDataOutputSchema
>({
  name: 'summarizeHistoricalDataFlow',
  inputSchema: SummarizeHistoricalDataInputSchema,
  outputSchema: SummarizeHistoricalDataOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
