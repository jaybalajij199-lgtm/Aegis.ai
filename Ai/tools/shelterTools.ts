/**
 * AEGIS Shelter & Evacuation Camp Tools
 * Tools for querying shelters, verifying food/water reserves, and routing civilian evacuees to uncongested relief centers.
 */

import { calculateDistanceKm } from './hospitalTools';

export interface ShelterData {
  id: string;
  name: string;
  district: string;
  capacity: number;
  currentOccupancy: number;
  availableCapacity: number;
  foodStockDays: number;
  waterStockDays: number;
  hasMedicalPost: boolean;
  contactPerson: string;
  phone: string;
  location: {
    lat: number;
    lng: number;
  };
  status: 'OPERATIONAL' | 'NEAR_CAPACITY' | 'FULL' | 'INACCESSIBLE';
}

/**
 * Calculates derived operational metrics for a shelter.
 */
export function getShelterMetrics(shelter: ShelterData) {
  const occupancyRate = shelter.capacity > 0 ? shelter.currentOccupancy / shelter.capacity : 0;
  const isFull = shelter.availableCapacity <= 0;
  return { occupancyRate, isFull };
}

/**
 * Finds and ranks available evacuation shelters by proximity and open space.
 */
export function rankNearestShelters(
  shelters: ShelterData[],
  targetLocation: { lat: number; lng: number },
  minAvailableSpace: number = 1,
  maxResults: number = 3
): Array<ShelterData & { distanceKm: number }> {
  return shelters
    .filter((s) => s.status !== 'FULL' && s.status !== 'INACCESSIBLE' && (s.capacity - s.currentOccupancy) >= minAvailableSpace)
    .map((s) => ({
      ...s,
      availableCapacity: Math.max(0, s.capacity - s.currentOccupancy),
      distanceKm: calculateDistanceKm(targetLocation.lat, targetLocation.lng, s.location.lat, s.location.lng),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, maxResults);
}

/**
 * Tool Declaration for Gemini Function Calling
 */
export const shelterToolDeclarations = [
  {
    name: 'findAvailableShelters',
    description: 'Finds nearest disaster evacuation shelters and relief camps with verified open capacity.',
    parameters: {
      type: 'OBJECT',
      properties: {
        latitude: { type: 'NUMBER', description: 'Latitude of evacuated group' },
        longitude: { type: 'NUMBER', description: 'Longitude of evacuated group' },
        headcount: { type: 'INTEGER', description: 'Number of evacuees requiring shelter' },
        district: { type: 'STRING', description: 'Target district' },
      },
      required: ['latitude', 'longitude'],
    },
  },
  {
    name: 'checkShelterProvisions',
    description: 'Inspects food, water, medical post, and contact details for a relief shelter.',
    parameters: {
      type: 'OBJECT',
      properties: {
        shelterId: { type: 'STRING', description: 'Unique shelter identifier (e.g. SHL-01)' },
      },
      required: ['shelterId'],
    },
  },
];
