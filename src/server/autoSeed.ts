import { aegisDB, isMongoConnected, memoryStore, User, Emergency, InventoryItem, RescueMission, ShelterInfo, HospitalInfo, RegionalTelemetry, TransitCorridor } from './db';

export const initialUsers = [
  {
    id: 'usr_control',
    name: 'Commander Alok Mohanty',
    role: 'CONTROL_ROOM',
    email: 'control@aegis.gov.in',
    phone: '+91 99370 12345',
    password: 'password123',
    badgeNumber: 'CMD-409',
    agencyName: 'State Disaster Management Authority (SDMA)',
    stationAddress: 'State Emergency Operation Center, Bhubaneswar',
    bloodGroup: 'O+',
    isVerified: true,
    createdAt: '2026-01-10T08:00:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'usr_field',
    name: 'Inspector Sanjeev Das',
    role: 'GOVERNMENT_OFFICER',
    email: 'field.officer@ndrf.gov.in',
    phone: '+91 98610 54321',
    password: 'password123',
    badgeNumber: 'NDRF-3BN-082',
    agencyName: 'NDRF 3rd Battalion',
    assignedDistrict: 'Cuttack',
    bloodGroup: 'A+',
    isVerified: true,
    createdAt: '2026-01-15T09:30:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'usr_citizen',
    name: 'Ananya Sharma',
    role: 'CITIZEN',
    email: 'ananya.s@gmail.com',
    phone: '+91 82800 98765',
    password: 'password123',
    bloodGroup: 'B+',
    emergencyContactPhone: '+91 94370 11223',
    isVerified: true,
    createdAt: '2026-02-01T11:15:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'usr_admin',
    name: 'Dr. B. K. Mohapatra',
    role: 'ADMIN',
    email: 'admin@aegis.gov.in',
    phone: '+91 94371 99887',
    password: 'password123',
    agencyName: 'Ministry of Home Affairs & Disaster Operations',
    badgeNumber: 'ADMIN-SDMA-001',
    isVerified: true,
    createdAt: '2025-12-01T10:00:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'
  }
];

export const initialHospitals = [
  {
    id: 'hosp_scb_ctc',
    name: 'SCB Medical College & Hospital',
    location: { lat: 20.4686, lng: 85.8677, address: 'Manglabag, Cuttack', district: 'Cuttack', state: 'Odisha' },
    district: 'Cuttack',
    totalBeds: 2500,
    availableBeds: 450,
    icuBedsTotal: 150,
    icuBedsAvailable: 12,
    ambulancesTotal: 25,
    ambulancesAvailable: 8,
    traumaLevel: 'Level 1',
    contactNumber: '0671-2414355',
    status: 'OPERATIONAL'
  },
  {
    id: 'hosp_aiims_bbsr',
    name: 'AIIMS Bhubaneswar',
    location: { lat: 20.2343, lng: 85.7725, address: 'Sijua, Bhubaneswar', district: 'Khordha', state: 'Odisha' },
    district: 'Khordha',
    totalBeds: 1000,
    availableBeds: 120,
    icuBedsTotal: 100,
    icuBedsAvailable: 5,
    ambulancesTotal: 15,
    ambulancesAvailable: 4,
    traumaLevel: 'Level 1',
    contactNumber: '0674-2472211',
    status: 'OPERATIONAL'
  },
  {
    id: 'hosp_capital_bbsr',
    name: 'Capital Hospital Bhubaneswar',
    location: { lat: 20.2644, lng: 85.8281, address: 'Unit 6, Bhubaneswar', district: 'Khordha', state: 'Odisha' },
    district: 'Khordha',
    totalBeds: 750,
    availableBeds: 85,
    icuBedsTotal: 40,
    icuBedsAvailable: 6,
    ambulancesTotal: 10,
    ambulancesAvailable: 3,
    traumaLevel: 'Level 2',
    contactNumber: '0674-2391983',
    status: 'OPERATIONAL'
  }
];

export const initialShelters = [
  {
    id: 'shl_kalinga_stadium',
    name: 'Kalinga Stadium Relief Camp',
    location: { lat: 20.2885, lng: 85.8197, address: 'Nayapalli, Bhubaneswar', district: 'Khordha', state: 'Odisha' },
    district: 'Khordha',
    capacity: 2500,
    currentOccupancy: 850,
    availableCapacity: 1650,
    foodStockDays: 14,
    waterStockDays: 10,
    hasMedicalPost: true,
    contactPerson: 'Rahul Sen (Camp Director)',
    phone: '+91 99371 55555',
    status: 'OPEN'
  },
  {
    id: 'shl_barabati_stadium',
    name: 'Barabati Stadium Safe House',
    location: { lat: 20.4795, lng: 85.8687, address: 'Buxi Bazar, Cuttack', district: 'Cuttack', state: 'Odisha' },
    district: 'Cuttack',
    capacity: 1800,
    currentOccupancy: 1750,
    availableCapacity: 50,
    foodStockDays: 3,
    waterStockDays: 2,
    hasMedicalPost: true,
    contactPerson: 'Sunita Dash (Camp Admin)',
    phone: '+91 82800 44444',
    status: 'OPEN'
  },
  {
    id: 'shl_choudwar_college',
    name: 'Choudwar Municipal Cyclone Shelter',
    location: { lat: 20.528, lng: 85.912, address: 'Choudwar Colony Road', district: 'Cuttack', state: 'Odisha' },
    district: 'Cuttack',
    capacity: 1200,
    currentOccupancy: 340,
    availableCapacity: 860,
    foodStockDays: 8,
    waterStockDays: 7,
    hasMedicalPost: true,
    contactPerson: 'Bimal Patnaik',
    phone: '+91 94370 88812',
    status: 'OPEN'
  }
];

export const initialInventory = [
  {
    id: 'res_1',
    name: 'Potable Water Packs (5L)',
    category: 'WATER_FOOD',
    totalStock: 50000,
    allocatedStock: 12500,
    remainingStock: 37500,
    unit: 'packs',
    district: 'Khordha',
    warehouseLocation: 'Bhubaneswar Central Depot',
    status: 'OPTIMAL',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'res_2',
    name: 'Emergency Meal Kits',
    category: 'WATER_FOOD',
    totalStock: 25000,
    allocatedStock: 18000,
    remainingStock: 7000,
    unit: 'kits',
    district: 'Cuttack',
    warehouseLocation: 'Cuttack NDRF Base',
    status: 'CRITICAL',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'res_3',
    name: 'Rigid-Hull Inflatable Boats',
    category: 'VEHICLES_BOATS',
    totalStock: 50,
    allocatedStock: 15,
    remainingStock: 35,
    unit: 'boats',
    district: 'Cuttack',
    warehouseLocation: 'Cuttack NDRF Base',
    status: 'OPTIMAL',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'res_4',
    name: 'Level 2 Trauma Medical Kits',
    category: 'MEDICAL_SUPPLIES',
    totalStock: 200,
    allocatedStock: 45,
    remainingStock: 155,
    unit: 'kits',
    district: 'Khordha',
    warehouseLocation: 'Bhubaneswar Central Depot',
    status: 'OPTIMAL',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'res_5',
    name: 'NDRF Rescue Squads',
    category: 'PERSONNEL_SQUADS',
    totalStock: 120,
    allocatedStock: 40,
    remainingStock: 80,
    unit: 'squads',
    district: 'Cuttack',
    warehouseLocation: 'NDRF 3rd Battalion Barracks',
    status: 'OPTIMAL',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'res_6',
    name: 'Heavy Duty Water Dewatering Pumps',
    category: 'RESCUE_EQUIPMENT',
    totalStock: 80,
    allocatedStock: 28,
    remainingStock: 52,
    unit: 'units',
    district: 'Cuttack',
    warehouseLocation: 'Jobra Irrigation Depot',
    status: 'OPTIMAL',
    lastUpdated: new Date().toISOString()
  }
];

export const initialEmergencies = [
  {
    id: 'EMG-8902',
    createdAt: new Date(Date.now() - 42 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
    reporterName: 'Sujit Samal',
    reporterPhone: '+91 98451 23091',
    reporterRole: 'CITIZEN',
    disasterType: 'FLOOD',
    peopleAffected: 1200,
    injuredCount: 42,
    childrenCount: 240,
    seniorCount: 180,
    hasFoodShortage: true,
    hasWaterShortage: true,
    roadAccessAvailable: false,
    description: 'Mahanadi embankment breach near Jobra Barrage. Water entering 350 houses, 42 people injured by collapse, roads completely submerged.',
    location: {
      lat: 20.4625,
      lng: 85.8828,
      address: 'Jobra Barrage Inundation Sector, Ward 12',
      district: 'Cuttack District',
      state: 'Odisha',
      accuracyMeters: 4.2
    },
    status: 'AI_PRIORITIZED',
    priorityScore: 94,
    priorityClassification: 'CRITICAL',
    waitingTimeMinutes: 42
  },
  {
    id: 'EMG-8903',
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    reporterName: 'Anusuya Behera',
    reporterPhone: '+91 97120 44921',
    reporterRole: 'CITIZEN',
    disasterType: 'FLOOD',
    peopleAffected: 450,
    injuredCount: 12,
    childrenCount: 95,
    seniorCount: 60,
    hasFoodShortage: true,
    hasWaterShortage: true,
    roadAccessAvailable: false,
    description: 'Water level reached 5 feet in Chaudwar industrial zone residential quarters. Elderly trapped on roofs.',
    location: {
      lat: 20.528,
      lng: 85.912,
      address: 'Chaudwar Housing Board Colony',
      district: 'Cuttack District',
      state: 'Odisha',
      accuracyMeters: 5.0
    },
    status: 'TEAM_ASSIGNED',
    priorityScore: 82,
    priorityClassification: 'HIGH',
    assignedTeamId: 'TEAM-01',
    assignedTeamName: 'NDRF Rapid Squad Alpha',
    waitingTimeMinutes: 25
  },
  {
    id: 'EMG-8904',
    createdAt: new Date(Date.now() - 85 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60000).toISOString(),
    reporterName: 'Pradeep Rout',
    reporterPhone: '+91 94371 88201',
    reporterRole: 'GOVERNMENT_OFFICER',
    disasterType: 'CYCLONE',
    peopleAffected: 300,
    injuredCount: 8,
    childrenCount: 50,
    seniorCount: 40,
    hasFoodShortage: false,
    hasWaterShortage: true,
    roadAccessAvailable: true,
    description: 'Cyclone high wind damage knocked down electrical grid and water tower in Jagatsinghpur border.',
    location: {
      lat: 20.268,
      lng: 86.172,
      address: 'Paradeep Highway Junction',
      district: 'Jagatsinghpur',
      state: 'Odisha',
      accuracyMeters: 6.1
    },
    status: 'RESCUE_IN_PROGRESS',
    priorityScore: 71,
    priorityClassification: 'HIGH',
    assignedTeamId: 'TEAM-02',
    assignedTeamName: 'ODRAF Disaster Response Team 4',
    waitingTimeMinutes: 85
  },
  {
    id: 'EMG-8905',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    reporterName: 'Manoj Nayak',
    reporterPhone: '+91 91234 56789',
    reporterRole: 'CITIZEN',
    disasterType: 'URBAN_FIRE',
    peopleAffected: 80,
    injuredCount: 6,
    childrenCount: 15,
    seniorCount: 10,
    hasFoodShortage: false,
    hasWaterShortage: false,
    roadAccessAvailable: true,
    description: 'Electrical short circuit fire in commercial market complex near Badambadi Bus Stand.',
    location: {
      lat: 20.455,
      lng: 85.867,
      address: 'Badambadi Commercial Complex',
      district: 'Cuttack District',
      state: 'Odisha',
      accuracyMeters: 3.5
    },
    status: 'PENDING',
    priorityScore: 68,
    priorityClassification: 'MEDIUM',
    waitingTimeMinutes: 15
  }
];

export const initialMissions = [
  {
    id: 'MSN-901',
    requestId: 'EMG-8903',
    teamId: 'TEAM-01',
    teamName: 'NDRF Rapid Squad Alpha',
    leaderName: 'Inspector Sanjeev Das',
    contactPhone: '+91 98610 54321',
    assignedDistrict: 'Cuttack',
    personnelCount: 12,
    vehicleType: '3x Motorized Inflatable Boat + 1x Amphibious Truck',
    status: 'EN_ROUTE',
    assignedAt: new Date(Date.now() - 20 * 60000).toISOString(),
    estimatedArrivalMinutes: 8,
    location: {
      lat: 20.528,
      lng: 85.912,
      address: 'Chaudwar Housing Board Colony',
      district: 'Cuttack District',
      state: 'Odisha'
    },
    allocatedResourcesSummary: '4x Watercraft Boats, 50x Potable Water 5L Packs, 30x Food Kits',
    logs: [
      {
        id: 'LOG-1',
        timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
        author: 'Commander Alok Mohanty',
        message: 'Mission initialized and assigned to NDRF Rapid Squad Alpha.',
        statusUpdate: 'DISPATCHED'
      },
      {
        id: 'LOG-2',
        timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
        author: 'Inspector Sanjeev Das',
        message: 'Convoy underway with watercraft loaded. ETA 8 minutes.',
        statusUpdate: 'EN_ROUTE'
      }
    ]
  },
  {
    id: 'MSN-902',
    requestId: 'EMG-8904',
    teamId: 'TEAM-02',
    teamName: 'ODRAF Disaster Response Team 4',
    leaderName: 'Captain Ramesh Mohanty',
    contactPhone: '+91 94371 88201',
    assignedDistrict: 'Jagatsinghpur',
    personnelCount: 16,
    vehicleType: '2x Emergency Support Trucks + Chain Saws',
    status: 'ON_SITE',
    assignedAt: new Date(Date.now() - 70 * 60000).toISOString(),
    estimatedArrivalMinutes: 0,
    location: {
      lat: 20.268,
      lng: 86.172,
      address: 'Paradeep Highway Junction',
      district: 'Jagatsinghpur',
      state: 'Odisha'
    },
    allocatedResourcesSummary: '2x Portable Generators, 100x Food Ration Kits',
    logs: [
      {
        id: 'LOG-1',
        timestamp: new Date(Date.now() - 65 * 60000).toISOString(),
        author: 'Control Room',
        message: 'Dispatched for clearing fallen transmission lines and securing water supply.',
        statusUpdate: 'DISPATCHED'
      },
      {
        id: 'LOG-2',
        timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
        author: 'Captain Ramesh Mohanty',
        message: 'On site. Highway cleared for emergency ambulances.',
        statusUpdate: 'ON_SITE'
      }
    ]
  }
];

export const initialTelemetry = [
  {
    id: 'tel_cuttack',
    district: 'Cuttack',
    rainfallMm: 142.5,
    riverLevelMeters: 4.85,
    floodDepthMeters: 1.6,
    windSpeedKmH: 45.2,
    forecast24h: 'Heavy to very heavy rainfall expected (110mm-160mm) as depression lingers over Bay of Bengal.',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'tel_khordha',
    district: 'Khordha',
    rainfallMm: 98.2,
    riverLevelMeters: 3.2,
    floodDepthMeters: 0.8,
    windSpeedKmH: 38.0,
    forecast24h: 'Moderate to heavy rain showers; Daya river level stabilizing.',
    lastUpdated: new Date().toISOString()
  }
];

export const initialTransit = [
  {
    id: 'corridor_cuttack_bbsr',
    name: 'NH-16 Twin City Expressway (Cuttack - Bhubaneswar)',
    fromDistrict: 'Cuttack',
    toDistrict: 'Khordha',
    status: 'OPEN',
    passabilityScore: 88,
    estimatedDelayMinutes: 15,
    hazards: ['Waterlogging near Phulnakhara service road', 'Slow moving military relief convoys'],
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'corridor_cuttack_choudwar',
    name: 'SH-65 Jobra Barrage Causeway',
    fromDistrict: 'Cuttack',
    toDistrict: 'Choudwar',
    status: 'IMPASSABLE',
    passabilityScore: 12,
    estimatedDelayMinutes: 120,
    hazards: ['Bridge approach road submerged under 1.4m floodwaters', 'Tree debris lodged in bridge piers'],
    lastUpdated: new Date().toISOString()
  }
];

export async function seedOnlyResources() {
  // Populate in-memory database with ONLY inventory and baseline users for authentication
  memoryStore.inventory = initialInventory;
  memoryStore.emergencies = [];
  memoryStore.missions = [];
  memoryStore.shelters = [];
  memoryStore.hospitals = [];

  // Seed MongoDB if connected
  if (isMongoConnected()) {
    try {
      // 1. Clear non-resource operational collections (emergencies, missions, shelters, hospitals)
      await (Emergency as any).deleteMany({});
      await (RescueMission as any).deleteMany({});
      await (ShelterInfo as any).deleteMany({});
      await (HospitalInfo as any).deleteMany({});
      await (RegionalTelemetry as any).deleteMany({});
      await (TransitCorridor as any).deleteMany({});

      // 2. Ensure initial users exist for login credentials
      const userCount = await (User as any).countDocuments();
      if (userCount === 0) {
        console.log('[AEGIS DB] Seeding default authentication users...');
        await (User as any).insertMany(initialUsers);
      }

      // 3. Populate ONLY inventory resources
      await (InventoryItem as any).deleteMany({});
      await (InventoryItem as any).insertMany(initialInventory);
      console.log(`[AEGIS DB] Successfully seeded ONLY ${initialInventory.length} resources into MongoDB.`);
    } catch (error) {
      console.warn('[AEGIS DB] Seed only resources error (non-fatal):', error);
    }
  }
}

export async function autoSeed() {
  await seedOnlyResources();
}

export async function autoSeedFull() {
  await seedOnlyResources();
}
