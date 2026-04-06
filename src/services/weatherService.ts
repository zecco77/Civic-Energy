export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: string;
  description: string;
  icon?: string;
}

function getWeatherDescription(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code === 1 || code === 2 || code === 3) return 'Partly cloudy';
  if (code === 45 || code === 48) return 'Fog';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code === 85 || code === 86) return 'Snow showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

export async function getWeatherData(lat: string, lon: string, dateStr?: string): Promise<WeatherData | null> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const targetDate = dateStr || today;

    if (targetDate === today) {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph`);
      if (!response.ok) return null;
      
      const data = await response.json();
      const current = data.current;
      
      if (!current) return null;

      return {
        temperature: Math.round(current.temperature_2m),
        humidity: current.relative_humidity_2m,
        windSpeed: `${Math.round(current.wind_speed_10m)} mph`,
        description: getWeatherDescription(current.weather_code),
      };
    } else {
      // Fetch daily forecast for the specific date
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max&temperature_unit=fahrenheit&wind_speed_unit=mph&start_date=${targetDate}&end_date=${targetDate}`);
      if (!response.ok) {
        // Fallback to historical API if forecast fails (e.g., date is in the past)
        const histResponse = await fetch(`https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${targetDate}&end_date=${targetDate}&daily=temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max&temperature_unit=fahrenheit&wind_speed_unit=mph`);
        if (!histResponse.ok) return null;
        
        const histData = await histResponse.json();
        const daily = histData.daily;
        if (!daily || !daily.time || daily.time.length === 0) return null;

        const avgTemp = (daily.temperature_2m_max[0] + daily.temperature_2m_min[0]) / 2;
        return {
          temperature: Math.round(avgTemp),
          humidity: 50, // Historical API doesn't easily provide daily average humidity, mock it
          windSpeed: `${Math.round(daily.wind_speed_10m_max[0])} mph`,
          description: getWeatherDescription(daily.weather_code[0]),
        };
      }
      
      const data = await response.json();
      const daily = data.daily;
      
      if (!daily || !daily.time || daily.time.length === 0) return null;

      const avgTemp = (daily.temperature_2m_max[0] + daily.temperature_2m_min[0]) / 2;

      return {
        temperature: Math.round(avgTemp),
        humidity: 60, // Daily forecast doesn't provide relative humidity, mock it
        windSpeed: `${Math.round(daily.wind_speed_10m_max[0])} mph`,
        description: getWeatherDescription(daily.weather_code[0]),
      };
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}
