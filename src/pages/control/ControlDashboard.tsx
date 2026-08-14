import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAegisStore } from '../../store/useAegisStore';
import { DisasterMap } from '../../components/map/DisasterMap';
import { ExplainableAIPanel } from '../../components/ai/ExplainableAIPanel';
import { ResourceAllocationSimulator } from '../../components/ai/ResourceAllocationSimulator';
import { EmergencyQueue } from '../../components/emergency/EmergencyQueue';
import { AnalyticsCharts } from '../../components/analytics/AnalyticsCharts';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  ShieldAlert,
  Users,
  Boxes,
  MapPin,
  Radio,
  Activity,
  Play,
  RotateCcw,
  Sparkles,
  Zap
} from 'lucide-react';

export const ControlDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    emergencies,
    selectedEmergencyId,
    setSelectedEmergencyId,
    resources,
    missions,
    demoStepIndex,
    triggerDemoScenarioNextStep,
    resetAllData
  } = useAegisStore();

  const selectedEmergency =
    emergencies.find((e) => e.id === selectedEmergencyId) || emergencies[0];

  const criticalCount = emergencies.filter((e) => e.priorityClassification === 'CRITICAL').length;
  const highCount = emergencies.filter((e) => e.priorityClassification === 'HIGH').length;

  return (
    <div className="space-y-6">
      {/* Live Simulation Control Banner */}
      <Card variant="glass" className="p-3.5 border-blue-200 bg-blue-50/80 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-600 border border-blue-200 shrink-0">
              <Zap className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold font-mono text-blue-800 uppercase tracking-wide">
                  AEGIS Live Tactical Simulation Engine
                </span>
                <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-300 font-bold">
                  STEP {demoStepIndex + 1} / 4
                </span>
              </div>
              <p className="text-xs text-slate-700 font-sans mt-0.5 font-medium">
                {demoStepIndex === 0 && 'Base State: Ingestion stream active. Click "Trigger Incoming SOS Alert" to inject new flash flood.'}
                {demoStepIndex === 1 && 'Flash Flood Alert Injected! Tangi-Choudwar SOS added with Score 98/100.'}
                {demoStepIndex === 2 && 'AI Resource Package Allocated! 4,500 Water Packs & 6 Speedboats committed.'}
                {demoStepIndex === 3 && 'NDRF Rescue Squad Dispatched! Mission team en-route to flood zone.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={triggerDemoScenarioNextStep}
              className="text-xs font-mono font-bold"
            >
              <Play className="h-3.5 w-3.5 mr-1" />
              Simulate Next Step
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetAllData}
              className="text-xs font-mono border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="glass" className="p-4 border-slate-200 bg-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-mono text-slate-600 uppercase font-bold">ACTIVE EMERGENCIES</p>
              <p className="text-3xl font-black font-mono text-slate-900 mt-1">{emergencies.length}</p>
            </div>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
          </div>
          <p className="text-[11px] text-blue-700 font-mono mt-2 font-semibold">● Real-time GPS ingest</p>
        </Card>

        <Card variant="glass" className="p-4 border-red-200 bg-red-50/30">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-mono text-slate-600 uppercase font-bold">CRITICAL SEVERITY</p>
              <p className="text-3xl font-black font-mono text-red-600 mt-1">{criticalCount}</p>
            </div>
            <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[11px] text-red-700 font-mono mt-2 font-semibold">Requires immediate dispatch</p>
        </Card>

        <Card variant="glass" className="p-4 border-amber-200 bg-amber-50/30">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-mono text-slate-600 uppercase font-bold">HIGH SEVERITY</p>
              <p className="text-3xl font-black font-mono text-amber-600 mt-1">{highCount}</p>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[11px] text-amber-700 font-mono mt-2 font-semibold">Queued for allocation</p>
        </Card>

        <Card variant="glass" className="p-4 border-green-200 bg-emerald-50/30">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-mono text-slate-600 uppercase font-bold">ACTIVE FIELD MISSIONS</p>
              <p className="text-3xl font-black font-mono text-emerald-600 mt-1">{missions.length}</p>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-green-200">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[11px] text-emerald-700 font-mono mt-2 font-semibold">NDRF & ODRAF deployed</p>
        </Card>
      </div>

      {/* Main Split View: Disaster Map + Inspection / AI Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive GIS Map */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base font-heading text-slate-900 flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span>National Disaster Heatmap GIS</span>
            </h2>
            <Button size="sm" variant="ghost" onClick={() => navigate('/control/map')}>
              Expand Map
            </Button>
          </div>

          <DisasterMap
            emergencies={emergencies}
            selectedId={selectedEmergencyId}
            onSelectEmergency={setSelectedEmergencyId}
            height="520px"
          />

          {/* Quick Queue */}
          <EmergencyQueue
            emergencies={emergencies}
            selectedId={selectedEmergencyId}
            onSelectEmergency={setSelectedEmergencyId}
          />
        </div>

        {/* Right Column: AI Triage & Deployment Simulator */}
        <div className="lg:col-span-5 space-y-5">
          {selectedEmergency ? (
            <>
              {/* Explainable AI Panel */}
              <ExplainableAIPanel request={selectedEmergency} />

              {/* Resource Deployment Simulator */}
              <ResourceAllocationSimulator request={selectedEmergency} />
            </>
          ) : (
            <Card variant="glass" className="p-8 text-center text-slate-600">
              Select an incident from the queue or map to inspect AI prioritization analysis.
            </Card>
          )}
        </div>
      </div>

      {/* Analytics */}
      <div className="space-y-6 pt-4 border-t border-slate-200">
        <AnalyticsCharts />
      </div>
    </div>
  );
};
