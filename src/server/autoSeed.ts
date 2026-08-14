import { User, Emergency, InventoryItem, RescueMission, ShelterInfo, HospitalInfo } from './db';

const initialUsers = [
  {
    id: 'usr_control',
    name: 'Commander Alok Mohanty',
    role: 'CONTROL_ROOM',
    email: 'control@aegis.gov.in',
    phone: '+91-99370-12345',
    password: 'password123',
    badgeNumber: 'CMD-409',
    agencyName: 'SDMA Odisha',
    stationAddress: 'State Emergency Operation Center, Bhubaneswar',
    bloodGroup: 'O+',
    isVerified: true,
  },
  {
    id: 'usr_officer_1',
    name: 'Inspector Sanjeev Das',
    role: 'GOVERNMENT_OFFICER',
    email: 'field.officer@ndrf.gov.in',
    phone: '+91-98610-54321',
    password: 'password123',
    badgeNumber: 'NDRF-3BN-082',
    agencyName: 'NDRF 3rd Battalion',
    assignedDistrict: 'Cuttack',
    bloodGroup: 'A+',
    isVerified: true,
  },
  {
    id: 'usr_citizen_1',
    name: 'Ananya Sharma',
    role: 'CITIZEN',
    email: 'ananya.s@gmail.com',
    phone: '+91-82800-98765',
    password: 'password123',
    bloodGroup: 'B+',
    emergencyContactPhone: '+91-94370-11223',
    isVerified: true,
  },
  {
    id: 'usr_admin',
    name: 'Dr. B. K. Mohapatra',
    role: 'ADMIN',
    email: 'admin@aegis.gov.in',
    phone: '+91-94371-99887',
    password: 'password123',
    agencyName: 'Ministry of Home Affairs',
    isVerified: true,
  }
];

export async function autoSeed() {
  try {
    const userCount = await (User as any).countDocuments();
    if (userCount === 0) {
      console.log('Database empty. Seeding with initial data...');
      await (User as any).insertMany(initialUsers);
      console.log('Seeded users successfully.');
    }
  } catch (error) {
    console.error('Error during auto-seeding:', error);
  }
}

const initialHospitals = [
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
  }
];

const initialShelters = [
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
    phone: '+91-99371-55555',
    status: 'ACTIVE'
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
    phone: '+91-82800-44444',
    status: 'NEAR_CAPACITY'
  }
];

const initialInventory = [
  {
    id: 'res_1',
    name: 'Potable Water Packs (5L)',
    category: 'WATER',
    totalStock: 50000,
    allocatedStock: 12500,
    remainingStock: 37500,
    unit: 'packs',
    district: 'Khordha',
    warehouseLocation: 'Bhubaneswar Central Depot',
    status: 'ADEQUATE',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'res_2',
    name: 'Emergency Meal Kits',
    category: 'FOOD',
    totalStock: 25000,
    allocatedStock: 18000,
    remainingStock: 7000,
    unit: 'kits',
    district: 'Cuttack',
    warehouseLocation: 'Cuttack NDRF Base',
    status: 'CRITICAL_LOW',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'res_3',
    name: 'Rigid-Hull Inflatable Boats',
    category: 'RESCUE_EQUIPMENT',
    totalStock: 50,
    allocatedStock: 15,
    remainingStock: 35,
    unit: 'boats',
    district: 'Cuttack',
    warehouseLocation: 'Cuttack NDRF Base',
    status: 'ADEQUATE',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'res_4',
    name: 'Level 2 Trauma Kits',
    category: 'MEDICAL_SUPPLIES',
    totalStock: 200,
    allocatedStock: 45,
    remainingStock: 155,
    unit: 'kits',
    district: 'Khordha',
    warehouseLocation: 'Bhubaneswar Central Depot',
    status: 'ADEQUATE',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'res_5',
    name: 'NDRF Rescue Squads',
    category: 'PERSONNEL',
    totalStock: 120,
    allocatedStock: 40,
    remainingStock: 80,
    unit: 'squads',
    district: 'Cuttack',
    warehouseLocation: 'NDRF 3rd Battalion Barracks',
    status: 'ADEQUATE',
    lastUpdated: new Date().toISOString()
  }
];

export async function autoSeedFull() {
  try {
    const hospCount = await (HospitalInfo as any).countDocuments();
    if (hospCount === 0) {
      await (HospitalInfo as any).insertMany(initialHospitals);
      console.log('Seeded hospitals successfully.');
    }
    const shlCount = await (ShelterInfo as any).countDocuments();
    if (shlCount === 0) {
      await (ShelterInfo as any).insertMany(initialShelters);
      console.log('Seeded shelters successfully.');
    }
    const invCount = await (InventoryItem as any).countDocuments();
    if (invCount === 0) {
      await (InventoryItem as any).insertMany(initialInventory);
      console.log('Seeded inventory successfully.');
    }
  } catch (error) {
    console.error('Error during full auto-seeding:', error);
  }
}
