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
