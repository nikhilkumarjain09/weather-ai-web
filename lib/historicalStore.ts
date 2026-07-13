export interface HistoricalEntry {
  timestamp: string; // ISO date
  temp: number;
  humidity: number;
}

export interface HistoricalStore {
  [locationName: string]: HistoricalEntry[];
}

const STORAGE_KEY = "aeris-historical-trends";

export const getHistoricalTrends = (locationName: string): HistoricalEntry[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const store: HistoricalStore = JSON.parse(raw);
    return store[locationName] || [];
  } catch (e) {
    console.error("Error reading historical trends:", e);
    return [];
  }
};

export const addHistoricalEntry = (locationName: string, temp: number, humidity: number): HistoricalEntry[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const store: HistoricalStore = raw ? JSON.parse(raw) : {};

    const list = store[locationName] || [];
    const todayStr = new Date().toISOString().split("T")[0];

    // Check if we already have an entry for today
    const existingIndex = list.findIndex((e) => e.timestamp.startsWith(todayStr));
    
    const newEntry: HistoricalEntry = {
      timestamp: new Date().toISOString(),
      temp,
      humidity,
    };

    if (existingIndex !== -1) {
      list[existingIndex] = newEntry; // update today's reading
    } else {
      list.push(newEntry);
    }

    // Cap at 30 entries
    if (list.length > 30) {
      list.shift(); // remove oldest
    }

    store[locationName] = list;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return list;
  } catch (e) {
    console.error("Error writing historical trends:", e);
    return [];
  }
};
