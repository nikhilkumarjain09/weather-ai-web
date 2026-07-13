// Temperature Conversion
export function celsiusToFahrenheit(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

export function fahrenheitToCelsius(f: number): number {
  return Math.round(((f - 32) * 5) / 9);
}

// Wind speed conversion (km/h to mph)
export function kmhToMph(kmh: number): number {
  return Math.round(kmh * 0.621371);
}

// Pressure conversion (hPa to inHg)
export function hpaToInhg(hpa: number): number {
  return parseFloat((hpa * 0.02953).toFixed(2));
}

// Weather Condition Text Mapping
export function mapConditionsText(code: string): string {
  const mapping: Record<string, string> = {
    sunny: "Sunny / Clear Skies",
    cloudy: "Overcast / Cloudy",
    rainy: "Showers / Rainy",
    windy: "Breezy / Windy",
    snowy: "Snowing / Wintery",
    stormy: "Thunderstorms",
  };
  return mapping[code.toLowerCase()] || "Moderate Conditions";
}

// Weather Code Mappers to interface models
export function mapWeatherCodeToConditionCode(code: number): string {
  if (code === 0 || code === 1) return "sunny";
  if (code === 2 || code === 3) return "cloudy";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "rainy";
  if ([71, 73, 75, 85, 86].includes(code)) return "snowy";
  if ([95, 96, 99].includes(code)) return "stormy";
  return "sunny";
}

export function mapWeatherCodeToConditionsText(code: number): string {
  const mapping: Record<number, string> = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Dense Drizzle",
    61: "Slight Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    71: "Slight Snow",
    73: "Moderate Snow",
    75: "Heavy Snow",
    80: "Slight Rain Showers",
    81: "Moderate Rain Showers",
    82: "Violent Rain Showers",
    85: "Slight Snow Showers",
    86: "Heavy Snow Showers",
    95: "Thunderstorm",
    96: "Thunderstorm with Hail",
    99: "Thunderstorm with Heavy Hail",
  };
  return mapping[code] || "Clear Sky";
}

export function mapWindDirection(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(((degrees % 360) / 45)) % 8;
  return directions[index];
}

export function mapApiResponse(data: any): any {
  if (!data || typeof data !== "object") return data;

  // 1. Map weather / forecast / weather-geo response
  if (data.current) {
    const lat = data.lat ?? -1.2921;
    const lon = data.lon ?? 36.8219;
    const city = data.geo?.city ?? data.locationName ?? "Nairobi";

    const mappedCurrent = {
      temp: data.current.temperature ?? data.current.temp ?? 20,
      feelsLike: data.current.temperature ?? data.current.temp ?? 20,
      humidity: data.current.humidity ?? 64,
      windSpeed: data.current.windspeed ?? data.current.windSpeed ?? 5,
      windDirection: mapWindDirection(data.current.winddirection ?? 0),
      uvIndex: data.current.uvindex ?? 3,
      conditionsCode: mapWeatherCodeToConditionCode(data.current.weathercode ?? 0),
      conditionsText: mapWeatherCodeToConditionsText(data.current.weathercode ?? 0),
      pressure: data.current.pressure ?? 1015,
      visibility: data.current.visibility ?? 10,
      precipitation: data.current.precipitation ?? 0,
      locationName: city,
      lat,
      lon,
      aqi: data.current.aqi ?? 42,
      isDay: data.current.is_day ?? 1,
    };

    let mappedForecast: any[] = [];
    const rawForecast = data.daily ?? data.forecast ?? [];
    if (Array.isArray(rawForecast)) {
      mappedForecast = rawForecast.map((item: any) => ({
        date: item.date ?? new Date().toISOString().split("T")[0],
        minTemp: item.temp_min ?? item.minTemp ?? 15,
        maxTemp: item.temp_max ?? item.maxTemp ?? 25,
        conditionsCode: mapWeatherCodeToConditionCode(item.weathercode ?? 0),
        conditionsText: mapWeatherCodeToConditionsText(item.weathercode ?? 0),
        precipChance: item.precipitation > 0 ? Math.min(100, Math.round(item.precipitation * 100)) : 0,
      }));
    }

    return {
      ...data,
      current: mappedCurrent,
      forecast: mappedForecast,
    };
  }

  // 2. Map daily response (contains only daily/forecast)
  if (data.daily && !data.current) {
    const rawForecast = data.daily ?? [];
    const mappedForecast = rawForecast.map((item: any) => ({
      date: item.date ?? new Date().toISOString().split("T")[0],
      minTemp: item.temp_min ?? item.minTemp ?? 15,
      maxTemp: item.temp_max ?? item.maxTemp ?? 25,
      conditionsCode: mapWeatherCodeToConditionCode(item.weathercode ?? 0),
      conditionsText: mapWeatherCodeToConditionsText(item.weathercode ?? 0),
      precipChance: item.precipitation > 0 ? Math.min(100, Math.round(item.precipitation * 100)) : 0,
    }));
    return {
      ...data,
      forecast: mappedForecast,
    };
  }

  // 3. Map hourly response (contains only hourly array)
  if (Array.isArray(data.hourly)) {
    const mappedHourly = data.hourly.map((item: any) => ({
      time: item.time ?? "",
      temp: item.temp ?? 20,
      precipChance: item.precipitation > 0 ? Math.min(100, Math.round(item.precipitation * 100)) : 0,
      windSpeed: item.windspeed ?? 5,
      conditionsCode: mapWeatherCodeToConditionCode(item.weathercode ?? 0),
    }));
    return {
      ...data,
      hourly: mappedHourly,
    };
  }

  return data;
}
