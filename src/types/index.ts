export type UserRole = 'CONTROL_ROOM' | 'GOVERNMENT_OFFICER' | 'CITIZEN' | 'ADMIN';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type EmergencyStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'AI_PRIORITIZED'
  | 'TEAM_ASSIGNED'
  | 'RESCUE_IN_PROGRESS'
  | 'RESOLVED'
  | 'COMPLETED';

export type DisasterType =
  | 'FLOOD'
  | 'CYCLONE'
  | 'LANDSLIDE'
  | 'URBAN_FIRE'
  | 'INDUSTRIAL_ACCIDENT'
  | 'FOREST_FIRE'
  | 'HEATWAVE'
  | 'TRANSPORT_EMERGENCY';

export type ResourceCategory =
  | 'WATER_FOOD'
  | 'MEDICAL_SUPPLIES'
  | 'RESCUE_EQUIPMENT'
  | 'VEHICLES_BOATS'
  | 'PERSONNEL_SQUADS'
  | 'SHELTER_KITS';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  address: string;
  landmark?: string;
  verifiedAddress?: string;
  district: string;
  state: string;
  accuracyMeters?: number;
}

export interface PriorityFactor {
  factorName: string;
  pointsEarned: number;
  maxPoints: number;
  weightPercent: number;
  description: string;
}

export interface PriorityAnalysis {
  score: number; // 0 to 100
  classification: PriorityLevel;
  calculatedAt: string;
  factors: PriorityFactor[];
  primaryReasons: string[];
  aiRecommendation: string;
}

export interface EmergencyRequest {
  id: string;
  createdAt: string;
  updatedAt: string;
  reporterName: string;
  reporterPhone: string;
  reporterRole: UserRole;
  disasterType: DisasterType;
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
  location: LocationCoordinates;
  status: EmergencyStatus;
  priorityScore: number;
  priorityClassification: PriorityLevel;
  priorityAnalysis?: PriorityAnalysis;
  assignedTeamId?: string;
  assignedTeamName?: string;
  allocatedResources?: ResourceRequirement[];
  waitingTimeMinutes: number;
  voiceNoteUrl?: string;
  photoUrl?: string;
  isDuplicate?: boolean;
  duplicateOf?: string;
  resolvedNotes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: ResourceCategory;
  totalStock: number;
  allocatedStock: number;
  remainingStock: number;
  unit: string;
  district: string;
  warehouseLocation: string;
  status: 'OPTIMAL' | 'MODERATE' | 'CRITICAL' | 'DEPLETED';
  lastUpdated: string;
  activeAllocations?: InventoryAllocation[];
}

export interface InventoryAllocation {
  missionId: string;
  incidentId?: string;
  quantity: number;
  allocatedAt: string;
}

export interface RegionalTelemetry {
  id: string;
  district: string;
  rainfallMm: number;
  riverLevelMeters: number;
  floodDepthMeters?: number;
  windSpeedKmH?: number;
  forecast24h?: string;
  lastUpdated: string;
}

export interface TransitCorridor {
  id: string;
  name: string;
  fromDistrict: string;
  toDistrict: string;
  status: 'OPEN' | 'RESTRICTED' | 'IMPASSABLE';
  passabilityScore: number;
  estimatedDelayMinutes?: number;
  hazards?: string[];
  lastUpdated: string;
}

export interface ResourceRequirement {
  resourceId: string;
  resourceName: string;
  quantityRecommended: number;
  quantityAllocated: number;
  unit: string;
  reason: string;
}

export interface RescueMission {
  id: string;
  requestId: string;
  teamId: string;
  teamName: string;
  leaderName: string;
  contactPhone: string;
  assignedDistrict: string;
  personnelCount: number;
  vehicleType: string;
  status: 'DISPATCHED' | 'EN_ROUTE' | 'ON_SITE' | 'EVACUATING' | 'MISSION_COMPLETE';
  assignedAt: string;
  estimatedArrivalMinutes: number;
  location: LocationCoordinates;
  allocatedResourcesSummary: string;
  logs: MissionLog[];
  postMissionDebrief?: string;
  resourcesExpended?: ResourceRequirement[];
  isDuplicate?: boolean;
  duplicateOf?: string;
}

export interface MissionLog {
  id: string;
  timestamp: string;
  author: string;
  message: string;
  statusUpdate?: string;
}

export interface ShelterInfo {
  id: string;
  name: string;
  location: LocationCoordinates;
  district: string;
  capacity: number;
  currentOccupancy: number;
  availableCapacity: number;
  foodStockDays: number;
  waterStockDays: number;
  hasMedicalPost: boolean;
  contactPerson: string;
  phone: string;
  status: 'OPEN' | 'FULL' | 'INACCESSIBLE';
}

export interface HospitalInfo {
  id: string;
  name: string;
  location: LocationCoordinates;
  district: string;
  totalBeds: number;
  availableBeds: number;
  icuBedsTotal: number;
  icuBedsAvailable: number;
  ambulancesTotal: number;
  ambulancesAvailable: number;
  traumaLevel: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3';
  contactNumber: string;
  status: 'OPERATIONAL' | 'OVERLOADED' | 'EVACUATING';
}

export interface ScarcityForecastData {
  timeLabel: string;
  waterStock: number;
  foodStock: number;
  medicalKitsStock: number;
  criticalThresholdWater: number;
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  password?: string;
  assignedDistrict?: string;
  badgeNumber?: string;
  agencyName?: string;
  stationAddress?: string;
  bloodGroup?: string;
  emergencyContactPhone?: string;
  isVerified?: boolean;
  createdAt?: string;
  avatarUrl?: string;
}
