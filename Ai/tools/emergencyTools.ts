/**
 * AEGIS Emergency Incident Tools
 * Tool definitions & execution functions for managing emergency tickets, distress analysis, and priority scoring.
 */

export interface EmergencyQueryFilter {
  status?: string;
  district?: string;
  priorityClassification?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  disasterType?: string;
  limit?: number;
}

export interface EmergencyIncidentData {
  id: string;
  createdAt: string;
  reporterName: string;
  reporterPhone: string;
  reporterRole: 'CITIZEN' | 'GOVERNMENT_OFFICER' | 'CONTROL_ROOM' | 'ADMIN';
  disasterType: string;
  peopleAffected: number;
  injuredCount: number;
  childrenCount: number;
  seniorCount: number;
  hasFoodShortage: boolean;
  hasWaterShortage: boolean;
  roadAccessAvailable: boolean;
  waterLevelMeters?: number;
  roadStatus?: 'CLEAR' | 'SUBMERGED' | 'DEBRIS_BLOCKED' | 'UNKNOWN';
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    landmark?: string;
    verifiedAddress?: string;
    district: string;
    state: string;
  };
  status: 'PENDING' | 'AI_PRIORITIZED' | 'TEAM_ASSIGNED' | 'RESCUE_IN_PROGRESS' | 'RESOLVED' | 'COMPLETED';
  priorityScore: number;
  priorityClassification: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  isDuplicate?: boolean;
  duplicateOf?: string;
  resolvedNotes?: string;
  priorityAnalysis?: {
    score: number;
    classification: string;
    factors: Array<{
      factorName: string;
      pointsEarned: number;
      maxPoints: number;
      description: string;
    }>;
    summary: string;
  };
  voiceNoteUrl?: string;
  photoUrl?: string;
  assignedMissionId?: string;
}

/**
 * Calculates derived operational metrics for an emergency incident.
 */
export function getEmergencyMetrics(incident: Partial<EmergencyIncidentData>, availableMedicalCapacity: number) {
  const vulnerabilityCount = (incident.childrenCount || 0) + (incident.seniorCount || 0);
  const criticalMedicalPressure = availableMedicalCapacity > 0
    ? (incident.injuredCount || 0) / availableMedicalCapacity
    : ((incident.injuredCount || 0) > 0 ? Infinity : 0);
  return { vulnerabilityCount, criticalMedicalPressure };
}

/**
 * 100-point deterministic triage scoring function
 */
export function calculateIncidentPriorityScore(incident: Partial<EmergencyIncidentData>): {
  score: number;
  classification: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  factors: Array<{ factorName: string; pointsEarned: number; maxPoints: number; description: string }>;
  summary: string;
} {
  const factors = [];

  // Factor 1: People Affected (Max 25 pts)
  const people = incident.peopleAffected || 1;
  let peoplePts = 5;
  if (people > 50) peoplePts = 25;
  else if (people > 20) peoplePts = 20;
  else if (people > 10) peoplePts = 15;
  else if (people > 5) peoplePts = 10;
  factors.push({
    factorName: 'Total Headcount',
    pointsEarned: peoplePts,
    maxPoints: 25,
    description: `${people} citizens at direct risk`,
  });

  // Factor 2: Injured / Trauma Casualties (Max 20 pts)
  const injured = incident.injuredCount || 0;
  let injuredPts = 0;
  if (injured > 10) injuredPts = 20;
  else if (injured > 5) injuredPts = 16;
  else if (injured > 2) injuredPts = 12;
  else if (injured > 0) injuredPts = 8;
  factors.push({
    factorName: 'Casualty Trauma',
    pointsEarned: injuredPts,
    maxPoints: 20,
    description: `${injured} victims requiring medical trauma intervention`,
  });

  // Factor 3: Vulnerable Demographics (Max 15 pts)
  const vulnerable = (incident.childrenCount || 0) + (incident.seniorCount || 0);
  let vulnPts = 0;
  if (vulnerable > 10) vulnPts = 15;
  else if (vulnerable > 5) vulnPts = 12;
  else if (vulnerable > 2) vulnPts = 8;
  else if (vulnerable > 0) vulnPts = 4;
  factors.push({
    factorName: 'Vulnerability Demographics',
    pointsEarned: vulnPts,
    maxPoints: 15,
    description: `${incident.childrenCount || 0} infants/children and ${incident.seniorCount || 0} seniors`,
  });

  // Factor 4: Life Support Shortages (Max 15 pts)
  let shortagePts = 0;
  if (incident.hasFoodShortage && incident.hasWaterShortage) shortagePts = 15;
  else if (incident.hasWaterShortage) shortagePts = 10;
  else if (incident.hasFoodShortage) shortagePts = 7;
  factors.push({
    factorName: 'Life-Support Shortages',
    pointsEarned: shortagePts,
    maxPoints: 15,
    description:
      incident.hasFoodShortage && incident.hasWaterShortage
        ? 'Both clean water and food supplies depleted'
        : incident.hasWaterShortage
        ? 'Critical potable drinking water shortage'
        : incident.hasFoodShortage
        ? 'Food rations exhausted'
        : 'Emergency provisions stable',
  });

  // Factor 5: Inaccessibility & Isolation (Max 15 pts)
  const isolationPts = incident.roadAccessAvailable === false ? 15 : 0;
  factors.push({
    factorName: 'Physical Inaccessibility',
    pointsEarned: isolationPts,
    maxPoints: 15,
    description:
      incident.roadAccessAvailable === false
        ? 'Road access severed; amphibious or boat extraction required'
        : 'Surface road vehicular access available',
  });

  // Factor 6: Base Disaster Severity & Latency (Max 10 pts)
  let latencyPts = 5;
  if (incident.disasterType === 'FLOOD' || incident.disasterType === 'URBAN_FIRE') latencyPts = 8;
  factors.push({
    factorName: 'Disaster Type Urgency',
    pointsEarned: latencyPts,
    maxPoints: 10,
    description: `High dynamic hazard profile for ${incident.disasterType || 'FLOOD'}`,
  });

  const totalScore = Math.min(100, factors.reduce((sum, f) => sum + f.pointsEarned, 0));

  let classification: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (totalScore >= 75) classification = 'CRITICAL';
  else if (totalScore >= 50) classification = 'HIGH';
  else if (totalScore >= 25) classification = 'MEDIUM';

  const summary =
    classification === 'CRITICAL'
      ? 'IMMEDIATE RED-TIER DISPATCH: Severe threat to life with vulnerable population and physical isolation.'
      : classification === 'HIGH'
      ? 'PRIORITY DISPATCH: Urgent evacuation and relief provisioning recommended within 60 minutes.'
      : 'MONITOR & ROUTE: Standard queue processing with local relief team coordination.';

  return {
    score: totalScore,
    classification,
    factors,
    summary,
  };
}

/**
 * Tool Declaration for Gemini Function Calling
 */
export const emergencyToolDeclarations = [
  {
    name: 'fetchEmergencyIncidents',
    description: 'Retrieves active disaster incidents with filtering options for priority, status, and district.',
    parameters: {
      type: 'OBJECT',
      properties: {
        district: { type: 'STRING', description: 'Filter by district (e.g. "Cuttack", "Chaudwar")' },
        priorityClassification: { type: 'STRING', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], description: 'Filter by priority level' },
        status: { type: 'STRING', description: 'Filter by incident status (e.g. "PENDING", "TEAM_ASSIGNED")' },
        limit: { type: 'INTEGER', description: 'Max number of incidents to return' },
      },
    },
  },
  {
    name: 'calculateIncidentPriority',
    description: 'Calculates the 100-point explainable triage score and categorization for an incident.',
    parameters: {
      type: 'OBJECT',
      properties: {
        peopleAffected: { type: 'INTEGER', description: 'Number of people affected' },
        injuredCount: { type: 'INTEGER', description: 'Number of injured individuals' },
        childrenCount: { type: 'INTEGER', description: 'Number of children' },
        seniorCount: { type: 'INTEGER', description: 'Number of elderly seniors' },
        hasFoodShortage: { type: 'BOOLEAN', description: 'Whether food is exhausted' },
        hasWaterShortage: { type: 'BOOLEAN', description: 'Whether water is exhausted' },
        roadAccessAvailable: { type: 'BOOLEAN', description: 'Whether surface roads are passable' },
        disasterType: { type: 'STRING', description: 'Disaster category (e.g. FLOOD, CYCLONE)' },
      },
      required: ['peopleAffected', 'injuredCount'],
    },
  },
];
