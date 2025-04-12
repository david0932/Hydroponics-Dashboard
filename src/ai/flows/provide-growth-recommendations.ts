'use server';
/**
 * @fileOverview Provides AI-powered recommendations for optimizing hydroponic growth conditions.
 *
 * - provideGrowthRecommendations - A function that generates growth recommendations based on sensor data and user actions.
 * - ProvideGrowthRecommendationsInput - The input type for the provideGrowthRecommendations function.
 * - ProvideGrowthRecommendationsOutput - The return type for the provideGrowthRecommendations function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {getSensorData, SensorData} from '@/services/sensor';

const UserActionSchema = z.object({
  timestamp: z.string().describe('The timestamp of the action.'),
  description: z.string().describe('The description of the action taken.'),
});

const ProvideGrowthRecommendationsInputSchema = z.object({
  recentActions: z.array(UserActionSchema).describe('A list of recent actions taken by the user.'),
});

export type ProvideGrowthRecommendationsInput = z.infer<
  typeof ProvideGrowthRecommendationsInputSchema
>;

const ProvideGrowthRecommendationsOutputSchema = z.object({
  recommendations: z.string().describe('AI-powered recommendations for optimizing growth conditions.'),
});

export type ProvideGrowthRecommendationsOutput = z.infer<
  typeof ProvideGrowthRecommendationsOutputSchema
>;

export async function provideGrowthRecommendations(
  input: ProvideGrowthRecommendationsInput
): Promise<ProvideGrowthRecommendationsOutput> {
  return provideGrowthRecommendationsFlow(input);
}

const analyzeSensorData = ai.defineTool({
  name: 'analyzeSensorData',
  description: 'Analyzes sensor data to determine if adjustments are needed for optimal plant growth.',
  inputSchema: z.object({
    temperatureCelsius: z.number().describe('The temperature in Celsius.'),
    humidity: z.number().describe('The humidity percentage.'),
    pH: z.number().describe('The pH level.'),
    waterLevelCm: z.number().describe('The water level in centimeters.'),
  }),
  outputSchema: z.string().describe('A detailed analysis of the sensor data and recommended adjustments.'),
},
async (sensorData: SensorData) => {
    // In real production code, you should not call an LLM from inside a tool, but rather
    // call a service that uses traditional code to implement the functionality.
    // This is only for demonstrating tool use in a complete, runnable example.
    const analysisPrompt = ai.definePrompt({
      name: 'analyzeSensorDataPrompt',
      input: {
        schema: z.object({
          temperatureCelsius: z.number().describe('The temperature in Celsius.'),
          humidity: z.number().describe('The humidity percentage.'),
          pH: z.number().describe('The pH level.'),
          waterLevelCm: z.number().describe('The water level in centimeters.'),
        }),
      },
      output: {
        schema: z.string().describe('A detailed analysis of the sensor data and recommended adjustments.'),
      },
      prompt: `Analyze the following sensor data and provide recommendations for adjustments:

Temperature: {{temperatureCelsius}}°C
Humidity: {{humidity}}%
pH Level: {{pH}}
Water Level: {{waterLevelCm}} cm`,
    });
    const {output} = await analysisPrompt(sensorData);
    return output!;
  }
);

const prompt = ai.definePrompt({
  name: 'provideGrowthRecommendationsPrompt',
  input: {
    schema: z.object({
      sensorAnalysis: z.string().describe('The analysis of the sensor data.'),
      recentActions: z.array(UserActionSchema).describe('A list of recent actions taken by the user.'),
    }),
  },
  output: {
    schema: z.object({
      recommendations: z.string().describe('AI-powered recommendations for optimizing growth conditions.'),
    }),
  },
  tools: [analyzeSensorData],
  prompt: `Based on the sensor analysis: {{{sensorAnalysis}}}, and recent actions: {{{recentActions}}}, provide specific recommendations for optimizing growth conditions.`, // changed actions to recentActions
});

const provideGrowthRecommendationsFlow = ai.defineFlow<
  typeof ProvideGrowthRecommendationsInputSchema,
  typeof ProvideGrowthRecommendationsOutputSchema
>({
  name: 'provideGrowthRecommendationsFlow',
  inputSchema: ProvideGrowthRecommendationsInputSchema,
  outputSchema: ProvideGrowthRecommendationsOutputSchema,
},
async input => {
  const sensorData = await getSensorData();
  const sensorAnalysis = await analyzeSensorData(sensorData);
  const {output} = await prompt({
    ...input,
    sensorAnalysis,
  });
  return output!;
});


