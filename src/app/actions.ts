'use server';

import {
  conditionLikelihoodForecast,
  type ConditionLikelihoodForecastInput,
} from '@/ai/flows/condition-likelihood-forecast';
import type { ForecasterSchema } from '@/lib/schemas';
import { addDays, differenceInDays } from 'date-fns';

async function geocodeLocation(location: string): Promise<{ lat: number; lon: number; name: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'OutdoorEventForecaster/1.0 (dev@example.com)'
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

async function getRealtimeForecast(geocoded: { lat: number; lon: number }, date: Date, time: string) {
    const [hours, minutes] = time.split(':').map(Number);
    date.setHours(hours, minutes);

    const dateString = date.toISOString().split('T')[0];
    const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${geocoded.lat}&longitude=${geocoded.lon}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&start_date=${dateString}&end_date=${dateString}`;

    const weatherResponse = await fetch(weatherApiUrl);
    if (!weatherResponse.ok) {
        const errorText = await weatherResponse.text();
        console.error(`Failed to fetch weather data: ${weatherResponse.statusText}`, errorText);
        throw new Error(`Failed to fetch weather data from Open-Meteo. The selected date might be out of the forecast range (up to 14 days). Please select a closer date.`);
    }
    const weatherData = await weatherResponse.json();
    const hourIndex = date.getHours();

    const temperature = weatherData?.hourly?.temperature_2m?.[hourIndex];
    const humidity = weatherData?.hourly?.relative_humidity_2m?.[hourIndex];
    const windSpeed = weatherData?.hourly?.wind_speed_10m?.[hourIndex];
    
    if (temperature === undefined || humidity === undefined || windSpeed === undefined) {
      throw new Error("There is not enough real-time data to make a forecast for the selected date and location.");
    }
    
    return { temperature, humidity, windSpeed };
}

async function getHistoricalForecast(geocoded: { lat: number; lon: number }, date: Date) {
    const today = new Date();
    const startYear = Math.max(1981, today.getFullYear() - 20);
    const endYear = today.getFullYear() - 1;

    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    const startDate = `${startYear}${month}${day}`;
    const endDate = `${endYear}${month}${day}`;

    const params = 'T2M,RH2M,WS10M'; // Temperature, Humidity, Wind Speed
    const apiUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${params}&community=RE&longitude=${geocoded.lon}&latitude=${geocoded.lat}&start=${startDate}&end=${endDate}&format=JSON`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`NASA POWER API error: ${response.statusText}`, errorText);
        throw new Error("Failed to fetch historical weather data from NASA POWER API.");
    }

    const data = await response.json();
    const t2m = data.properties.parameter.T2M;
    const rh2m = data.properties.parameter.RH2M;
    const ws10m = data.properties.parameter.WS10M;

    if (!t2m || !rh2m || !ws10m || Object.keys(t2m).length === 0) {
        throw new Error("Not enough historical data available for the selected location and date.");
    }

    const avgTemp = Object.values(t2m).reduce((sum: number, val: any) => sum + val, 0) / Object.keys(t2m).length;
    const avgHumidity = Object.values(rh2m).reduce((sum: number, val: any) => sum + val, 0) / Object.keys(rh2m).length;
    const avgWindSpeed = Object.values(ws10m).reduce((sum: number, val: any) => sum + val, 0) / Object.keys(ws10m).length;
    
    return {
        temperature: avgTemp,
        humidity: avgHumidity,
        windSpeed: avgWindSpeed,
    };
}


export async function getForecast(data: ForecasterSchema) {
  try {
    const { date, time, temperature, humidity, windSpeed, location, eventDetails } = data;

    const geocoded = await geocodeLocation(location);
    if (!geocoded) {
      return { success: false, error: `Could not find coordinates for "${location}". Please try a different location.` };
    }

    const eventDateTime = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    eventDateTime.setHours(hours, minutes);
    
    const isFutureDate = differenceInDays(eventDateTime, new Date()) > 14;
    
    let weatherData;
    if (isFutureDate) {
        weatherData = await getHistoricalForecast(geocoded, eventDateTime);
    } else {
        weatherData = await getRealtimeForecast(geocoded, eventDateTime, time);
    }

    const input: ConditionLikelihoodForecastInput = {
      latitude: geocoded.lat,
      longitude: geocoded.lon,
      dateTime: eventDateTime.toISOString(),
      eventDetails: eventDetails,
      currentWeather: {
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        windSpeed: weatherData.windSpeed,
      },
      analysisType: isFutureDate ? 'historical' : 'realtime',
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
    return { success: true, data: result, location: `${geocoded.lat}, ${geocoded.lon}`, displayName: geocoded.name };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get forecast. Please try again.';
    return { success: false, error: errorMessage };
  }
}
