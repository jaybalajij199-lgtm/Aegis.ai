import {
  EmergencyRequest,
  InventoryItem,
  ResourceRequirement,
  ScarcityForecastData
} from '../types';

/**
 * AEGIS AI Resource Optimization Matrix
 * Generates exact supply allocations for a disaster incident based on population & priority
 */
export function generateResourceProposal(
  request: EmergencyRequest,
  inventory: InventoryItem[]
): ResourceRequirement[] {
  const proposals: ResourceRequirement[] = [];
  const pop = request.peopleAffected;

  // 1. Potable Water Packs
  const waterNeeded = request.hasWaterShortage ? Math.ceil(pop * 3) : Math.ceil(pop * 1);
  const waterInv = inventory.find((i) => i.name.toLowerCase().includes('water'));
  proposals.push({
    resourceId: waterInv?.id || 'res_1',
    resourceName: 'Potable Water Packs (5L)',
    quantityRecommended: waterNeeded,
    quantityAllocated: waterNeeded,
    unit: 'packs',
    reason: `Calculated at 3L-5L/person for ${pop} affected citizens.`
  });

  // 2. Emergency Food Ration Kits
  const foodNeeded = request.hasFoodShortage ? Math.ceil(pop * 1.5) : Math.ceil(pop * 0.5);
  const foodInv = inventory.find((i) => i.name.toLowerCase().includes('food'));
  proposals.push({
    resourceId: foodInv?.id || 'res_2',
    resourceName: 'Emergency Meal Ration Kits',
    quantityRecommended: foodNeeded,
    quantityAllocated: foodNeeded,
    unit: 'kits',
    reason: `Sustains ${pop} citizens for 48 hours.`
  });

  // 3. Trauma & First Aid Medical Packs
  const medicalNeeded = Math.max(10, Math.ceil(request.injuredCount * 1.5) + 5);
  const medInv = inventory.find((i) => i.name.toLowerCase().includes('medical'));
  proposals.push({
    resourceId: medInv?.id || 'res_3',
    resourceName: 'Trauma & Burn First-Aid Kits',
    quantityRecommended: medicalNeeded,
    quantityAllocated: medicalNeeded,
    unit: 'kits',
    reason: `Covers ${request.injuredCount} reported casualties + buffer.`
  });

  // 4. Inflatable Motorized Boats
  if (!request.roadAccessAvailable || request.disasterType === 'FLOOD') {
    const boatsNeeded = Math.max(2, Math.ceil(pop / 100));
    const boatInv = inventory.find((i) => i.name.toLowerCase().includes('boat'));
    proposals.push({
      resourceId: boatInv?.id || 'res_4',
      resourceName: 'Motorized Rescue Inflatable Boats',
      quantityRecommended: boatsNeeded,
      quantityAllocated: boatsNeeded,
      unit: 'units',
      reason: 'Road access severed; mandatory for waterborne evacuation.'
    });
  }

  // 5. NDRF Field Rescuers
  const squadNeeded = Math.max(8, Math.ceil(pop / 75));
  const squadInv = inventory.find((i) => i.name.toLowerCase().includes('squad'));
  proposals.push({
    resourceId: squadInv?.id || 'res_5',
    resourceName: 'NDRF Trained Field Personnel',
    quantityRecommended: squadNeeded,
    quantityAllocated: squadNeeded,
    unit: 'personnel',
    reason: 'Search and rescue squad for flood zone extraction.'
  });

  return proposals;
}

/**
 * Generates 24-hour Scarcity Depletion Curves for national resource management
 */
export function generateScarcityForecast(inventory: InventoryItem[]): {
  dataPoints: ScarcityForecastData[];
  waterExhaustionHours: number;
  recommendationText: string;
} {
  const waterItem = inventory.find((i) => i.name.toLowerCase().includes('water'));
  const foodItem = inventory.find((i) => i.name.toLowerCase().includes('food'));

  let currentWater = waterItem ? waterItem.remainingStock : 4500;
  let currentFood = foodItem ? foodItem.remainingStock : 6000;

  const dataPoints: ScarcityForecastData[] = [];
  let exhaustionHour = 18;

  for (let h = 0; h <= 24; h += 4) {
    const label = h === 0 ? 'Now' : `+${h}h`;
    const wStock = Math.max(0, currentWater - h * 190);
    const fStock = Math.max(0, currentFood - h * 160);

    if (wStock <= 800 && exhaustionHour === 18) {
      exhaustionHour = h;
    }

    dataPoints.push({
      timeLabel: label,
      waterStock: wStock,
      foodStock: fStock,
      medicalKitsStock: Math.max(100, 1200 - h * 35),
      criticalThresholdWater: 800
    });
  }

  return {
    dataPoints,
    waterExhaustionHours: exhaustionHour,
    recommendationText: `CRITICAL ALERT: Potable water stocks in Regional Depot will cross safety threshold in ~${exhaustionHour} hours. Immediate inter-district truck transfer from adjacent Supply Depot recommended.`
  };
}
