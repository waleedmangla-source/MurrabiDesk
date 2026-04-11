export interface Flight {
  id: string;
  src: string;
  dst: string;
  date: string;
  price: number;
  airline?: string;
  flightNumber?: string;
  link?: string;
}

export interface Itinerary {
  id: string;
  src: string;
  dst: string;
  budget: number;
  leaveDates: string[];
  returnDates: string[];
  lastScan?: string;
  status: 'active' | 'paused' | 'found';
}

// Mock data for initial implementation
export const MOCK_FLIGHTS: Flight[] = [
  { id: '1', src: 'JFK', dst: 'LON', date: '2026-06-15', price: 420, airline: 'Virgin Atlantic' },
  { id: '2', src: 'JFK', dst: 'PAR', date: '2026-06-16', price: 380, airline: 'Air France' },
  { id: '3', src: 'LHR', dst: 'NYC', date: '2026-07-01', price: 450, airline: 'British Airways' },
];

export async function searchFlights(origin: string, destination: string, date: string): Promise<Flight[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Real implementation would call Amadeus or scrapers here
  // For now, return filtered mock or random data centered around a trend
  return MOCK_FLIGHTS.filter(f => f.src === origin || f.dst === destination);
}
