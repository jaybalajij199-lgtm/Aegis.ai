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
  Sparkles
} from 'lucide-react';

export const ControlDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    emergencies,
    selectedEmergencyId,
    setSelectedEmergencyId,
    resources,
    missions
  } = useAegisStore();

  const selectedEmergency =
    emergencies.find((e) => e.id === selectedEmergencyId) || emergencies[0];

  const criticalCount = emergencies.filter((e) => e.priorityClassification === 'CRITICAL').length;
  const highCount = emergencies.filter((e) => e.priorityClassification === 'HIGH').length;

  return (
    <div className="space-y-6">
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
