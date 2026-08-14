import React from 'react';
import { useAegisStore } from '../../store/useAegisStore';
import { Card } from '../ui/Card';
import { Clock, ShieldCheck, Truck, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const EmergencyTimeline: React.FC<{ requestId?: string }> = ({ requestId }) => {
  const { emergencies, selectedEmergencyId, missions } = useAegisStore();

  const targetId = requestId || selectedEmergencyId;
  const activeReq = emergencies.find((e) => e.id === targetId) || emergencies[0];

  if (!activeReq) {
    return (
      <Card variant="glass" className="p-4 text-center text-xs text-slate-500 font-mono">
        Select an emergency from the queue to view incident timeline.
      </Card>
    );
  }

  const relatedMissions = missions.filter((m) => m.requestId === activeReq.id);

  return (
    <Card variant="glass" className="p-4 space-y-3">
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <Clock className="h-4 w-4 text-blue-600" />
        <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
          Incident Audit Log & Execution Timeline
        </h3>
      </div>

      <div className="relative pl-4 border-l border-slate-200 space-y-4 font-mono text-xs">
        <div className="relative">
          <span className="absolute -left-[21px] top-0 h-3 w-3 rounded-full bg-rose-500 border-2 border-slate-950" />
          <p className="text-slate-600 text-[10px]">
            {new Date(activeReq.createdAt || Date.now()).toLocaleTimeString()}
          </p>
          <p className="font-bold text-slate-800">SOS Distress Received</p>
          <p className="text-[11px] font-sans text-slate-600">{activeReq.description}</p>
        </div>

        <div className="relative">
          <span className="absolute -left-[21px] top-0 h-3 w-3 rounded-full bg-cyan-400 border-2 border-slate-950" />
          <p className="text-slate-600 text-[10px]">
            {new Date(activeReq.updatedAt || activeReq.createdAt || Date.now()).toLocaleTimeString()}
          </p>
          <p className="font-bold text-blue-700">AEGIS AI Deterministic Scoring</p>
          <p className="text-[11px] font-sans text-slate-600">
            Triage Index: <strong className="text-rose-400">{activeReq.priorityScore}/100</strong>. Auto-calculated optimal NDRF deployment vector.
          </p>
        </div>

        {relatedMissions.map((m) => (
          <div key={m.id} className="relative">
            <span className="absolute -left-[21px] top-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-slate-950" />
            <p className="text-slate-600 text-[10px]">
              {new Date(m.assignedAt || Date.now()).toLocaleTimeString()}
            </p>
            <p className="font-bold text-emerald-300">Dispatch Squad: {m.teamName}</p>
            <p className="text-[11px] font-sans text-slate-600">
              ETA: {m.estimatedArrivalMinutes || 15} mins | Vehicles: {m.vehicleType} | Status: <span className="uppercase text-white font-bold">{m.status}</span>
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};
