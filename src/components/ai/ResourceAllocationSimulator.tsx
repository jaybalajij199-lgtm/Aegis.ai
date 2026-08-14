import React, { useState, useEffect } from 'react';
import { useAegisStore } from '../../store/useAegisStore';
import { EmergencyRequest } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Sliders, RefreshCw, CheckCircle2, ShieldAlert, Boxes, Sparkles } from 'lucide-react';

interface ResourceAllocationSimulatorProps {
  request?: EmergencyRequest;
}

export const ResourceAllocationSimulator: React.FC<ResourceAllocationSimulatorProps> = ({ request }) => {
  const { emergencies, selectedEmergencyId, allocateResources } = useAegisStore();

  const activeReq = request || emergencies.find((e) => e.id === selectedEmergencyId) || emergencies[0];

  const affected = activeReq ? activeReq.peopleAffected : 1000;

  const [boats, setBoats] = useState<number>(10);
  const [medicalKits, setMedicalKits] = useState<number>(500);
  const [foodKits, setFoodKits] = useState<number>(2000);
  const [isCommitted, setIsCommitted] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    // Dynamically scale defaults based on affected people
    if (activeReq) {
      setBoats(Math.max(4, Math.round(affected / 200)));
      setMedicalKits(Math.max(200, Math.round(affected * 0.4)));
      setFoodKits(Math.max(1000, Math.round(affected * 2)));
    }
  }, [activeReq?.id]);

  // Predictive calculations
  const evacCapacityPerHour = boats * 35;
  const evacCoveragePercent = Math.min(100, Math.round((evacCapacityPerHour * 12 / Math.max(1, affected)) * 100));
  const medicalCoveragePercent = Math.min(100, Math.round((medicalKits / Math.max(1, affected * 0.3)) * 100));
  const foodCoverageDays = ((foodKits / Math.max(1, affected * 2))).toFixed(1);

  const survivalIndex = Math.min(
    99,
    Math.round(40 + evacCoveragePercent * 0.3 + medicalCoveragePercent * 0.2 + Math.min(30, Number(foodCoverageDays) * 10))
  );

  const handleCommitPlan = () => {
    if (!activeReq) return;

    allocateResources(
      activeReq.id,
      [
        {
          resourceId: 'res_4',
          resourceName: 'Motorized Inflatable Speedboats',
          quantityRecommended: boats,
          quantityAllocated: boats,
          unit: 'boats',
          reason: `Simulated evacuation capacity: ${evacCapacityPerHour} evac/hr`
        },
        {
          resourceId: 'res_3',
          resourceName: 'Emergency Trauma & First-Aid Kits',
          quantityRecommended: medicalKits,
          quantityAllocated: medicalKits,
          unit: 'kits',
          reason: `Medical coverage: ${medicalCoveragePercent}%`
        },
        {
          resourceId: 'res_2',
          resourceName: 'High-Calorie Meal Ration Kits',
          quantityRecommended: foodKits,
          quantityAllocated: foodKits,
          unit: 'kits',
          reason: `Ration duration: ${foodCoverageDays} days`
        }
      ],
      'Commander Alok Mohanty'
    );

    setIsCommitted(true);
    setSuccessMsg(`Simulated Resource Package Committed to Incident ${activeReq.id}!`);
    setTimeout(() => {
      setSuccessMsg('');
      setIsCommitted(false);
    }, 4000);
  };

  if (!activeReq) {
    return (
      <Card variant="glass" className="p-4 space-y-2 text-center text-slate-600">
        <Sliders className="h-6 w-6 text-amber-600 mx-auto" />
        <p className="text-xs font-mono">Select an incident to launch What-If Simulation.</p>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="p-4 space-y-4 border-amber-200">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-500/40 text-amber-600">
            <Sliders className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
              What-If Resource Allocation Simulator
            </h3>
            <p className="text-[10px] text-slate-600 font-mono">
              Adjust supply deployment & preview survival impact
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-amber-600 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-800 font-bold">
          Predictive AI Engine
        </span>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {/* Slider 1: Speedboats */}
        <div>
          <div className="flex justify-between text-slate-700 text-[11px] mb-1">
            <span className="font-bold text-slate-800">Motorized Boats: {boats} Units</span>
            <span className="text-blue-600 font-bold">{evacCapacityPerHour} evac/hr ({evacCoveragePercent}% 12h)</span>
          </div>
          <input
            type="range"
            min="2"
            max="30"
            value={boats}
            onChange={(e) => setBoats(Number(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-50 rounded-lg h-2 cursor-pointer"
          />
        </div>

        {/* Slider 2: Medical Kits */}
        <div>
          <div className="flex justify-between text-slate-700 text-[11px] mb-1">
            <span className="font-bold text-slate-800">Trauma Medical Kits: {medicalKits}</span>
            <span className="text-green-600 font-bold">Coverage: {medicalCoveragePercent}%</span>
          </div>
          <input
            type="range"
            min="100"
            max="2500"
            step="50"
            value={medicalKits}
            onChange={(e) => setMedicalKits(Number(e.target.value))}
            className="w-full accent-emerald-400 bg-slate-50 rounded-lg h-2 cursor-pointer"
          />
        </div>

        {/* Slider 3: Food Ration Kits */}
        <div>
          <div className="flex justify-between text-slate-700 text-[11px] mb-1">
            <span className="font-bold text-slate-800">Food Ration Kits: {foodKits.toLocaleString()}</span>
            <span className="text-amber-600 font-bold">Duration: {foodCoverageDays} Days</span>
          </div>
          <input
            type="range"
            min="500"
            max="10000"
            step="250"
            value={foodKits}
            onChange={(e) => setFoodKits(Number(e.target.value))}
            className="w-full accent-amber-400 bg-slate-50 rounded-lg h-2 cursor-pointer"
          />
        </div>

        {/* Outcome metric card */}
        <div className="bg-white/90 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-600 uppercase font-mono font-bold">Simulated Survival & Mitigation Rate</p>
            <p className="text-xl font-black text-green-600 font-mono mt-0.5">
              {survivalIndex}% OPTIMAL MITIGATION
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleCommitPlan}
            disabled={isCommitted}
            className="text-xs font-mono font-bold"
          >
            {isCommitted ? 'Allocated!' : 'Commit Resource Plan'}
          </Button>
        </div>

        {successMsg && (
          <div className="p-2.5 bg-green-50/80 border border-green-500/50 rounded-xl text-emerald-300 text-[11px] font-mono flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>
    </Card>
  );
};
