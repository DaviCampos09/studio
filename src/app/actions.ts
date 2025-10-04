'use server';

import {
  conditionLikelihoodForecast,
  type ConditionLikelihoodForecastInput,
} from '@/ai/flows/condition-likelihood-forecast';
import type { ForecasterSchema } from '@/lib/schemas';


export async function getForecast(data: ForecasterSchema) {
  try {
    const { date, time, temperature, humidity, windSpeed, location } = data;

    const dateTime = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    dateTime.setHours(hours, minutes);

    const input: ConditionLikelihoodForecastInput = {
      location,
      dateTime: dateTime.toISOString(),
    };
    
    const tempNum = temperature ? parseFloat(temperature) : undefined;
    const humidityNum = humidity ? parseFloat(humidity) : undefined;
    const windSpeedNum = windSpeed ? parseFloat(windSpeed) : undefined;

    const thresholds = {
      temperature: tempNum !== undefined && !isNaN(tempNum) ? tempNum : undefined,
      humidity: humidityNum !== undefined && !isNaN(humidityNum) ? humidityNum : undefined,
      windSpeed: windSpeedNum !== undefined && !isNaN(windSpeedNum) ? windSpeedNum : undefined,
    };

    if (Object.values(thresholds).some(v => v !== undefined)) {
      input.comfortThresholds = thresholds;
    }
    
    const result = await conditionLikelihoodForecast(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to get forecast. Please try again.' };
  }
}
