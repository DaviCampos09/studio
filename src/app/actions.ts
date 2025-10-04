'use server';

import {
  conditionLikelihoodForecast,
  type ConditionLikelihoodForecastInput,
} from '@/ai/flows/condition-likelihood-forecast';
import type { ForecasterSchema } from '@/lib/schemas';

const parseCoordinates = (location: string): { lat: number; lng: number } | null => {
  const parts = location.split(',').map(s => s.trim());
  if (parts.length === 2) {
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }
  return null;
};

export async function getForecast(data: ForecasterSchema) {
  try {
    const { date, time, temperature, humidity, windSpeed, location } = data;

    const coords = parseCoordinates(location);
    if (!coords) {
      return { success: false, error: 'Invalid location format. Please use "latitude, longitude".' };
    }

    const dateTime = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    dateTime.setHours(hours, minutes);
    
    // Fetch weather data from Open-Meteo
    const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&start_date=${date.toISOString().split('T')[0]}&end_date=${date.toISOString().split('T')[0]}`;
    const weatherResponse = await fetch(weatherApiUrl);
    if (!weatherResponse.ok) {
        throw new Error(`Failed to fetch weather data: ${weatherResponse.statusText}`);
    }
    const weatherData = await weatherResponse.json();


    const input: ConditionLikelihoodForecastInput = {
      latitude: coords.lat,
      longitude: coords.lng,
      dateTime: dateTime.toISOString(),
      weatherData,
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
    const errorMessage = error instanceof Error ? error.message : 'Failed to get forecast. Please try again.';
    return { success: false, error: errorMessage };
  }
}
