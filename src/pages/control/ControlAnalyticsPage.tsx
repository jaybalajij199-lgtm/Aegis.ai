import React from 'react';
import { useAegisStore } from '../../store/useAegisStore';
import { AnalyticsCharts } from '../../components/analytics/AnalyticsCharts';
import { Card } from '../../components/ui/Card';
import { BarChart3, Users, ShieldAlert, CheckCircle2, Boxes, Users2, Activity, Radio } from 'lucide-react';

export const ControlAnalyticsPage: React.FC = () => {
  const { emergencies, resources, missions, shelters } = useAegisStore();

  const totalIncidents = emergencies.length;
  const criticalCount = emergencies.filter(e => e.priorityClassification === 'CRITICAL').length;
  const rescuedCount = emergencies
    .filter(e => e.status === 'RESOLVED' || e.status === 'COMPLETED')
    .reduce((acc, e) => acc + (e.peopleAffected || 0), 0);
  const pendingCount = emergencies
    .filter(e => e.status !== 'RESOLVED' && e.status !== 'COMPLETED')
    .reduce((acc, e) => acc + (e.peopleAffected || 0), 0);
  const activeMissionsCount = missions.length;
  const totalAllocatedUnits = resources.reduce((acc, r) => acc + (r.allocatedStock || 0), 0);

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 font-mono text-blue-600 text-xs mb-1">
            <BarChart3 className="h-4 w-4" />
            <span className="font-bold uppercase tracking-wider">LIVE MONGODB DATASTREAM</span>
          </div>
          <h1 className="text-2xl font-black font-heading text-slate-900">National Disaster Operations Analytics</h1>
          <p className="text-xs text-slate-600 font-mono">
            Real-time analytics, triage score distribution, resource depletion, and evacuation efficiency
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold flex items-center">
            <Radio className="h-3 w-3 mr-1.5 animate-pulse text-emerald-600" /> LIVE DATABASE SYNC
          </span>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 font-mono text-xs">
        <Card variant="glass" className="p-3.5 space-y-1 border-slate-200 bg-white">
          <span className="text-[10px] text-slate-600 uppercase font-bold block">Total Incidents</span>
          <p className="text-2xl font-black text-slate-900">{totalIncidents}</p>
          <span className="text-[10px] text-blue-700 font-semibold">Database Records</span>
        </Card>

        <Card variant="glass" className="p-3.5 space-y-1 border-red-200 bg-red-50/30">
          <span className="text-[10px] text-slate-600 uppercase font-bold block">Critical Incidents</span>
          <p className="text-2xl font-black text-red-600">{criticalCount}</p>
          <span className="text-[10px] text-red-700 font-semibold">Score &gt; 80 / 100</span>
        </Card>

        <Card variant="glass" className="p-3.5 space-y-1 border-green-200 bg-emerald-50/30">
          <span className="text-[10px] text-slate-600 uppercase font-bold block">Rescued Citizens</span>
          <p className="text-2xl font-black text-emerald-700">{rescuedCount.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-700 font-semibold">Evacuated / Safe</span>
        </Card>

        <Card variant="glass" className="p-3.5 space-y-1 border-amber-200 bg-amber-50/30">
          <span className="text-[10px] text-slate-600 uppercase font-bold block">Pending Citizens</span>
          <p className="text-2xl font-black text-amber-700">{pendingCount.toLocaleString()}</p>
          <span className="text-[10px] text-amber-700 font-semibold">In Active Zones</span>
        </Card>

        <Card variant="glass" className="p-3.5 space-y-1 border-purple-200 bg-purple-50/30">
          <span className="text-[10px] text-slate-600 uppercase font-bold block">Field Squads</span>
          <p className="text-2xl font-black text-purple-700">{activeMissionsCount}</p>
          <span className="text-[10px] text-purple-700 font-semibold">NDRF/ODRAF Missions</span>
        </Card>

        <Card variant="glass" className="p-3.5 space-y-1 border-blue-200 bg-blue-50/30">
          <span className="text-[10px] text-slate-600 uppercase font-bold block">Allocated Stock</span>
          <p className="text-2xl font-black text-blue-700">{totalAllocatedUnits.toLocaleString()}</p>
          <span className="text-[10px] text-blue-700 font-semibold">Dispatched Units</span>
        </Card>
      </div>

      {/* Main Analytics Charts Section */}
      <AnalyticsCharts />
    </div>
  );
};
