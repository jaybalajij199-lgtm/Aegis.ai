import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let isConnected = false;

// Disable Mongoose command buffering when disconnected so operations don't hang
mongoose.set('bufferCommands', false);

export const isMongoConnected = () => isConnected;

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.log('[AEGIS DB] MONGODB_URI not configured. Operating in high-performance in-memory database mode.');
      isConnected = false;
      return;
    }
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log('[AEGIS DB] MongoDB connected successfully');
  } catch (error) {
    isConnected = false;
    console.warn('[AEGIS DB] MongoDB connection could not be established. Falling back to in-memory database:', error instanceof Error ? error.message : error);
  }
};

// --- Mongoose Schemas ---
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String },
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

// --- In-Memory Fast Cache & Fallback Store ---
export const memoryStore = {
  users: [] as any[],
  emergencies: [] as any[],
  inventory: [] as any[],
  missions: [] as any[],
  shelters: [] as any[],
  hospitals: [] as any[],
  telemetry: [] as any[],
  transit: [] as any[],
};

// --- Unified Data Access Layer (Seamless Mongo + Memory Fallback) ---
export const aegisDB = {
  // Users
  async getUsers() {
    if (isConnected) {
      try {
        return await (User as any).find({});
      } catch (e) {
        console.warn('Mongo getUsers error, using memory:', e);
      }
    }
    return memoryStore.users;
  },

  async findUser(query: { email?: string; id?: string }) {
    if (isConnected) {
      try {
        const user = await (User as any).findOne(query);
        if (user) return user;
      } catch (e) {
        console.warn('Mongo findUser error, using memory:', e);
      }
    }
    return memoryStore.users.find(u => {
      if (query.email && u.email?.toLowerCase() === query.email.toLowerCase()) return true;
      if (query.id && u.id === query.id) return true;
      return false;
    }) || null;
  },

  async saveUsers(users: any[]) {
    memoryStore.users = [...users];
    if (isConnected) {
      try {
        await (User as any).deleteMany({});
        if (users.length > 0) {
          await (User as any).insertMany(users);
        }
      } catch (e) {
        console.warn('Mongo saveUsers error:', e);
      }
    }
    return memoryStore.users;
  },

  // Emergencies
  async getEmergencies() {
    if (isConnected) {
      try {
        return await (Emergency as any).find({});
      } catch (e) {
        console.warn('Mongo getEmergencies error, using memory:', e);
      }
    }
    return memoryStore.emergencies;
  },

  async createEmergency(data: any) {
    const item = { ...data, id: data.id || `EMG-${Date.now()}` };
    memoryStore.emergencies = [item, ...memoryStore.emergencies.filter(e => e.id !== item.id)];
    if (isConnected) {
      try {
        const doc = new Emergency(item);
        await doc.save();
        return doc;
      } catch (e) {
        console.warn('Mongo createEmergency error:', e);
      }
    }
    return item;
  },

  async updateEmergency(id: string, update: any) {
    const idx = memoryStore.emergencies.findIndex(e => e.id === id);
    let updated = null;
    if (idx !== -1) {
      memoryStore.emergencies[idx] = { ...memoryStore.emergencies[idx], ...update, id };
      updated = memoryStore.emergencies[idx];
    } else {
      updated = { ...update, id };
      memoryStore.emergencies.unshift(updated);
    }

    if (isConnected) {
      try {
        return await (Emergency as any).findOneAndUpdate({ id }, update, { new: true, upsert: true });
      } catch (e) {
        console.warn('Mongo updateEmergency error:', e);
      }
    }
    return updated;
  },

  // Inventory
  async getInventory() {
    if (isConnected) {
      try {
        return await (InventoryItem as any).find({});
      } catch (e) {
        console.warn('Mongo getInventory error, using memory:', e);
      }
    }
    return memoryStore.inventory;
  },

  async updateInventory(id: string, update: any) {
    const idx = memoryStore.inventory.findIndex(i => i.id === id);
    let updated = null;
    if (idx !== -1) {
      memoryStore.inventory[idx] = { ...memoryStore.inventory[idx], ...update, id };
      updated = memoryStore.inventory[idx];
    } else {
      updated = { ...update, id };
      memoryStore.inventory.push(updated);
    }

    if (isConnected) {
      try {
        return await (InventoryItem as any).findOneAndUpdate({ id }, update, { new: true, upsert: true });
      } catch (e) {
        console.warn('Mongo updateInventory error:', e);
      }
    }
    return updated;
  },

  // Missions
  async getMissions() {
    if (isConnected) {
      try {
        return await (RescueMission as any).find({});
      } catch (e) {
        console.warn('Mongo getMissions error, using memory:', e);
      }
    }
    return memoryStore.missions;
  },

  async createMission(data: any) {
    const item = { ...data, id: data.id || `MSN-${Date.now()}` };
    memoryStore.missions = [item, ...memoryStore.missions.filter(m => m.id !== item.id)];
    if (isConnected) {
      try {
        const doc = new RescueMission(item);
        await doc.save();
        return doc;
      } catch (e) {
        console.warn('Mongo createMission error:', e);
      }
    }
    return item;
  },

  async updateMission(id: string, update: any) {
    const idx = memoryStore.missions.findIndex(m => m.id === id);
    let updated = null;
    if (idx !== -1) {
      memoryStore.missions[idx] = { ...memoryStore.missions[idx], ...update, id };
      updated = memoryStore.missions[idx];
    } else {
      updated = { ...update, id };
      memoryStore.missions.unshift(updated);
    }

    if (isConnected) {
      try {
        return await (RescueMission as any).findOneAndUpdate({ id }, update, { new: true, upsert: true });
      } catch (e) {
        console.warn('Mongo updateMission error:', e);
      }
    }
    return updated;
  },

  // Shelters
  async getShelters() {
    if (isConnected) {
      try {
        return await (ShelterInfo as any).find({});
      } catch (e) {
        console.warn('Mongo getShelters error, using memory:', e);
      }
    }
    return memoryStore.shelters;
  },

  async updateShelter(id: string, update: any) {
    const idx = memoryStore.shelters.findIndex(s => s.id === id);
    let updated = null;
    if (idx !== -1) {
      memoryStore.shelters[idx] = { ...memoryStore.shelters[idx], ...update, id };
      updated = memoryStore.shelters[idx];
    } else {
      updated = { ...update, id };
      memoryStore.shelters.push(updated);
    }

    if (isConnected) {
      try {
        return await (ShelterInfo as any).findOneAndUpdate({ id }, update, { new: true, upsert: true });
      } catch (e) {
        console.warn('Mongo updateShelter error:', e);
      }
    }
    return updated;
  },

  // Hospitals
  async getHospitals() {
    if (isConnected) {
      try {
        return await (HospitalInfo as any).find({});
      } catch (e) {
        console.warn('Mongo getHospitals error, using memory:', e);
      }
    }
    return memoryStore.hospitals;
  },

  async updateHospital(id: string, update: any) {
    const idx = memoryStore.hospitals.findIndex(h => h.id === id);
    let updated = null;
    if (idx !== -1) {
      memoryStore.hospitals[idx] = { ...memoryStore.hospitals[idx], ...update, id };
      updated = memoryStore.hospitals[idx];
    } else {
      updated = { ...update, id };
      memoryStore.hospitals.push(updated);
    }

    if (isConnected) {
      try {
        return await (HospitalInfo as any).findOneAndUpdate({ id }, update, { new: true, upsert: true });
      } catch (e) {
        console.warn('Mongo updateHospital error:', e);
      }
    }
    return updated;
  },

  // Telemetry & Transit
  async getTelemetry() {
    if (isConnected) {
      try {
        return await (RegionalTelemetry as any).find({});
      } catch (e) {
        console.warn('Mongo getTelemetry error:', e);
      }
    }
    return memoryStore.telemetry;
  },

  async getTransit() {
    if (isConnected) {
      try {
        return await (TransitCorridor as any).find({});
      } catch (e) {
        console.warn('Mongo getTransit error:', e);
      }
    }
    return memoryStore.transit;
  },

  // Unified Sync
  async syncAll() {
    const [emergencies, inventory, missions, shelters, hospitals] = await Promise.all([
      this.getEmergencies(),
      this.getInventory(),
      this.getMissions(),
      this.getShelters(),
      this.getHospitals()
    ]);
    return { emergencies, inventory, missions, shelters, hospitals };
  },

  // Admin Seed & Wipe
  async seedAll(data: any) {
    const { users, emergencies, inventory, missions, shelters, hospitals } = data;
    if (users) memoryStore.users = users;
    if (emergencies) memoryStore.emergencies = emergencies;
    if (inventory) memoryStore.inventory = inventory;
    if (missions) memoryStore.missions = missions;
    if (shelters) memoryStore.shelters = shelters;
    if (hospitals) memoryStore.hospitals = hospitals;

    if (isConnected) {
      try {
        await (User as any).deleteMany({});
        if (users?.length) await (User as any).insertMany(users);

        await (Emergency as any).deleteMany({});
        if (emergencies?.length) await (Emergency as any).insertMany(emergencies);

        await (InventoryItem as any).deleteMany({});
        if (inventory?.length) await (InventoryItem as any).insertMany(inventory);

        await (RescueMission as any).deleteMany({});
        if (missions?.length) await (RescueMission as any).insertMany(missions);

        await (ShelterInfo as any).deleteMany({});
        if (shelters?.length) await (ShelterInfo as any).insertMany(shelters);

        await (HospitalInfo as any).deleteMany({});
        if (hospitals?.length) await (HospitalInfo as any).insertMany(hospitals);
      } catch (e) {
        console.warn('Mongo seedAll error:', e);
      }
    }
  },

  async clearIncidentsOnly() {
    memoryStore.emergencies = [];
    memoryStore.missions = [];
    memoryStore.inventory = memoryStore.inventory.map(item => ({
      ...item,
      allocatedStock: 0,
      remainingStock: item.totalStock,
      activeAllocations: []
    }));

    if (isConnected) {
      try {
        await (Emergency as any).deleteMany({});
        await (RescueMission as any).deleteMany({});
        const items = await (InventoryItem as any).find({});
        for (const item of items) {
          item.allocatedStock = 0;
          item.remainingStock = item.totalStock;
          item.activeAllocations = [];
          await item.save();
        }
      } catch (e) {
        console.warn('Mongo clearIncidentsOnly error:', e);
      }
    }
  },

  async wipeAll() {
    memoryStore.users = [];
    memoryStore.emergencies = [];
    memoryStore.inventory = [];
    memoryStore.missions = [];
    memoryStore.shelters = [];
    memoryStore.hospitals = [];

    if (isConnected) {
      try {
        await (User as any).deleteMany({});
        await (Emergency as any).deleteMany({});
        await (InventoryItem as any).deleteMany({});
        await (RescueMission as any).deleteMany({});
        await (ShelterInfo as any).deleteMany({});
        await (HospitalInfo as any).deleteMany({});
      } catch (e) {
        console.warn('Mongo wipeAll error:', e);
      }
    }
  }
};
