'use server';
/**
 * @fileOverview Provides AI-powered recommendations for optimizing hydroponic system conditions based on sensor data.
 *
 * - suggestActionFromSensorData - A function that suggests actions based on sensor data.
 * - SuggestActionFromSensorDataInput - The input type for the suggestActionFromSensorData function.
 * - SuggestActionFromSensorDataOutput - The return type for the suggestActionFromSensorData function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {SensorData} from '@/services/sensor';

const SuggestActionFromSensorDataInputSchema = z.object({
  sensorData: z.object({
    temperatureCelsius: z.number().describe('The temperature reading from the sensor (in Celsius).'),
    humidity: z.number().describe('The humidity reading from the sensor (percentage).'),
    pH: z.number().describe('The pH level reading from the sensor.'),
    waterLevelCm: z.number().describe('The water level reading from the sensor (in cm).'),
    ec: z.number().describe('The EC level reading from the sensor.'),
    dissolvedOxygen: z.number().describe('The dissolved oxygen reading from the sensor (in ppm).'),
  }).describe('The sensor data from the hydroponic system.'),
  temperatureRange: z.object({
    min: z.number().describe('The minimum acceptable temperature (Celsius).'),
    max: z.number().describe('The maximum acceptable temperature (Celsius).'),
  }).describe('The acceptable temperature range.'),
  humidityRange: z.object({
    min: z.number().describe('The minimum acceptable humidity (percentage).'),
    max: z.number().describe('The maximum acceptable humidity (percentage).'),
  }).describe('The acceptable humidity range.'),
  pHRange: z.object({
    min: z.number().describe('The minimum acceptable pH level.'),
    max: z.number().describe('The maximum acceptable pH level.'),
  }).describe('The acceptable pH range.'),
  waterLevelRange: z.object({
    min: z.number().describe('The minimum acceptable water level (cm).'),
    max: z.number().describe('The maximum acceptable water level (cm).'),
  }).describe('The acceptable water level range.'),
   ecRange: z.object({
    min: z.number().describe('The minimum acceptable EC level.'),
    max: z.number().describe('The maximum acceptable EC level.'),
  }).describe('The acceptable EC range.'),
  dissolvedOxygenRange: z.object({
    min: z.number().describe('The minimum acceptable dissolved oxygen level (ppm).'),
    max: z.number().describe('The maximum acceptable dissolved oxygen level (ppm).'),
  }).describe('The acceptable dissolved oxygen range.'),
  lastLoggedActions: z.string().describe('A list of the last logged actions done to the hydroponics system.'),
});

export type SuggestActionFromSensorDataInput = z.infer<typeof SuggestActionFromSensorDataInputSchema>;

const SuggestActionFromSensorDataOutputSchema = z.object({
  suggestedActions: z.string().describe('Suggested actions to take to address out-of-range sensor readings.'),
});

export type SuggestActionFromSensorDataOutput = z.infer<typeof SuggestActionFromSensorDataOutputSchema>;

export async function suggestActionFromSensorData(input: SuggestActionFromSensorDataInput): Promise<SuggestActionFromSensorDataOutput> {
  return suggestActionFromSensorDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestActionFromSensorDataPrompt',
  input: {
    schema: z.object({
      sensorData: z.object({
        temperatureCelsius: z.number().describe('The temperature reading from the sensor (in Celsius).'),
        humidity: z.number().describe('The humidity reading from the sensor (percentage).'),
        pH: z.number().describe('The pH level reading from the sensor.'),
        waterLevelCm: z.number().describe('The water level reading from the sensor (in cm).'),
        ec: z.number().describe('The EC level reading from the sensor.'),
        dissolvedOxygen: z.number().describe('The dissolved oxygen reading from the sensor (in ppm).'),
      }).describe('The sensor data from the hydroponic system.'),
      temperatureRange: z.object({
        min: z.number().describe('The minimum acceptable temperature (Celsius).'),
        max: z.number().describe('The maximum acceptable temperature (Celsius).'),
      }).describe('The acceptable temperature range.'),
      humidityRange: z.object({
        min: z.number().describe('The minimum acceptable humidity (percentage).'),
        max: z.number().describe('The maximum acceptable humidity (percentage).'),
      }).describe('The acceptable humidity range.'),
      pHRange: z.object({
        min: z.number().describe('The minimum acceptable pH level.'),
        max: z.number().describe('The maximum acceptable pH level.'),
      }).describe('The acceptable pH range.'),
      waterLevelRange: z.object({
        min: z.number().describe('The minimum acceptable water level (cm).'),
        max: z.number().describe('The maximum acceptable water level (cm).'),
      }).describe('The acceptable water level range.'),
      ecRange: z.object({
        min: z.number().describe('The minimum acceptable EC level.'),
        max: z.number().describe('The maximum acceptable EC level.'),
      }).describe('The acceptable EC range.'),
      dissolvedOxygenRange: z.object({
        min: z.number().describe('The minimum acceptable dissolved oxygen level (ppm).'),
        max: z.number().describe('The maximum acceptable dissolved oxygen level (ppm).'),
      }).describe('The acceptable dissolved oxygen range.'),
      lastLoggedActions: z.string().describe('A list of the last logged actions done to the hydroponics system.'),
    }),
  },
  output: {
    schema: z.object({
      suggestedActions: z.string().describe('Suggested actions to take to address out-of-range sensor readings.'),
    }),
  },
  prompt: `You are an AI assistant that provides recommendations for a hydroponic system.

  Here is the current sensor data:
  Temperature: {{{sensorData.temperatureCelsius}}}°C (Range: {{{temperatureRange.min}}} - {{{temperatureRange.max}}}°C)
  Humidity: {{{sensorData.humidity}}}% (Range: {{{humidityRange.min}}} - {{{humidityRange.max}}}%)
  pH: {{{sensorData.pH}}} (Range: {{{pHRange.min}}} - {{{pHRange.max}}})
  Water Level: {{{sensorData.waterLevelCm}}} cm (Range: {{{waterLevelRange.min}}} - {{{waterLevelRange.max}}} cm)
  EC: {{{sensorData.ec}}} (Range: {{{ecRange.min}}} - {{{ecRange.max}}})
  Dissolved Oxygen: {{{sensorData.dissolvedOxygen}}} ppm (Range: {{{dissolvedOxygenRange.min}}} - {{{dissolvedOxygenRange.max}}} ppm)

  Here are the last logged actions:
  {{{lastLoggedActions}}}

  Based on this information, suggest actions to take to address any out-of-range sensor readings. Explain why the sensor reading is outside of the desired range and what impact it could have on plant growth. Prioritize immediate corrective actions and provide clear, concise instructions.
  `,
});

const suggestActionFromSensorDataFlow = ai.defineFlow<
  typeof SuggestActionFromSensorDataInputSchema,
  typeof SuggestActionFromSensorDataOutputSchema
>({
  name: 'suggestActionFromSensorDataFlow',
  inputSchema: SuggestActionFromSensorDataInputSchema,
  outputSchema: SuggestActionFromSensorDataOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
