/**
 * AEGIS Hospital & Medical Facility Tools
 * Tools for hospital bed discovery, trauma level verification, ambulance availability, and ICU patient routing.
 */

export interface HospitalData {
  id: string;
  name: string;
  district: string;
  totalBeds: number;
  availableBeds: number;
  icuBedsTotal: number;
  icuBedsAvailable: number;
  ambulancesAvailable: number;
  traumaLevel: string;
  hasOxygenPlant?: boolean;
  contactPhone: string;
  location: {
    lat: number;
    lng: number;
  };
  status: 'OPERATIONAL' | 'NEAR_CAPACITY' | 'FULL';
}

/**
 * Calculates Great-Circle Haversine distance in kilometers between two coordinates
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(2);
}

/**
 * Calculates derived operational metrics for a hospital.
 */
export function getHospitalMetrics(hospital: HospitalData) {
  const bedUtilization = hospital.totalBeds > 0 ? (hospital.totalBeds - hospital.availableBeds) / hospital.totalBeds : 0;
  const icuUtilization = hospital.icuBedsTotal > 0 ? (hospital.icuBedsTotal - hospital.icuBedsAvailable) / hospital.icuBedsTotal : 0;
  return { bedUtilization, icuUtilization };
}

/**
 * Finds the best hospital matches sorted by proximity, ICU availability, and trauma level
 */
export function rankNearestHospitals(
  hospitals: HospitalData[],
  targetLocation: { lat: number; lng: number },
  requireIcu: boolean = false,
  maxResults: number = 3
): Array<HospitalData & { distanceKm: number }> {
  return hospitals
    .filter((h) => (requireIcu ? h.icuBedsAvailable > 0 : h.availableBeds > 0))
    .map((h) => ({
      ...h,
      distanceKm: calculateDistanceKm(targetLocation.lat, targetLocation.lng, h.location.lat, h.location.lng),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, maxResults);
}

/**
 * Tool Declaration for Gemini Function Calling
 */
export const hospitalToolDeclarations = [
  {
    name: 'findNearestHospitals',
    description: 'Finds and ranks nearest hospitals with available general beds or ICU trauma support.',
    parameters: {
      type: 'OBJECT',
      properties: {
        latitude: { type: 'NUMBER', description: 'Latitude coordinate of casualty location' },
        longitude: { type: 'NUMBER', description: 'Longitude coordinate of casualty location' },
        requireIcu: { type: 'BOOLEAN', description: 'Whether critical ICU ventilator beds are required' },
        district: { type: 'STRING', description: 'Optional district boundary filter' },
      },
      required: ['latitude', 'longitude'],
    },
  },
  {
    name: 'getHospitalTraumaStatus',
    description: 'Retrieves real-time bed, ICU, oxygen plant, and ambulance availability for a specific hospital.',
    parameters: {
      type: 'OBJECT',
      properties: {
        hospitalId: { type: 'STRING', description: 'Hospital unique ID (e.g. HSP-01)' },
      },
      required: ['hospitalId'],
    },
  },
];
