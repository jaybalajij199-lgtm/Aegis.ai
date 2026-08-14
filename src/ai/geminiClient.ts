import { calculateAIPriorityScore } from './priorityEngine';
import { generateResourceProposal, generateScarcityForecast } from './resourceOptimizer';
import { EmergencyRequest } from '../types';

export interface AITriageResult {
  summary: string;
  disasterType: string;
  priorityScore: number;
  priorityClassification: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  suggestedAction: string;
  keyFactors: string[];
}

/**
  * Calls server-side Gemini 3.6 Flash Triage API with automatic fallback
  */
export async function runGeminiTriage(
  requestText: string,
  locationAddress: string,
  peopleAffected: number,
  injuredCount: number
): Promise<AITriageResult> {
  try {
    const res = await fetch('/api/ai/triage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ textMessage: requestText, locationAddress, peopleAffected, injuredCount })
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Gemini Triage API server unreachable, utilizing deterministic triage model:', err);
  }

  // Deterministic Fallback
  const dummyRequest: Omit<EmergencyRequest, 'priorityScore' | 'priorityClassification' | 'priorityAnalysis'> = {
    id: 'REQ-FALLBACK',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reporterName: 'Citizen',
    reporterPhone: 'Unknown',
    reporterRole: 'CITIZEN',
    disasterType: 'FLOOD',
    peopleAffected: peopleAffected || 10,
    injuredCount: injuredCount || 0,
    childrenCount: Math.ceil((peopleAffected || 10) * 0.2),
    seniorCount: Math.ceil((peopleAffected || 10) * 0.1),
    hasFoodShortage: true,
    hasWaterShortage: true,
    roadAccessAvailable: false,
    description: requestText,
    location: {
      lat: 0,
      lng: 0,
      address: locationAddress || 'Unknown Location',
      district: 'Unknown District',
      state: 'Unknown'
    },
    status: 'PENDING',
    waitingTimeMinutes: 0
  };

  const analysis = calculateAIPriorityScore(dummyRequest);

  return {
    summary: `Emergency report from ${locationAddress || 'Target Sector'} describing ${requestText || 'severe flooding'}.`,
    disasterType: 'FLOOD',
    priorityScore: analysis.score,
    priorityClassification: analysis.classification,
    suggestedAction: analysis.aiRecommendation,
    keyFactors: analysis.primaryReasons
  };
}

/**
 * Calls server-side Gemini AI Tactical Copilot
 */
export async function queryGeminiCopilot(
  userPrompt: string,
  systemContext?: string,
  activeIncidentId?: string
): Promise<string> {
  try {
    const res = await fetch('/api/ai/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userPrompt, systemContext, activeIncidentId })
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.reply) {
        return json.reply;
      }
    }
  } catch (err) {
    console.warn('Gemini Copilot API server unreachable:', err);
  }

  // Fallback intelligent response
  return `[AEGIS OFFLINE ASSISTANT] Operation Guidance:
• Ensure emergency teams are dispatched to reported location.
• Allocate resources based on population density.
• Prioritize immediate evacuation and safety protocols.`;
}

/**
 * Calls server-side Gemini Damage & Flood Inundation Predictor
 */
export async function runDamagePrediction(
  district: string,
  rainfallMm: number,
  riverLevelMeters: number
): Promise<{
  inundationRiskPercent: number;
  evacuationUrgency: string;
  forecast24h: string;
  depletionWarning: string;
}> {
  try {
    const res = await fetch('/api/ai/damage-predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ district, rainfallMm, riverLevelMeters })
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        return {
          inundationRiskPercent: json.inundationRiskPercent ?? 50,
          evacuationUrgency: json.evacuationUrgency ?? 'NORMAL',
          forecast24h: json.forecast24h ?? 'Forecast data unavailable.',
          depletionWarning: json.depletionWarning ?? 'Supply depletion data unavailable.'
        };
      }
    }
  } catch (err) {
    console.warn('Damage prediction server fallback:', err);
  }

  const calculatedRisk = Math.min(98, Math.max(20, Math.floor((riverLevelMeters * 18) + (rainfallMm * 0.25))));
  return {
    inundationRiskPercent: calculatedRisk,
    evacuationUrgency: calculatedRisk > 70 ? 'IMMEDIATE' : 'HIGH_ALERT',
    forecast24h: `Predicted environmental impact based on ${riverLevelMeters.toFixed(2)}m water level in ${district}.`,
    depletionWarning: `Monitor local depot rations to avoid rapid depletion.`
  };
}
