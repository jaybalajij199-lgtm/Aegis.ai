/**
 * AEGIS Allocation Validator
 * Verifies that resource allocations and facility routings adhere to life-safety constraints, capacity limits, and NDMA SOPs.
 */

import { IncidentAllocationPlan } from '../allocation/allocationEngine';
import { InventoryItemData } from '../tools/resourceTools';
import { HospitalData } from '../tools/hospitalTools';
import { ShelterData } from '../tools/shelterTools';
import { EmergencyIncidentData } from '../tools/emergencyTools';

export interface ValidationReport {
  isValid: boolean;
  incidentId: string;
  errors: string[];
  warnings: string[];
  auditMetrics: {
    supplyCoveragePercent: number;
    facilityCapacitySecured: boolean;
    transportModeCompliant: boolean;
    prioritySlaMinutes: number;
  };
}

export class AllocationValidator {
  /**
   * Validates a single incident allocation plan against current real-world constraints.
   */
  public static validatePlan(
    plan: IncidentAllocationPlan,
    incident: EmergencyIncidentData,
    inventory: InventoryItemData[],
    hospitals: HospitalData[],
    shelters: ShelterData[]
  ): ValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Validate Supply Stock Limits (Prevent Over-Allocation)
    let totalRequestedPacks = plan.recommendedRequirements.waterPacks5L + plan.recommendedRequirements.foodMealPacks;
    let totalAllocatedPacks = 0;

    for (const alloc of plan.allocatedInventory) {
      const invItem = inventory.find((i) => i.id === alloc.itemId);
      if (!invItem) {
        errors.push(`Allocated item [${alloc.name}] with ID (${alloc.itemId}) does not exist in inventory.`);
        continue;
      }
      if (alloc.quantity > invItem.remainingStock) {
        errors.push(
          `Over-allocation error: Requested ${alloc.quantity} ${alloc.unit} of [${alloc.name}], but only ${invItem.remainingStock} available in ${invItem.warehouseLocation}.`
        );
      }
      if (alloc.name.toLowerCase().includes('water') || alloc.name.toLowerCase().includes('meal')) {
        totalAllocatedPacks += alloc.quantity;
      }
    }

    const supplyCoveragePercent = totalRequestedPacks > 0 ? Math.min(100, Math.round((totalAllocatedPacks / totalRequestedPacks) * 100)) : 100;
    if (supplyCoveragePercent < 50) {
      warnings.push(`Low supply coverage (${supplyCoveragePercent}%). Secondary warehouse requisition recommended.`);
    }

    // 2. Validate Hospital Capacity Limits
    let facilityCapacitySecured = true;
    if (plan.facilityRouting.casualtyHospital) {
      const hData = hospitals.find((h) => h.id === plan.facilityRouting.casualtyHospital?.hospitalId);
      if (!hData) {
        errors.push(`Target hospital ID ${plan.facilityRouting.casualtyHospital.hospitalId} not recognized.`);
        facilityCapacitySecured = false;
      } else {
        const assigned = plan.facilityRouting.casualtyHospital.assignedCasualties;
        if (assigned > hData.availableBeds) {
          errors.push(
            `Hospital Capacity Exceeded: ${hData.name} has only ${hData.availableBeds} beds available, but ${assigned} casualties were assigned.`
          );
          facilityCapacitySecured = false;
        } else if (hData.availableBeds - assigned < 3) {
          warnings.push(`Hospital ${hData.name} will be near full capacity (remaining beds: ${hData.availableBeds - assigned}).`);
        }
      }
    }

    // 3. Validate Shelter Capacity Limits
    if (plan.facilityRouting.evacueeShelter) {
      const sData = shelters.find((s) => s.id === plan.facilityRouting.evacueeShelter?.shelterId);
      if (!sData) {
        errors.push(`Target shelter ID ${plan.facilityRouting.evacueeShelter.shelterId} not recognized.`);
        facilityCapacitySecured = false;
      } else {
        const evacuees = plan.facilityRouting.evacueeShelter.assignedEvacuees;
        const availableSpace = sData.capacity - sData.currentOccupancy;
        if (evacuees > availableSpace) {
          errors.push(
            `Shelter Capacity Exceeded: ${sData.name} has only ${availableSpace} slots open, but ${evacuees} evacuees were assigned.`
          );
          facilityCapacitySecured = false;
        } else if (availableSpace - evacuees < 10) {
          warnings.push(`Shelter ${sData.name} is approaching maximum occupancy.`);
        }
      }
    }

    // 4. Validate Transport Safety & Submersion SOPs
    let transportModeCompliant = true;
    const isWaterHazard = incident.roadAccessAvailable === false || incident.disasterType === 'FLOOD';
    if (isWaterHazard && plan.recommendedRequirements.watercraftBoats <= 0) {
      errors.push('Safety Violation: Inundated / severed road sector requires at least 1 motorized inflatable boat or watercraft.');
      transportModeCompliant = false;
    }

    // 5. Priority Response SLA
    let prioritySlaMinutes = 120;
    if (plan.priorityClassification === 'CRITICAL') prioritySlaMinutes = 30;
    else if (plan.priorityClassification === 'HIGH') prioritySlaMinutes = 60;

    if (plan.estimatedEtaMinutes > prioritySlaMinutes) {
      warnings.push(`ETA (${plan.estimatedEtaMinutes}m) exceeds target SLA of ${prioritySlaMinutes}m for ${plan.priorityClassification} priority.`);
    }

    return {
      isValid: errors.length === 0,
      incidentId: plan.incidentId,
      errors,
      warnings,
      auditMetrics: {
        supplyCoveragePercent,
        facilityCapacitySecured,
        transportModeCompliant,
        prioritySlaMinutes,
      },
    };
  }

  /**
   * Batch validation across multiple planned dispatches.
   */
  public static validateBatch(
    plans: IncidentAllocationPlan[],
    incidents: EmergencyIncidentData[],
    inventory: InventoryItemData[],
    hospitals: HospitalData[],
    shelters: ShelterData[]
  ): ValidationReport[] {
    return plans.map((plan) => {
      const inc = incidents.find((i) => i.id === plan.incidentId) || {
        id: plan.incidentId,
        createdAt: new Date().toISOString(),
        reporterName: 'Unknown',
        reporterPhone: '',
        reporterRole: 'CITIZEN' as const,
        disasterType: 'FLOOD',
        peopleAffected: 5,
        injuredCount: 0,
        childrenCount: 0,
        seniorCount: 0,
        hasFoodShortage: false,
        hasWaterShortage: false,
        roadAccessAvailable: true,
        description: '',
        location: { lat: 20.4625, lng: 85.8828, address: '', district: 'Cuttack', state: 'Odisha' },
        status: 'PENDING' as const,
        priorityScore: plan.priorityScore,
        priorityClassification: plan.priorityClassification,
      };
      return this.validatePlan(plan, inc, inventory, hospitals, shelters);
    });
  }
}
