'use server';

import {
  conditionLikelihoodForecast,
  type ConditionLikelihoodForecastInput,
} from '@/ai/flows/condition-likelihood-forecast';
import type { ForecasterSchema } from '@/lib/schemas';

// Adicionada função de geocodificação para converter nome de local em coordenadas
async function geocodeLocation(location: string): Promise<{ lat: number; lon: number; name: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'OutdoorEventForecaster/1.0 (dev@example.com)' // API Nominatim requer um User-Agent
      }
    });
    if (!response.ok) {
      console.error(`Nominatim API error: ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        name: data[0].display_name,
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding failed:', error);
    return null;
  }
}

export async function getForecast(data: ForecasterSchema) {
  try {
    const { date, time, temperature, humidity, windSpeed, location } = data;

    // Usar o serviço de geocodificação
    const geocoded = await geocodeLocation(location);
    if (!geocoded) {
      return { success: false, error: `Could not find coordinates for "${location}". Please try a different location.` };
    }

    const dateTime = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    dateTime.setHours(hours, minutes);
    
    const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${geocoded.lat}&longitude=${geocoded.lon}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&start_date=${date.toISOString().split('T')[0]}&end_date=${date.toISOString().split('T')[0]}`;
    const weatherResponse = await fetch(weatherApiUrl);
    if (!weatherResponse.ok) {
        throw new Error(`Failed to fetch weather data: ${weatherResponse.statusText}`);
    }
    const weatherData = await weatherResponse.json();

    const input: ConditionLikelihoodForecastInput = {
      latitude: geocoded.lat,
      longitude: geocoded.lon,
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
    // Retornar as coordenadas e nome encontrados para usar no front-end
    return { success: true, data: result, location: `${geocoded.lat}, ${geocoded.lon}`, displayName: geocoded.name };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get forecast. Please try again.';
    return { success: false, error: errorMessage };
  }
}
