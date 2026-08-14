import React, { useState } from 'react';
import { useAegisStore } from '../../store/useAegisStore';
import { EmergencyRequest } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Cpu,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  Layers,
  Users,
  Activity,
  HeartPulse,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

interface ExplainableAIPanelProps {
  request?: EmergencyRequest;
}

export const ExplainableAIPanel: React.FC<ExplainableAIPanelProps> = ({ request }) => {
  const { emergencies, selectedEmergencyId, assignRescueMission, missions, allocateResources } = useAegisStore();
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const activeReq = request || emergencies.find((e) => e.id === selectedEmergencyId) || emergencies[0];

  if (!activeReq) {
    return (
      <Card variant="glass" className="p-6 text-center space-y-2">
        <Cpu className="h-8 w-8 text-blue-600 mx-auto animate-pulse" />
        <p className="text-xs font-mono text-slate-600">
          Awaiting Incident Selection for Explainable AI Tactical Decomposition.
        </p>
      </Card>
    );
  }

  const existingMission = missions.find((m) => m.requestId === activeReq.id);

  // Generate deterministic breakdown factors if priorityAnalysis is absent
  const factors = activeReq.priorityAnalysis?.factors || [
    {
      factorName: 'Population & Casualties at Risk',
      pointsEarned: Math.min(30, Math.round((activeReq.peopleAffected / 2000) * 30)),
      maxPoints: 30,
      weightPercent: 30,
      description: `${activeReq.peopleAffected.toLocaleString()} trapped residents with ${activeReq.injuredCount} reported injured casualties.`
    },
    {
      factorName: 'Vulnerable Groups (Children & Seniors)',
      pointsEarned: Math.min(25, Math.round(((activeReq.childrenCount + activeReq.seniorCount) / 1000) * 25)),
      maxPoints: 25,
      weightPercent: 25,
      description: `${activeReq.childrenCount} infants/children & ${activeReq.seniorCount} elderly citizens requiring urgent transport.`
    },
    {
      factorName: 'Infra Isolation & Road Loss Penalty',
      pointsEarned: activeReq.roadAccessAvailable ? 5 : 25,
      maxPoints: 25,
      weightPercent: 25,
      description: activeReq.roadAccessAvailable
        ? 'Roadways partially submerged; ground vehicular access passable.'
        : 'Roadways 100% inundated. Amphibious craft or helicopter air-lift mandatory.'
    },
    {
      factorName: 'Basic Subsistence Scarcity Index',
      pointsEarned: (activeReq.hasWaterShortage ? 10 : 0) + (activeReq.hasFoodShortage ? 10 : 0),
      maxPoints: 20,
      weightPercent: 20,
      description: `Critical shortages: ${activeReq.hasWaterShortage ? 'Drinking Water' : ''} ${activeReq.hasFoodShortage ? 'Emergency Food' : ''}`
    }
  ];

  const handleAuthorizeDispatch = () => {
    setIsAuthorizing(true);
    setTimeout(() => {
      // Allocate resources
      allocateResources(
        activeReq.id,
        [
          {
            resourceId: 'res_1',
            resourceName: 'Potable Water Packs (5L)',
            quantityRecommended: Math.round(activeReq.peopleAffected * 3),
            quantityAllocated: Math.round(activeReq.peopleAffected * 3),
            unit: 'packs',
            reason: 'Dehydration mitigation'
          },
          {
            resourceId: 'res_2',
            resourceName: 'Emergency Meal Kits',
            quantityRecommended: Math.round(activeReq.peopleAffected * 2),
            quantityAllocated: Math.round(activeReq.peopleAffected * 2),
            unit: 'kits',
            reason: 'Ready-to-eat rations'
          }
        ],
        'Commander Alok Mohanty'
      );

      // Assign rescue mission
      assignRescueMission(
        activeReq.id,
        'NDRF Battalion 03 (Cuttack Fleet)',
        'Inspector Sanjeev Das',
        '+91 94370 12345',
        '4x Speedboats + 2x Amphibious Trucks',
        25
      );

      setIsAuthorizing(false);
      setSuccessMsg(`Rescue Squad Dispatched for ${activeReq.id}!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 400);
  };

  return (
    <Card variant="glass" className="p-5 space-y-4 border-blue-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-500/40 text-blue-600">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wide flex items-center">
              Explainable AI (XAI) Priority Matrix
            </h3>
            <p className="text-[10px] text-slate-600 font-mono">
              Target ID: <span className="text-blue-700 font-bold">{activeReq.id}</span> • {activeReq.location.district}
            </p>
          </div>
        </div>

        <div className="text-right font-mono">
          <Badge
            variant={
              activeReq.priorityScore >= 90
                ? 'critical'
                : activeReq.priorityScore >= 75
                ? 'high'
                : 'medium'
            }
          >
            SCORE: {activeReq.priorityScore} / 100
          </Badge>
          <span className="text-[9px] text-green-600 block mt-0.5 font-bold">CONFIDENCE: 98.6%</span>
        </div>
      </div>

      {/* Primary Driver Breakdown Grid */}
      <div className="space-y-2 font-mono text-xs">
        <p className="text-slate-600 text-[10px] uppercase font-bold flex items-center">
          <Sparkles className="h-3 w-3 mr-1 text-blue-600" /> Triage Score Factor Analysis
        </p>

        <div className="space-y-2">
          {factors.map((factor, idx) => (
            <div key={idx} className="bg-white/90 p-3 rounded-xl border border-slate-200/80 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 font-sans">{factor.factorName}</span>
                <span className="text-blue-600 font-bold">
                  +{factor.pointsEarned} / {factor.maxPoints} pts
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-50 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, (factor.pointsEarned / factor.maxPoints) * 100)}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-600 font-sans leading-relaxed">{factor.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendation Box */}
      <div className="bg-blue-50/40 border border-blue-500/40 p-3.5 rounded-xl space-y-1.5">
        <p className="text-blue-700 font-bold text-xs flex items-center">
          <ShieldCheck className="h-4 w-4 mr-1.5 text-blue-600" /> Recommended Strategic Action
        </p>
        <p className="text-slate-700 font-sans text-xs leading-relaxed">
          {activeReq.priorityAnalysis?.aiRecommendation ||
            `Immediately dispatch NDRF Battalion 03 with inflatable speedboats. Deliver ${Math.round(
              activeReq.peopleAffected * 3
            ).toLocaleString()} litres of potable water & ${Math.round(
              activeReq.peopleAffected * 2
            ).toLocaleString()} high-calorie food kits.`}
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-green-50/80 border border-green-500/50 rounded-xl text-emerald-300 text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Human Command Action Footer */}
      <div className="pt-2 flex items-center justify-between border-t border-slate-200 font-sans">
        <p className="text-[11px] text-slate-600">
          Command authorization required for squad dispatch.
        </p>

        {existingMission ? (
          <div className="flex items-center text-green-600 font-bold font-mono text-xs bg-green-50/60 border border-green-500/50 px-3 py-1.5 rounded-xl">
            <CheckCircle2 className="h-4 w-4 mr-1.5" /> SQUAD DISPATCHED ({existingMission.status.toUpperCase()})
          </div>
        ) : (
          <Button
            variant="primary"
            size="sm"
            disabled={isAuthorizing}
            onClick={handleAuthorizeDispatch}
            className="text-xs font-bold"
          >
            {isAuthorizing ? 'Authorizing Dispatch...' : 'Authorize & Dispatch Squad'}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </Card>
  );
};
