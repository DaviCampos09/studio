'use server';

/**
 * @fileOverview This file defines a Genkit flow for forecasting condition likelihood.
 *
 * - conditionLikelihoodForecast - A function that forecasts the likelihood of specified weather conditions.
 * - ConditionLikelihoodForecastInput - The input type for the conditionLikelihoodForecast function.
 * - ConditionLikelihoodForecastOutput - The return type for the conditionLikelihoodForecast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConditionLikelihoodForecastInputSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  dateTime: z.string().describe('The specific date and time for the outdoor event (e.g., ISO date string).'),
  currentWeather: z.object({
    temperature: z.number(),
    humidity: z.number(),
    windSpeed: z.number(),
  }),
  comfortThresholds: z
    .object({
      temperature: z.number().optional().describe('The temperature threshold for discomfort.'),
      humidity: z.number().optional().describe('The humidity threshold for discomfort.'),
      windSpeed: z.number().optional().describe('The wind speed threshold for discomfort.'),
    })
    .optional()
    .describe('Customizable thresholds for personal comfort.'),
});


export type ConditionLikelihoodForecastInput = z.infer<
  typeof ConditionLikelihoodForecastInputSchema
>;

const ConditionLikelihoodForecastOutputSchema = z.object({
  conditionLikelihoods: z.object({
    veryHot: z.number().describe('Likelihood score (0-1) for very hot conditions.'),
    veryCold: z.number().describe('Likelihood score (0-1) for very cold conditions.'),
    veryWindy: z.number().describe('Likelihood score (0-1) for very windy conditions.'),
    veryHumid: z.number().describe('Likelihood score (0-1) for very humid conditions.'),
    uncomfortable: z
      .number()
      .describe('Likelihood score (0-1) for generally uncomfortable conditions.'),
  }),
  detailedReport: z.string().describe('A detailed report based on the provided weather data.'),
  currentWeather: z.object({
    temperature: z.number(),
    humidity: z.number(),
    windSpeed: z.number(),
  }),
});


export type ConditionLikelihoodForecastOutput = z.infer<
  typeof ConditionLikelihoodForecastOutputSchema
>;

export async function conditionLikelihoodForecast(
  input: ConditionLikelihoodForecastInput
): Promise<ConditionLikelihoodForecastOutput> {
  return conditionLikelihoodForecastFlow(input);
}

const prompt = ai.definePrompt({
  name: 'conditionLikelihoodForecastPrompt',
  input: {schema: ConditionLikelihoodForecastInputSchema},
  output: {schema: ConditionLikelihoodForecastOutputSchema},
  prompt: `You are an AI assistant specialized in interpreting weather data to forecast condition likelihoods for outdoor events.

You will receive specific weather data for a location and time. Using this data, you must determine the likelihood (from 0.0 to 1.0) of the following adverse conditions: "very hot", "very cold", "very windy", and "very humid".

- A "veryHot" score of 1.0 corresponds to temperatures above 35°C.
- A "veryCold" score of 1.0 corresponds to temperatures below 5°C.
- A "veryWindy" score of 1.0 corresponds to wind speeds above 40 km/h.
- A "veryHumid" score of 1.0 corresponds to humidity above 90%.
- The scores should scale linearly. For example, a temperature of 20°C is halfway between 5°C and 35°C, but it's not considered hot or cold, so scores should be low. The "veryHot" score should only start increasing above 25°C.

Additionally, you must calculate a general "uncomfortable" likelihood score. This score should be based on a combination of the weather data and the user's comfort thresholds if provided. For example, if the user sets a temperature threshold of 30°C and the forecast is 32°C, the "uncomfortable" score should increase.

The current weather data for the specified time is provided in the input.

Finally, generate a concise, user-friendly "detailed report" summarizing the key weather metrics (temperature, humidity, wind speed) and mention the location's coordinates.

Input Data:
- Latitude: {{{latitude}}}
- Longitude: {{{longitude}}}
- Date/Time: {{{dateTime}}}
- Comfort Thresholds: {{{comfortThresholds}}}
- Current Weather for the event:
\`\`\`json
{{{json currentWeather}}}
\`\`\`

Analyze the weather data to perform the tasks above. Your entire output must be in a single, valid JSON object that conforms to the specified output schema.
`,
});

const conditionLikelihoodForecastFlow = ai.defineFlow(
  {
    name: 'conditionLikelihoodForecastFlow',
    inputSchema: ConditionLikelihoodForecastInputSchema,
    outputSchema: ConditionLikelihoodForecastOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
