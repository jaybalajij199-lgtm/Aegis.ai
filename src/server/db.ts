import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.warn('MONGODB_URI is not set. Database operations will fail.');
      return;
    }
    await mongoose.connect(uri);
    console.log('MongoDB Connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String }, // Plain text for demo purposes, hash in production
  assignedDistrict: { type: String },
  badgeNumber: { type: String },
  agencyName: { type: String },
  stationAddress: { type: String },
  bloodGroup: { type: String },
  emergencyContactPhone: { type: String },
  isVerified: { type: Boolean, default: true },
  createdAt: { type: String },
  avatarUrl: { type: String },
});

const LocationSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  address: String,
  landmark: String,
  verifiedAddress: String,
  district: String,
  state: String,
  accuracyMeters: Number,
});

const PriorityFactorSchema = new mongoose.Schema({
  factorName: String,
  pointsEarned: Number,
  maxPoints: Number,
  weightPercent: Number,
  description: String,
});

const PriorityAnalysisSchema = new mongoose.Schema({
  score: Number,
  classification: String,
  calculatedAt: String,
  factors: [PriorityFactorSchema],
  primaryReasons: [String],
  aiRecommendation: String,
});

const ResourceRequirementSchema = new mongoose.Schema({
  resourceId: String,
  resourceName: String,
  quantityRecommended: Number,
  quantityAllocated: Number,
  unit: String,
  reason: String,
});

const MissionLogSchema = new mongoose.Schema({
  id: String,
  timestamp: String,
  author: String,
  message: String,
  statusUpdate: String,
});

const InventoryAllocationSchema = new mongoose.Schema({
  missionId: String,
  incidentId: String,
  quantity: Number,
  allocatedAt: String,
});

const EmergencySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  createdAt: String,
  updatedAt: String,
  reporterName: String,
  reporterPhone: String,
  reporterRole: String,
  disasterType: String,
  peopleAffected: Number,
  injuredCount: Number,
  childrenCount: Number,
  seniorCount: Number,
  hasFoodShortage: Boolean,
  hasWaterShortage: Boolean,
  roadAccessAvailable: Boolean,
  waterLevelMeters: Number,
  roadStatus: String,
  description: String,
  location: LocationSchema,
  status: String,
  priorityScore: Number,
  priorityClassification: String,
  priorityAnalysis: PriorityAnalysisSchema,
  assignedTeamId: String,
  assignedTeamName: String,
  allocatedResources: [ResourceRequirementSchema],
  waitingTimeMinutes: Number,
  voiceNoteUrl: String,
  photoUrl: String,
  isDuplicate: Boolean,
  duplicateOf: String,
  resolvedNotes: String,
});

const InventoryItemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  category: String,
  totalStock: Number,
  allocatedStock: Number,
  remainingStock: Number,
  unit: String,
  district: String,
  warehouseLocation: String,
  status: String,
  lastUpdated: String,
  activeAllocations: [InventoryAllocationSchema],
});

const RegionalTelemetrySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  district: String,
  rainfallMm: Number,
  riverLevelMeters: Number,
  floodDepthMeters: Number,
  windSpeedKmH: Number,
  forecast24h: String,
  lastUpdated: String,
});

const TransitCorridorSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  fromDistrict: String,
  toDistrict: String,
  status: String,
  passabilityScore: Number,
  estimatedDelayMinutes: Number,
  hazards: [String],
  lastUpdated: String,
});

const RescueMissionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  requestId: String,
  teamId: String,
  teamName: String,
  leaderName: String,
  contactPhone: String,
  assignedDistrict: String,
  personnelCount: Number,
  vehicleType: String,
  status: String,
  assignedAt: String,
  estimatedArrivalMinutes: Number,
  location: LocationSchema,
  allocatedResourcesSummary: String,
  logs: [MissionLogSchema],
  postMissionDebrief: String,
  resourcesExpended: [ResourceRequirementSchema],
  isDuplicate: Boolean,
  duplicateOf: String,
});

const ShelterInfoSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  location: LocationSchema,
  district: String,
  capacity: Number,
  currentOccupancy: Number,
  availableCapacity: Number,
  foodStockDays: Number,
  waterStockDays: Number,
  hasMedicalPost: Boolean,
  contactPerson: String,
  phone: String,
  status: String,
});

const HospitalInfoSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  location: LocationSchema,
  district: String,
  totalBeds: Number,
  availableBeds: Number,
  icuBedsTotal: Number,
  icuBedsAvailable: Number,
  ambulancesTotal: Number,
  ambulancesAvailable: Number,
  traumaLevel: String,
  contactNumber: String,
  status: String,
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Emergency = mongoose.models.Emergency || mongoose.model('Emergency', EmergencySchema);
export const InventoryItem = mongoose.models.InventoryItem || mongoose.model('InventoryItem', InventoryItemSchema);
export const RescueMission = mongoose.models.RescueMission || mongoose.model('RescueMission', RescueMissionSchema);
export const ShelterInfo = mongoose.models.ShelterInfo || mongoose.model('ShelterInfo', ShelterInfoSchema);
export const HospitalInfo = mongoose.models.HospitalInfo || mongoose.model('HospitalInfo', HospitalInfoSchema);
export const RegionalTelemetry = mongoose.models.RegionalTelemetry || mongoose.model('RegionalTelemetry', RegionalTelemetrySchema);
export const TransitCorridor = mongoose.models.TransitCorridor || mongoose.model('TransitCorridor', TransitCorridorSchema);
