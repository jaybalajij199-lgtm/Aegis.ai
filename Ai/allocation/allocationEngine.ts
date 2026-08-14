/**
 * AEGIS Multi-Constraint Allocation Engine
 * Computes optimized resource dispatch plans, vehicle matching, ration quantities, and facility routing.
 */

import { EmergencyIncidentData, calculateIncidentPriorityScore } from '../tools/emergencyTools';
import { InventoryItemData } from '../tools/resourceTools';
import { HospitalData, rankNearestHospitals } from '../tools/hospitalTools';
import { ShelterData, rankNearestShelters } from '../tools/shelterTools';

export interface DispatchRequirement {
  personnelSquads: number;
  personnelHeadcount: number;
  watercraftBoats: number;
  amphibiousVehicles: number;
  traumaKits: number;
  waterPacks5L: number;
  foodMealPacks: number;
  emergencyBlankets: number;
}

export interface FacilityRoutingPlan {
  evacueeShelter?: {
    shelterId: string;
    shelterName: string;
    distanceKm: number;
    assignedEvacuees: number;
    phone: string;
  };
  casualtyHospital?: {
    hospitalId: string;
    hospitalName: string;
    distanceKm: number;
    assignedCasualties: number;
    traumaLevel: string;
    phone: string;
  };
}

export interface IncidentAllocationPlan {
  incidentId: string;
  priorityScore: number;
  priorityClassification: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedRequirements: DispatchRequirement;
  allocatedInventory: Array<{
    itemId: string;
    name: string;
    quantity: number;
    unit: string;
    warehouseLocation: string;
  }>;
  facilityRouting: FacilityRoutingPlan;
  tacticalDirectives: string[];
  estimatedEtaMinutes: number;
}

export class AllocationEngine {
  /**
   * Generates a complete allocation plan for a single incident given current system state.
   */
  public static planIncidentAllocation(
    incident: EmergencyIncidentData,
    inventory: InventoryItemData[],
    hospitals: HospitalData[],
    shelters: ShelterData[]
  ): IncidentAllocationPlan {
    const priority = calculateIncidentPriorityScore(incident);
    const people = Math.max(1, incident.peopleAffected || 1);
    const injured = incident.injuredCount || 0;
    const isWaterCutoff = incident.roadAccessAvailable === false || incident.disasterType === 'FLOOD';

    // 1. Calculate operational requirements based on population and risk
    const watercraftNeeded = isWaterCutoff ? Math.max(1, Math.ceil(people / 10)) : 0;
    const amphibiousVehiclesNeeded = isWaterCutoff ? (people > 30 ? 2 : 1) : 1;
    const squadsNeeded = people > 50 ? 3 : people > 20 ? 2 : 1;
    const personnelHeadcount = squadsNeeded * 6; // 6 rescuers per squad standard

    const traumaKitsNeeded = Math.max(injured > 0 ? 2 : 0, Math.ceil(injured / 3));
    const waterPacksNeeded = people * 4; // 4 packs per person 48h survival baseline
    const mealPacksNeeded = people * 3;
    const blanketsNeeded = (incident.childrenCount || 0) + (incident.seniorCount || 0) + injured;

    const requirements: DispatchRequirement = {
      personnelSquads: squadsNeeded,
      personnelHeadcount,
      watercraftBoats: watercraftNeeded,
      amphibiousVehicles: amphibiousVehiclesNeeded,
      traumaKits: traumaKitsNeeded,
      waterPacks5L: waterPacksNeeded,
      foodMealPacks: mealPacksNeeded,
      emergencyBlankets: blanketsNeeded,
    };

    // 2. Match against inventory items
    const allocatedInventory: IncidentAllocationPlan['allocatedInventory'] = [];

    const tryAllocate = (category: string, matchKeywords: string[], targetQty: number) => {
      if (targetQty <= 0) return;
      const matched = inventory.find(
        (inv) =>
          inv.category === category &&
          matchKeywords.some((kw) => inv.name.toLowerCase().includes(kw.toLowerCase())) &&
          inv.remainingStock > 0
      );
      if (matched) {
        const qtyToGive = Math.min(targetQty, matched.remainingStock);
        allocatedInventory.push({
          itemId: matched.id,
          name: matched.name,
          quantity: qtyToGive,
          unit: matched.unit,
          warehouseLocation: matched.warehouseLocation,
        });
      }
    };

    tryAllocate('WATER_FOOD', ['Water', 'Potable'], waterPacksNeeded);
    tryAllocate('WATER_FOOD', ['Meal', 'Food', 'Ration'], mealPacksNeeded);
    tryAllocate('MEDICAL_SUPPLIES', ['Trauma', 'First Aid'], traumaKitsNeeded);
    tryAllocate('RESCUE_EQUIPMENT', ['Boat', 'Zodiac', 'Inflatable'], watercraftNeeded);
    tryAllocate('SHELTER_KITS', ['Blanket', 'Tarpaulin', 'Kit'], blanketsNeeded);

    // 3. Facility Routing (Hospital & Shelter)
    const targetLoc = incident.location || { lat: 20.4625, lng: 85.8828 };
    const routing: FacilityRoutingPlan = {};

    if (injured > 0) {
      const nearestHospitals = rankNearestHospitals(hospitals, targetLoc, injured > 3, 1);
      if (nearestHospitals.length > 0) {
        const h = nearestHospitals[0];
        routing.casualtyHospital = {
          hospitalId: h.id,
          hospitalName: h.name,
          distanceKm: h.distanceKm,
          assignedCasualties: injured,
          traumaLevel: h.traumaLevel,
          phone: h.contactPhone,
        };
      }
    }

    const evacueeCount = Math.max(0, people - injured);
    if (evacueeCount > 0) {
      const nearestShelters = rankNearestShelters(shelters, targetLoc, 5, 1);
      if (nearestShelters.length > 0) {
        const s = nearestShelters[0];
        routing.evacueeShelter = {
          shelterId: s.id,
          shelterName: s.name,
          distanceKm: s.distanceKm,
          assignedEvacuees: evacueeCount,
          phone: s.phone,
        };
      }
    }

    // 4. Tactical Directives
    const tacticalDirectives: string[] = [];
    if (isWaterCutoff) {
      tacticalDirectives.push(`Deploy ${watercraftNeeded} motorized inflatable boat(s) via northern access embankment.`);
    }
    if (injured > 0 && routing.casualtyHospital) {
      tacticalDirectives.push(`Alert ${routing.casualtyHospital.hospitalName} for incoming ${injured} trauma casualty intake.`);
    }
    if (routing.evacueeShelter) {
      tacticalDirectives.push(`Prepare intake registration at ${routing.evacueeShelter.shelterName} for ${evacueeCount} evacuees.`);
    }

    // Estimated travel time in minutes based on distance & conditions
    const baseDistance = routing.evacueeShelter?.distanceKm || routing.casualtyHospital?.distanceKm || 4.5;
    const speedKmh = isWaterCutoff ? 15 : 35;
    const estimatedEtaMinutes = Math.max(8, Math.round((baseDistance / speedKmh) * 60) + (isWaterCutoff ? 10 : 4));

    return {
      incidentId: incident.id,
      priorityScore: priority.score,
      priorityClassification: priority.classification,
      recommendedRequirements: requirements,
      allocatedInventory,
      facilityRouting: routing,
      tacticalDirectives,
      estimatedEtaMinutes,
    };
  }

  /**
   * Batch optimizes allocation across multiple emergency requests sorted by priority
   */
  public static batchPlanAllocations(
    incidents: EmergencyIncidentData[],
    inventory: InventoryItemData[],
    hospitals: HospitalData[],
    shelters: ShelterData[]
  ): IncidentAllocationPlan[] {
    const sorted = [...incidents].sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
    return sorted.map((inc) => this.planIncidentAllocation(inc, inventory, hospitals, shelters));
  }
}
