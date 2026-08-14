import { useState, useEffect } from 'react';
import {
  EmergencyRequest,
  InventoryItem,
  RescueMission,
  ShelterInfo,
  HospitalInfo,
  UserProfile,
  UserRole,
  EmergencyStatus,
  ResourceRequirement
} from '../types';
import { calculateAIPriorityScore } from '../ai/priorityEngine';

// Initial Mock Data
const INITIAL_EMERGENCIES_RAW: Array<Omit<EmergencyRequest, 'priorityScore' | 'priorityClassification' | 'priorityAnalysis'>> = [
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
      state: 'Odisha'
    },
    status: 'AI_PRIORITIZED',
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
      state: 'Odisha'
    },
    status: 'TEAM_ASSIGNED',
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
      state: 'Odisha'
    },
    status: 'RESCUE_IN_PROGRESS',
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
      state: 'Odisha'
    },
    status: 'PENDING',
    waitingTimeMinutes: 15
  }
];

// Initialize with AI Priority Calculations Baseline
export const INITIAL_EMERGENCIES: EmergencyRequest[] = INITIAL_EMERGENCIES_RAW.map(raw => {
  const analysis = calculateAIPriorityScore(raw);
  return {
    ...raw,
    priorityScore: analysis.score,
    priorityClassification: analysis.classification,
    priorityAnalysis: analysis
  };
});

export const INITIAL_RESOURCES: InventoryItem[] = [
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

export const INITIAL_MISSIONS: RescueMission[] = [
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

export const INITIAL_SHELTERS: ShelterInfo[] = [
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

export const INITIAL_HOSPITALS: HospitalInfo[] = [
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
    traumaLevel: 'LEVEL_1',
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
    traumaLevel: 'LEVEL_1',
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
    traumaLevel: 'LEVEL_2',
    contactNumber: '0674-2391983',
    status: 'OPERATIONAL'
  }
];
export const PRESET_USERS: UserProfile[] = [
  {
    id: 'usr_control',
    name: 'Commander Alok Mohanty',
    role: 'CONTROL_ROOM',
    email: 'control@aegis.gov.in',
    password: 'password123',
    phone: '+91 99370 12345',
    assignedDistrict: 'Cuttack District',
    agencyName: 'State Disaster Management Authority (SDMA)',
    badgeNumber: 'SDMA-HQ-01',
    isVerified: true,
    createdAt: '2026-01-10T08:00:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'usr_field',
    name: 'Inspector Sanjeev Das',
    role: 'GOVERNMENT_OFFICER',
    email: 'field.officer@ndrf.gov.in',
    password: 'password123',
    phone: '+91 98001 55432',
    assignedDistrict: 'Cuttack District',
    agencyName: 'NDRF Battalion 03 (Cuttack)',
    badgeNumber: 'NDRF-304-S3',
    stationAddress: 'Mahanadi Waterways Post',
    isVerified: true,
    createdAt: '2026-01-15T09:30:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'usr_citizen',
    name: 'Ananya Sharma',
    role: 'CITIZEN',
    email: 'ananya.s@gmail.com',
    password: 'password123',
    phone: '+91 98451 99201',
    assignedDistrict: 'Cuttack District',
    bloodGroup: 'O+',
    emergencyContactPhone: '+91 98451 99200',
    isVerified: true,
    createdAt: '2026-02-01T11:15:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'usr_admin',
    name: 'Dr. B. K. Mohapatra',
    role: 'ADMIN',
    email: 'admin@aegis.gov.in',
    password: 'password123',
    phone: '+91 91234 00000',
    assignedDistrict: 'All Odisha Districts',
    agencyName: 'Ministry of Home Affairs & Disaster Operations',
    badgeNumber: 'ADMIN-SDMA-001',
    isVerified: true,
    createdAt: '2025-12-01T10:00:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'
  }
];

// Helper for local storage persistent users
const getInitialUsers = (): UserProfile[] => {
  if (typeof window === 'undefined') return PRESET_USERS;
  try {
    const saved = localStorage.getItem('aegis_users');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load aegis_users from localStorage', e);
  }
  return PRESET_USERS;
};

const getInitialSession = (): { isAuthenticated: boolean; currentUser: UserProfile } => {
  if (typeof window === 'undefined') {
    return { isAuthenticated: true, currentUser: PRESET_USERS[0] };
  }
  try {
    const saved = localStorage.getItem('aegis_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.currentUser && parsed.isAuthenticated) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load aegis_session from localStorage', e);
  }
  return { isAuthenticated: true, currentUser: PRESET_USERS[0] };
};

const initialSession = getInitialSession();

let isFetchedFromDB = false;

// Global State Instance for React App
let globalState = {
  users: getInitialUsers(),
  isAuthenticated: initialSession.isAuthenticated,
  currentUser: initialSession.currentUser,
  emergencies: INITIAL_EMERGENCIES,
  resources: INITIAL_RESOURCES,
  missions: INITIAL_MISSIONS,
  shelters: INITIAL_SHELTERS,
  hospitals: INITIAL_HOSPITALS,
  selectedEmergencyId: null as string | null,
  activeFilterDistrict: 'ALL',
  demoStepIndex: 0
};

// Async Data Fetcher
let isSSEConnected = false;

export const fetchAllDatabaseState = async (force = false) => {
  if (isFetchedFromDB && !force) return; // Prevent double-fetching unless forced
  try {
    const response = await fetch('/api/sync');
    if (!response.ok) return;
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return;
    }
    if (!data) return;
    const { emergencies, inventory, missions, shelters, hospitals } = data;
    if (Array.isArray(emergencies) && emergencies.length > 0) globalState.emergencies = emergencies;
    if (Array.isArray(inventory) && inventory.length > 0) globalState.resources = inventory;
    if (Array.isArray(missions) && missions.length > 0) globalState.missions = missions;
    if (Array.isArray(shelters) && shelters.length > 0) globalState.shelters = shelters;
    if (Array.isArray(hospitals) && hospitals.length > 0) globalState.hospitals = hospitals;
    isFetchedFromDB = true;
    notify();

    if (!isSSEConnected && typeof window !== 'undefined') {
      try {
        const eventSource = new EventSource('/api/stream');
        
        eventSource.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.type === 'NEW_SOS_SIGNAL') {
              globalState.emergencies = [parsed.data, ...globalState.emergencies.filter(e => e.id !== parsed.data.id)];
              notify();
            } else if (parsed.type === 'UPDATE_SOS_SIGNAL') {
              globalState.emergencies = globalState.emergencies.map(e => 
                e.id === parsed.data.id ? parsed.data : e
              );
              notify();
            }
          } catch {
            // Ignored SSE format issue
          }
        };

        eventSource.onerror = () => {
          eventSource.close();
          isSSEConnected = false;
        };

        isSSEConnected = true;
      } catch {
        // SSE not supported or blocked
      }
    }
  } catch {
    // Keep baseline in-memory state active
  }
};

const persistAuthState = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('aegis_users', JSON.stringify(globalState.users));
      localStorage.setItem(
        'aegis_session',
        JSON.stringify({
          isAuthenticated: globalState.isAuthenticated,
          currentUser: globalState.currentUser
        })
      );
    } catch (e) {
      console.error('Failed to persist auth state to localStorage', e);
    }
  }
};

const listeners = new Set<() => void>();

function notify() {
  persistAuthState();
  listeners.forEach((l) => l());
}

export function useAegisStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    fetchAllDatabaseState(); // Auto-fetch on mount

    const pollInterval = setInterval(() => {
      fetchAllDatabaseState(true);
    }, 5000); // Poll every 5 seconds for live updates

    return () => {
      listeners.delete(listener);
      clearInterval(pollInterval);
    };
  }, []);

  const setUserRole = (role: UserRole) => {
    const matchingPreset = globalState.users.find((u) => u.role === role);
    if (matchingPreset) {
      globalState.currentUser = matchingPreset;
    } else {
      globalState.currentUser = {
        ...globalState.currentUser,
        role
      };
    }
    globalState.isAuthenticated = true;
    notify();
  };

  const loginWithCredentials = async (email: string, password: string): Promise<{ success: boolean; message?: string; user?: UserProfile }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          globalState.currentUser = data.user;
          globalState.isAuthenticated = true;
          notify();
          return { success: true, user: data.user };
        }
      }
    } catch {
      // Fall through to local user check
    }

    const localUser = globalState.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (localUser) {
      if (localUser.password && localUser.password !== password) {
        return { success: false, message: 'Incorrect password' };
      }
      globalState.currentUser = localUser;
      globalState.isAuthenticated = true;
      notify();
      return { success: true, user: localUser };
    }

    return { success: false, message: 'Invalid email or password' };
  };

  const registerNewUser = (
    userData: Omit<UserProfile, 'id' | 'createdAt'> & { password?: string }
  ): { success: boolean; message?: string; user?: UserProfile } => {
    const existing = globalState.users.find((u) => u.email.toLowerCase() === userData.email.trim().toLowerCase());
    if (existing) {
      return { success: false, message: 'An account with this email address already exists.' };
    }

    const newUser: UserProfile = {
      ...userData,
      id: `usr_${Date.now()}`,
      createdAt: new Date().toISOString(),
      isVerified: userData.role === 'CITIZEN' ? true : false,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userData.name)}`
    };

    globalState.users = [newUser, ...globalState.users];
    globalState.currentUser = newUser;
    globalState.isAuthenticated = true;
    notify();
    return { success: true, user: newUser };
  };

  const logoutUser = () => {
    globalState.isAuthenticated = false;
    notify();
  };

  const updateUserProfile = (userId: string, updates: Partial<UserProfile>) => {
    globalState.users = globalState.users.map((u) => {
      if (u.id === userId) {
        return { ...u, ...updates };
      }
      return u;
    });

    if (globalState.currentUser.id === userId) {
      globalState.currentUser = { ...globalState.currentUser, ...updates };
    }
    notify();
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    globalState.users = globalState.users.map((u) => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    });

    if (globalState.currentUser.id === userId) {
      globalState.currentUser.role = newRole;
    }
    notify();
  };

  const toggleUserVerification = (userId: string) => {
    globalState.users = globalState.users.map((u) => {
      if (u.id === userId) {
        return { ...u, isVerified: !u.isVerified };
      }
      return u;
    });

    if (globalState.currentUser.id === userId) {
      globalState.currentUser.isVerified = !globalState.currentUser.isVerified;
    }
    notify();
  };

  const setSelectedEmergencyId = (id: string | null) => {
    globalState.selectedEmergencyId = id;
    notify();
  };

  const createEmergencyRequest = async (
    req: Omit<EmergencyRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'waitingTimeMinutes' | 'priorityScore' | 'priorityClassification' | 'priorityAnalysis'>
  ): Promise<EmergencyRequest> => {
    const newId = `EMG-${Math.floor(1000 + Math.random() * 9000)}`;
    const analysis = calculateAIPriorityScore({
      ...req,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'AI_PRIORITIZED',
      waitingTimeMinutes: 1,
      reporterRole: req.reporterRole || 'CITIZEN'
    });

    const fullReq: EmergencyRequest = {
      ...req,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'AI_PRIORITIZED',
      waitingTimeMinutes: 1,
      priorityScore: analysis.score,
      priorityClassification: analysis.classification,
      priorityAnalysis: analysis
    };

    // Optimistic local update
    globalState.emergencies = [fullReq, ...globalState.emergencies.filter(e => e.id !== fullReq.id)];
    notify();

    // Save to backend
    try {
      await fetch('/api/emergencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullReq)
      });
      await fetchAllDatabaseState(true);
    } catch {
      // Offline fallback already updated
    }
    return fullReq;
  };

  const allocateResources = async (
    requestId: string,
    allocatedList: ResourceRequirement[],
    officerName: string
  ) => {
    const targetReq = globalState.emergencies.find(e => e.id === requestId);
    if (targetReq) {
      const updatedReq = {
        ...targetReq,
        status: 'TEAM_ASSIGNED' as const,
        allocatedResources: allocatedList,
        updatedAt: new Date().toISOString()
      };

      const newMission: RescueMission = {
        id: `MSN-${Math.floor(1000 + Math.random() * 9000)}`,
        requestId: targetReq.id,
        teamId: `TEAM-${Math.floor(100 + Math.random() * 900)}`,
        teamName: 'Rapid Response Unit',
        leaderName: officerName,
        contactPhone: 'Contact Command',
        assignedDistrict: targetReq.location.district,
        personnelCount: 4,
        vehicleType: 'Rescue Vehicle',
        status: 'DISPATCHED',
        assignedAt: new Date().toISOString(),
        estimatedArrivalMinutes: 15,
        location: targetReq.location,
        allocatedResourcesSummary: allocatedList.map(a => `${a.quantityAllocated}x ${a.resourceId}`).join(', '),
        logs: [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            author: 'AEGIS Command',
            message: `Mission assigned. Officer ${officerName} in charge.`,
            statusUpdate: 'DISPATCHED'
          }
        ]
      };

      // Optimistic local update
      globalState.emergencies = globalState.emergencies.map(e => e.id === requestId ? updatedReq : e);
      globalState.missions = [newMission, ...globalState.missions];
      
      // Deduct stock from inventory locally
      for (const alloc of allocatedList) {
        const resItem = globalState.resources.find(r => r.id === alloc.resourceId);
        if (resItem) {
          const newAllocated = resItem.allocatedStock + alloc.quantityAllocated;
          const newRemaining = Math.max(0, resItem.totalStock - newAllocated);
          resItem.allocatedStock = newAllocated;
          resItem.remainingStock = newRemaining;
          resItem.lastUpdated = new Date().toISOString();
        }
      }
      notify();
      
      try {
        await fetch(`/api/emergencies/${requestId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedReq)
        });

        await fetch('/api/missions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMission)
        });

        for (const alloc of allocatedList) {
          const resItem = globalState.resources.find(r => r.id === alloc.resourceId);
          if (resItem) {
            await fetch(`/api/inventory/${resItem.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(resItem)
            });
          }
        }
      } catch {
        // Offline fallback
      }
    }
    await fetchAllDatabaseState(true);
  };

  const reStockResource = async (resourceId: string, additionalStock: number) => {
    const res = globalState.resources.find(r => r.id === resourceId);
    if (!res) return;
    
    const newTotal = res.totalStock + additionalStock;
    const newRemaining = res.remainingStock + additionalStock;
    const percent = Math.round((newRemaining / newTotal) * 100);
    const status = percent < 25 ? 'CRITICAL' : percent < 50 ? 'MODERATE' : 'OPTIMAL';
    
    const updatedRes = {
      ...res,
      totalStock: newTotal,
      remainingStock: newRemaining,
      status,
      lastUpdated: new Date().toISOString()
    };
    
    try {
      await fetch(`/api/inventory/${resourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRes)
      });
      await fetchAllDatabaseState(true);
    } catch (e) { console.error(e); }
  };

  const transferResourceDepot = async (resourceId: string, targetWarehouse: string, amount: number) => {
    const res = globalState.resources.find(r => r.id === resourceId);
    if (!res) return;
    
    const transferred = Math.min(res.remainingStock, amount);
    const newRemaining = res.remainingStock - transferred;
    const newTotal = Math.max(res.allocatedStock, res.totalStock - transferred);
    const percent = Math.round((newRemaining / newTotal) * 100);
    const status = percent < 20 ? 'CRITICAL' : percent < 50 ? 'MODERATE' : 'OPTIMAL';
    
    const updatedRes = {
      ...res,
      totalStock: newTotal,
      remainingStock: newRemaining,
      status,
      lastUpdated: new Date().toISOString()
    };
    
    try {
      await fetch(`/api/inventory/${resourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRes)
      });
      await fetchAllDatabaseState(true);
    } catch (e) { console.error(e); }
  };

  const addInventoryItem = (newItem: Omit<InventoryItem, 'id' | 'remainingStock' | 'lastUpdated'>) => {
    const newId = `res_${Date.now()}`;
    const remainingStock = Math.max(0, newItem.totalStock - newItem.allocatedStock);
    const item: InventoryItem = {
      ...newItem,
      id: newId,
      remainingStock,
      lastUpdated: new Date().toISOString()
    };
    globalState.resources = [item, ...globalState.resources];
    notify();
  };

  const assignRescueMission = async (
    requestId: string,
    teamName: string,
    leaderName: string,
    phone: string,
    vehicleType: string,
    personnelCount: number
  ) => {
    const req = globalState.emergencies.find((e) => e.id === requestId);
    if (!req) return;

    const newMissionId = `MIS-${Math.floor(100 + Math.random() * 900)}`;

    const newMission: RescueMission = {
      id: newMissionId,
      requestId: req.id,
      teamId: `TEAM-${Math.floor(10 + Math.random() * 90)}`,
      teamName,
      leaderName,
      contactPhone: phone,
      assignedDistrict: req.location.district,
      personnelCount,
      vehicleType,
      status: 'EN_ROUTE',
      assignedAt: new Date().toISOString(),
      estimatedArrivalMinutes: 12,
      location: req.location,
      allocatedResourcesSummary: req.allocatedResources
        ? req.allocatedResources.map((r) => `${r.quantityAllocated} ${r.unit} ${r.resourceName}`).join(', ')
        : 'Emergency Relief Supply Pack',
      logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          author: globalState.currentUser?.name || 'System',
          message: `Mission assigned to ${teamName}. Vehicle: ${vehicleType}.`
        }
      ]
    };

    const updatedReq = {
      ...req,
      status: 'TEAM_ASSIGNED' as const,
      assignedTeamId: newMission.teamId,
      assignedTeamName: teamName,
      updatedAt: new Date().toISOString()
    };

    // Optimistic local updates
    globalState.missions = [newMission, ...globalState.missions.filter(m => m.id !== newMissionId)];
    globalState.emergencies = globalState.emergencies.map(e => e.id === requestId ? updatedReq : e);
    notify();

    try {
      await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMission)
      });
      await fetch(`/api/emergencies/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedReq)
      });
      await fetchAllDatabaseState(true);
    } catch {
      // Offline fallback
    }
  };

  const updateMissionStatus = async (missionId: string, newStatus: RescueMission['status'], logMessage: string) => {
    const m = globalState.missions.find((m) => m.id === missionId);
    if (!m) return;

    let reqStatus: EmergencyStatus = 'RESCUE_IN_PROGRESS';
    const isCompleting = newStatus === 'MISSION_COMPLETE' && m.status !== 'MISSION_COMPLETE';
    if (newStatus === 'MISSION_COMPLETE') reqStatus = 'RESOLVED';

    const updatedMission = {
      ...m,
      status: newStatus,
      logs: [
        ...m.logs,
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          author: globalState.currentUser?.name || 'System',
          message: logMessage,
          statusUpdate: newStatus
        }
      ]
    };

    // Optimistic mission update
    globalState.missions = globalState.missions.map(mis => mis.id === missionId ? updatedMission : mis);
    const req = globalState.emergencies.find(e => e.id === m.requestId);
    if (req) {
      const updatedReq = { ...req, status: reqStatus, updatedAt: new Date().toISOString() };
      globalState.emergencies = globalState.emergencies.map(e => e.id === m.requestId ? updatedReq : e);
    }
    notify();
    
    try {
      await fetch(`/api/missions/${missionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMission)
      });

      if (req) {
        const updatedReq = { ...req, status: reqStatus, updatedAt: new Date().toISOString() };
        await fetch(`/api/emergencies/${m.requestId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedReq)
        });

        // Return reusable resources to inventory
        if (isCompleting && req.allocatedResources) {
          for (const alloc of req.allocatedResources) {
            const resItem = globalState.resources.find(r => r.id === alloc.resourceId);
            if (resItem) {
              const reusableCategories = ['VEHICLES_BOATS', 'PERSONNEL_SQUADS', 'RESCUE_EQUIPMENT'];
              if (reusableCategories.includes(resItem.category)) {
                const returnedQty = alloc.quantityAllocated;
                const newAllocated = Math.max(0, resItem.allocatedStock - returnedQty);
                const newRemaining = resItem.totalStock - newAllocated;
                
                const updatedRes = {
                  ...resItem,
                  allocatedStock: newAllocated,
                  remainingStock: newRemaining,
                  lastUpdated: new Date().toISOString()
                };
                
                await fetch(`/api/inventory/${resItem.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(updatedRes)
                });
              }
            }
          }
        }
      }
      await fetchAllDatabaseState(true);
    } catch {
      // Offline fallback
    }
  };

  const updateShelterOccupancy = async (shelterId: string, additionalOccupants: number) => {
    const s = globalState.shelters.find((sh) => sh.id === shelterId || sh.name === shelterId);
    if (!s) return;

    const newOccupancy = Math.min(s.capacity, Math.max(0, s.currentOccupancy + additionalOccupants));
    const newAvailable = Math.max(0, s.capacity - newOccupancy);
    const updatedShelter: ShelterInfo = {
      ...s,
      currentOccupancy: newOccupancy,
      availableCapacity: newAvailable,
      status: newAvailable === 0 ? 'FULL' : 'OPEN'
    };

    globalState.shelters = globalState.shelters.map(sh => sh.id === s.id ? updatedShelter : sh);
    notify();

    try {
      await fetch(`/api/shelters/${s.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedShelter)
      });
      await fetchAllDatabaseState(true);
    } catch {
      // Offline fallback
    }
  };

  const updateHospitalBeds = async (hospitalId: string, additionalPatients: number) => {
    const h = globalState.hospitals.find((hp) => hp.id === hospitalId || hp.name === hospitalId);
    if (!h) return;

    const newAvailableBeds = Math.max(0, h.availableBeds - additionalPatients);
    const updatedHospital: HospitalInfo = {
      ...h,
      availableBeds: newAvailableBeds,
      status: newAvailableBeds === 0 ? 'OVERLOADED' : 'OPERATIONAL'
    };

    globalState.hospitals = globalState.hospitals.map(hp => hp.id === h.id ? updatedHospital : hp);
    notify();

    try {
      await fetch(`/api/hospitals/${h.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedHospital)
      });
      await fetchAllDatabaseState(true);
    } catch {
      // Offline fallback
    }
  };

  const triggerDemoScenarioNextStep = async () => {
    globalState.demoStepIndex += 1;
    if (globalState.demoStepIndex === 1) {
      // Step 1: Inject a new critical flood request from Cuttack
      await createEmergencyRequest({
        reporterName: 'Priya Mahapatra (Village Mukhiya)',
        reporterPhone: '+91 99381 00998',
        reporterRole: 'CITIZEN',
        disasterType: 'FLOOD',
        peopleAffected: 1500,
        injuredCount: 65,
        childrenCount: 310,
        seniorCount: 210,
        hasFoodShortage: true,
        hasWaterShortage: true,
        roadAccessAvailable: false,
        description: '[HACKATHON DEMO] Embankment breached in Tangi-Choudwar block! 1,500 villagers trapped on rooftops with rising flood waters. Medical team urgently required.',
        location: {
          lat: 20.582,
          lng: 85.961,
          address: 'Tangi-Choudwar Inundated Sector, Ward 3',
          district: 'Cuttack District',
          state: 'Odisha'
        }
      });
    } else if (globalState.demoStepIndex === 2) {
      // Step 2: Auto allocate resources
      const targetReq = globalState.emergencies[0];
      await allocateResources(
        targetReq.id,
        [
          { resourceId: 'res_1', resourceName: 'Potable Water Packs (5L)', quantityRecommended: 4500, quantityAllocated: 4500, unit: 'packs', reason: 'High population dehydration prevention' },
          { resourceId: 'res_2', resourceName: 'Emergency Meal Ration Kits', quantityRecommended: 2250, quantityAllocated: 2250, unit: 'kits', reason: '48h meal survival pack' },
          { resourceId: 'res_4', resourceName: 'Motorized Inflatable Rescue Boats', quantityRecommended: 6, quantityAllocated: 6, unit: 'boats', reason: 'Boating rescue' }
        ],
        'Commander Alok Mohanty'
      );
    } else if (globalState.demoStepIndex === 3) {
      // Step 3: Dispatch team
      const targetReq = globalState.emergencies[0];
      await assignRescueMission(
        targetReq.id,
        'NDRF Special Water Rescue Unit 9',
        'Capt. Deepak Sahoo',
        '+91 94370 11223',
        '4x Motorized Speedboats + Air Ambulance',
        30
      );
    }
    notify();
  };

  const resetAllData = () => {
    globalState.emergencies = INITIAL_EMERGENCIES;
    globalState.resources = INITIAL_RESOURCES;
    globalState.missions = INITIAL_MISSIONS;
    globalState.selectedEmergencyId = 'EMG-8902';
    globalState.demoStepIndex = 0;
    notify();
  };

  return {
    currentUser: globalState.currentUser,
    isAuthenticated: globalState.isAuthenticated,
    allUsers: globalState.users,
    emergencies: globalState.emergencies,
    resources: globalState.resources,
    missions: globalState.missions,
    shelters: globalState.shelters,
    hospitals: globalState.hospitals,
    selectedEmergencyId: globalState.selectedEmergencyId,
    demoStepIndex: globalState.demoStepIndex,
    setUserRole,
    loginWithCredentials,
    registerNewUser,
    logoutUser,
    updateUserProfile,
    updateUserRole,
    toggleUserVerification,
    setSelectedEmergencyId,
    createEmergencyRequest,
    allocateResources,
    reStockResource,
    transferResourceDepot,
    addInventoryItem,
    assignRescueMission,
    updateMissionStatus,
    updateShelterOccupancy,
    updateHospitalBeds,
    triggerDemoScenarioNextStep,
    resetAllData
  };
}
