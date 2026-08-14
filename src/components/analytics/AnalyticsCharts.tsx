import React, { useMemo } from 'react';
import { Card } from '../ui/Card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useAegisStore } from '../../store/useAegisStore';

export const AnalyticsCharts: React.FC = () => {
  const { emergencies, resources, missions, shelters } = useAegisStore();

  // 1. District-wise Rescued vs Pending Citizens (Real Data)
  const districtData = useMemo(() => {
    const districts: Record<string, { district: string; rescue: number; pending: number }> = {};

    (emergencies || []).forEach((eq) => {
      const d = eq.location?.district || 'Unknown District';
      if (!districts[d]) {
        districts[d] = { district: d, rescue: 0, pending: 0 };
      }
      if (eq.status === 'RESOLVED' || eq.status === 'COMPLETED') {
        districts[d].rescue += eq.peopleAffected || 0;
      } else {
        districts[d].pending += eq.peopleAffected || 0;
      }
    });

    const list = Object.values(districts).sort((a, b) => (b.pending + b.rescue) - (a.pending + a.rescue));
    return list.length > 0 ? list : [{ district: 'No Incidents', rescue: 0, pending: 0 }];
  }, [emergencies]);

  // 2. Asset Allocation & Utilization Matrix (Real Data)
  const assetPieData = useMemo(() => {
    const colors = ['#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899'];
    const activeItems = (resources || []).filter((item) => item.allocatedStock > 0 || item.remainingStock > 0);

    if (activeItems.length === 0) {
      return [{ name: 'No Assets Registered', value: 1, color: '#475569' }];
    }

    return activeItems.slice(0, 6).map((item, idx) => ({
      name: item.name,
      value: item.allocatedStock > 0 ? item.allocatedStock : item.remainingStock,
      color: colors[idx % colors.length],
    }));
  }, [resources]);

  // 3. Incident Status Breakdown (Real Data)
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {
      PENDING: 0,
      AI_PRIORITIZED: 0,
      TEAM_ASSIGNED: 0,
      RESCUE_IN_PROGRESS: 0,
      RESOLVED: 0,
    };

    (emergencies || []).forEach((e) => {
      const st = e.status || 'PENDING';
      counts[st] = (counts[st] || 0) + 1;
    });

    const colorMap: Record<string, string> = {
      PENDING: '#f43f5e',
      AI_PRIORITIZED: '#38bdf8',
      TEAM_ASSIGNED: '#f59e0b',
      RESCUE_IN_PROGRESS: '#a855f7',
      RESOLVED: '#10b981',
    };

    return Object.keys(counts).map((key) => ({
      name: key.replace(/_/g, ' '),
      value: counts[key],
      color: colorMap[key] || '#94a3b8',
    }));
  }, [emergencies]);

  // 4. Disaster Type & Population Impact (Real Data)
  const disasterTypeData = useMemo(() => {
    const map: Record<string, { type: string; count: number; affected: number }> = {};

    (emergencies || []).forEach((e) => {
      const t = e.disasterType || 'FLOOD';
      if (!map[t]) map[t] = { type: t, count: 0, affected: 0 };
      map[t].count += 1;
      map[t].affected += e.peopleAffected || 0;
    });

    return Object.values(map);
  }, [emergencies]);

  // 5. Priority Classification Breakdown (Real Data)
  const priorityData = useMemo(() => {
    const counts: Record<string, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    (emergencies || []).forEach((e) => {
      const p = e.priorityClassification || 'MEDIUM';
      counts[p] = (counts[p] || 0) + 1;
    });

    const colors: Record<string, string> = {
      CRITICAL: '#ef4444',
      HIGH: '#f97316',
      MEDIUM: '#eab308',
      LOW: '#06b6d4',
    };

    return Object.keys(counts).map((key) => ({
      name: key,
      value: counts[key],
      color: colors[key],
    }));
  }, [emergencies]);

  // 6. Shelter Capacity & Occupancy Matrix (Real Data)
  const shelterData = useMemo(() => {
    return (shelters || []).map((s) => ({
      name: s.name.length > 15 ? `${s.name.substring(0, 14)}...` : s.name,
      Occupied: s.currentOccupancy || 0,
      Available: Math.max(0, (s.capacity || 100) - (s.currentOccupancy || 0)),
    }));
  }, [shelters]);

  // 7. Field Rescue Mission Status (Real Data)
  const missionData = useMemo(() => {
    const map: Record<string, number> = {};
    (missions || []).forEach((m) => {
      const st = m.status || 'EN_ROUTE';
      map[st] = (map[st] || 0) + 1;
    });
    return Object.keys(map).map((k) => ({
      status: k.replace(/_/g, ' '),
      squads: map[k],
    }));
  }, [missions]);

  return (
    <div className="space-y-4">
      {/* Row 1: District Rescued vs Pending & Asset Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Rescued vs Pending */}
        <Card variant="glass" className="p-4 space-y-2 border-slate-200">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
              District-wise Rescued vs Pending Citizens (Live Database)
            </h3>
            <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {emergencies.length} Incidents Total
            </span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="district" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="rescue" fill="#10b981" name="Rescued Citizens" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="#f43f5e" name="Pending Evacuation" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Asset Utilization */}
        <Card variant="glass" className="p-4 space-y-2 border-slate-200">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
              Resource Inventory & Stock Distribution
            </h3>
            <span className="text-[10px] font-mono text-green-600 bg-green-50 px-2 py-0.5 rounded border border-emerald-800">
              {resources.length} Inventory Categories
            </span>
          </div>
          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {assetPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Row 2: Status Distribution & Disaster Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart 3: Incident Status Distribution */}
        <Card variant="glass" className="p-4 space-y-2 border-slate-200">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
              Emergency Incident Workflow Status
            </h3>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-status-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 4: Disaster Type Breakdown */}
        <Card variant="glass" className="p-4 space-y-2 border-slate-200 lg:col-span-2">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
              Disaster Classification & Affected Population Volume
            </h3>
            <span className="text-[10px] font-mono text-amber-600">Live Ingest Metrics</span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={disasterTypeData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="type" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="affected" fill="#06b6d4" name="Affected Citizens" radius={[4, 4, 0, 0]} />
                <Bar dataKey="count" fill="#f59e0b" name="Incident Reports" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Row 3: Priority Severity Breakdown & Shelter Capacity Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 5: Priority Classification */}
        <Card variant="glass" className="p-4 space-y-2 border-slate-200">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
              Triage Priority Severity Distribution
            </h3>
            <span className="text-[10px] font-mono text-rose-400 bg-red-50 px-2 py-0.5 rounded border border-rose-900">
              100-Point AI Triage Classifier
            </span>
          </div>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-priority-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 6: Shelter Occupancy */}
        <Card variant="glass" className="p-4 space-y-2 border-slate-200">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
              Relief Shelter Capacity & Current Occupancy
            </h3>
            <span className="text-[10px] font-mono text-blue-700">
              {shelters.length} Active Shelters
            </span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shelterData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="Occupied" stackId="a" fill="#f59e0b" name="Occupied Evacuees" />
                <Bar dataKey="Available" stackId="a" fill="#10b981" name="Available Space" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
