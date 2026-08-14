/**
 * AEGIS Resource & Inventory Management Tools
 * Tools for querying warehouse depots, allocating disaster equipment/rations, and calculating supply burn rates.
 */

export interface InventoryItemData {
  id: string;
  name: string;
  category: 'WATER_FOOD' | 'MEDICAL_SUPPLIES' | 'RESCUE_EQUIPMENT' | 'VEHICLES_BOATS' | 'PERSONNEL_SQUADS' | 'SHELTER_KITS';
  totalStock: number;
  allocatedStock: number;
  remainingStock: number;
  unit: string;
  warehouseLocation: string;
  criticalThreshold?: number;
  dailyBurnRate?: number;
}

export interface ResourceAllocationRequest {
  incidentId: string;
  requestedSupplies: Array<{
    itemId: string;
    quantity: number;
  }>;
  squadPersonnelCount?: number;
  vehicleType?: string;
}

export interface ResourceAllocationResult {
  success: boolean;
  incidentId: string;
  allocatedItems: Array<{
    itemId: string;
    itemName: string;
    quantityAllocated: number;
    unit: string;
    depot: string;
  }>;
  warnings: string[];
  shortages: Array<{
    itemId: string;
    requested: number;
    available: number;
  }>;
}

export function getInventoryMetrics(item: InventoryItemData) {
  const utilization = item.totalStock > 0 ? item.allocatedStock / item.totalStock : 0;
  const estimatedDaysRemaining = item.dailyBurnRate && item.dailyBurnRate > 0
    ? item.remainingStock / item.dailyBurnRate
    : Infinity;
  const isCriticalStock = item.criticalThreshold !== undefined && item.remainingStock <= item.criticalThreshold;
  return { utilization, estimatedDaysRemaining, isCriticalStock };
}

/**
 * Calculates depletion timeline in hours based on current remaining stock and consumption rate.
 */
export function calculateDepletionHours(item: InventoryItemData, hourlyConsumptionRate?: number): number {
  const burnPerHour = hourlyConsumptionRate || (item.dailyBurnRate ? item.dailyBurnRate / 24 : 100);
  if (burnPerHour <= 0) return 999;
  return Math.max(0, +(item.remainingStock / burnPerHour).toFixed(1));
}

/**
 * Tool Declaration for Gemini Function Calling
 */
export const resourceToolDeclarations = [
  {
    name: 'getInventoryLedger',
    description: 'Retrieves current disaster relief inventory balances, warehouse locations, and allocation levels.',
    parameters: {
      type: 'OBJECT',
      properties: {
        category: {
          type: 'STRING',
          enum: ['WATER_FOOD', 'MEDICAL_SUPPLIES', 'RESCUE_EQUIPMENT', 'VEHICLES_BOATS', 'PERSONNEL_SQUADS', 'SHELTER_KITS'],
          description: 'Filter inventory by category',
        },
        depotLocation: {
          type: 'STRING',
          description: 'Filter by specific warehouse or district depot name',
        },
      },
    },
  },
  {
    name: 'allocateEmergencySupplies',
    description: 'Validates and allocates relief inventory and tactical equipment for a specific emergency dispatch.',
    parameters: {
      type: 'OBJECT',
      properties: {
        incidentId: { type: 'STRING', description: 'Target emergency incident ID' },
        requestedSupplies: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              itemId: { type: 'STRING', description: 'Inventory item ID (e.g. res_1, res_2)' },
              quantity: { type: 'INTEGER', description: 'Quantity requested' },
            },
            required: ['itemId', 'quantity'],
          },
          description: 'List of supply items to allocate',
        },
      },
      required: ['incidentId', 'requestedSupplies'],
    },
  },
  {
    name: 'predictSupplyDepletion',
    description: 'Calculates the estimated time to exhaustion for critical emergency resources given current operational demand.',
    parameters: {
      type: 'OBJECT',
      properties: {
        itemId: { type: 'STRING', description: 'Inventory item ID' },
        hourlyBurnRate: { type: 'NUMBER', description: 'Estimated consumption units per hour' },
      },
      required: ['itemId'],
    },
  },
];
