import {
  EmergencyRequest,
  PriorityAnalysis,
  PriorityFactor,
  PriorityLevel
} from '../types';

/**
 * AEGIS AI Deterministic Triage Engine
 * Calculates a 100-point priority score and provides an explainable breakdown
 */
export function calculateAIPriorityScore(
  request: Omit<EmergencyRequest, 'priorityScore' | 'priorityClassification' | 'priorityAnalysis'>
): PriorityAnalysis {
  const factors: PriorityFactor[] = [];
  const primaryReasons: string[] = [];

  // 1. Affected Population Volume (Max 25 pts)
  let popPts = 0;
  if (request.peopleAffected >= 1000) popPts = 25;
  else if (request.peopleAffected >= 500) popPts = 20;
  else if (request.peopleAffected >= 200) popPts = 15;
  else if (request.peopleAffected >= 50) popPts = 10;
  else popPts = 5;

  factors.push({
    factorName: 'Population Impact Volume',
    pointsEarned: popPts,
    maxPoints: 25,
    weightPercent: 25,
    description: `${request.peopleAffected.toLocaleString()} citizens threatened in target sector.`
  });
  if (popPts >= 15) {
    primaryReasons.push(`High human density area with ${request.peopleAffected.toLocaleString()} affected individuals.`);
  }

  // 2. Critical Medical & Injury Triage (Max 20 pts)
  let injuryPts = 0;
  if (request.injuredCount >= 50) injuryPts = 20;
  else if (request.injuredCount >= 20) injuryPts = 16;
  else if (request.injuredCount >= 5) injuryPts = 11;
  else if (request.injuredCount >= 1) injuryPts = 6;
  else injuryPts = 0;

  factors.push({
    factorName: 'Injury & Casualties Severity',
    pointsEarned: injuryPts,
    maxPoints: 20,
    weightPercent: 20,
    description: `${request.injuredCount} reported injuries requiring urgent trauma response.`
  });
  if (request.injuredCount > 0) {
    primaryReasons.push(`${request.injuredCount} confirmed casualties needing immediate trauma transport.`);
  }

  // 3. Vulnerable Groups (Children & Seniors) (Max 15 pts)
  const vulnerableTotal = request.childrenCount + request.seniorCount;
  let vulPts = 0;
  if (vulnerableTotal >= 200) vulPts = 15;
  else if (vulnerableTotal >= 80) vulPts = 12;
  else if (vulnerableTotal >= 25) vulPts = 8;
  else if (vulnerableTotal >= 5) vulPts = 4;
  else vulPts = 0;

  factors.push({
    factorName: 'Vulnerable Population Demographics',
    pointsEarned: vulPts,
    maxPoints: 15,
    weightPercent: 15,
    description: `${request.childrenCount} children and ${request.seniorCount} elderly residents identified.`
  });
  if (vulnerableTotal > 30) {
    primaryReasons.push(`High proportion of vulnerable residents (${vulnerableTotal} children & seniors).`);
  }

  // 4. Critical Shortages (Potable Water & Food) (Max 15 pts)
  let shortagePts = 0;
  if (request.hasWaterShortage && request.hasFoodShortage) shortagePts = 15;
  else if (request.hasWaterShortage) shortagePts = 10;
  else if (request.hasFoodShortage) shortagePts = 8;

  factors.push({
    factorName: 'Life-Sustaining Supply Shortage',
    pointsEarned: shortagePts,
    maxPoints: 15,
    weightPercent: 15,
    description: request.hasWaterShortage && request.hasFoodShortage
      ? 'Severe exhaustion of both drinking water and food rations.'
      : request.hasWaterShortage
      ? 'Dehydration risk due to lack of clean water.'
      : request.hasFoodShortage
      ? 'Food supply depleted.'
      : 'Basic supplies currently accessible.'
  });
  if (shortagePts >= 10) {
    primaryReasons.push('Critical exhaustion of life-sustaining potable water and food rations.');
  }

  // 5. Road Cutoff & Inaccessibility Multiplier (Max 15 pts)
  let accessPts = request.roadAccessAvailable ? 0 : 15;
  factors.push({
    factorName: 'Accessibility & Isolation Risk',
    pointsEarned: accessPts,
    maxPoints: 15,
    weightPercent: 15,
    description: request.roadAccessAvailable
      ? 'Accessible via standard terrestrial supply trucks.'
      : 'Roads severed or inundated. Boat or helicopter mandatory.'
  });
  if (!request.roadAccessAvailable) {
    primaryReasons.push('Road infrastructure severed; isolated zone requiring amphibious or aerial dispatch.');
  }

  // 6. Response Queue Delay / Waiting Time (Max 10 pts)
  let waitPts = 0;
  const waitingMins = request.waitingTimeMinutes || 0;
  if (waitingMins >= 120) waitPts = 10;
  else if (waitingMins >= 60) waitPts = 8;
  else if (waitingMins >= 30) waitPts = 5;
  else if (waitingMins >= 10) waitPts = 2;

  factors.push({
    factorName: 'Triage Queue Waiting Duration',
    pointsEarned: waitPts,
    maxPoints: 10,
    weightPercent: 10,
    description: `Incident waiting in queue for ${waitingMins} minutes.`
  });
  if (waitingMins >= 45) {
    primaryReasons.push(`Incident pending without team dispatch for ${waitingMins} minutes.`);
  }

  // Calculate total score out of 100
  const totalScore = Math.min(
    100,
    popPts + injuryPts + vulPts + shortagePts + accessPts + waitPts
  );

  let classification: PriorityLevel = 'LOW';
  if (totalScore >= 80) classification = 'CRITICAL';
  else if (totalScore >= 60) classification = 'HIGH';
  else if (totalScore >= 40) classification = 'MEDIUM';

  let aiRecommendation = '';
  if (classification === 'CRITICAL') {
    aiRecommendation =
      'IMMEDIATE ACTION REQUIRED: Dispatch NDRF Rapid Rescue Squad with amphibious motorboats, 500 potable water packs, and emergency trauma medical kits within 15 minutes.';
  } else if (classification === 'HIGH') {
    aiRecommendation =
      'PRIORITY DISPATCH: Deploy regional relief truck with food rations, water purification kits, and assign field medical team.';
  } else if (classification === 'MEDIUM') {
    aiRecommendation =
      'SCHEDULED DISPATCH: Route local district supply convoy and monitor flood level changes closely.';
  } else {
    aiRecommendation =
      'MONITORING: Queue request for routine relief distribution via district administration.';
  }

  return {
    score: totalScore,
    classification,
    calculatedAt: new Date().toISOString(),
    factors,
    primaryReasons,
    aiRecommendation
  };
}
