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
  location: z
    .string()
    .describe('The location for which to forecast conditions (e.g., coordinates or address).'),
  dateTime: z
    .string()
    .describe('The specific date and time for the outdoor event (e.g., ISO date string).'),
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
  detailedReport: z.string().describe('A detailed report based on Earth Observation data.'),
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
  prompt: `You are an AI assistant specialized in forecasting weather condition likelihoods for outdoor events.

You will receive a location, date, and time, and optional comfort thresholds.  Using this information, you will determine the likelihood of "very hot", "very cold", "very windy", "very humid", and "uncomfortable" conditions.

Location: {{{location}}}
Date/Time: {{{dateTime}}}
Comfort Thresholds: {{{comfortThresholds}}}

Consider weather observation Earth data sources and statistical weather forecasting models.
Apply reasoning to synthesize and incorporate any given facts in your determination.  If the comfortThresholds are provided, incorporate them when determining whether conditions would be "uncomfortable".

Return the likelihood scores (0-1) for each condition.
Also, create a detailed report about predicted temperature, humidity, and wind speed for the specified location and time.

Output in JSON format.
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
