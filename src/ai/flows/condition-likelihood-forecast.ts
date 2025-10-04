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

You must use a strict linear interpolation formula for your calculations. The formula is: score = (current_value - start_value) / (end_value - start_value).

Here are the ranges for each condition:
- "veryHot": Starts at 25°C (score 0.0) and reaches its maximum at 35°C (score 1.0). For a temperature of 30.5°C, the score must be (30.5 - 25) / (35 - 25) = 0.55.
- "veryCold": Starts at 15°C (score 0.0) and reaches its maximum at 5°C (score 1.0).
- "veryWindy": Starts at 0 km/h (score 0.0) and reaches its maximum at 40 km/h (score 1.0).
- "veryHumid": Starts at 0% (score 0.0) and reaches its maximum at 90% (score 1.0).
- Scores must be clamped between 0.0 and 1.0.

Additionally, you must calculate a general "uncomfortable" likelihood score. This score should be high if the weather conditions exceed the user's specified comfort thresholds. If no thresholds are provided, make a reasonable judgment based on a combination of the other scores.

The current weather data for the specified time is provided in the input.

Finally, generate a concise, user-friendly "detailed report" summarizing the key weather metrics (temperature, humidity, wind speed) and mention the location's coordinates (latitude: {{{latitude}}}, longitude: {{{longitude}}}).

Input Data:
- Latitude: {{{latitude}}}
- Longitude: {{{longitude}}}
- Date/Time: {{{dateTime}}}
- Comfort Thresholds: {{{json comfortThresholds}}}
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
