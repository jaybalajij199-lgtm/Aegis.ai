import React, { useState } from 'react';
import { useAegisStore } from '../../store/useAegisStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Users, Phone, MapPin, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';

export const ControlMissionsPage: React.FC = () => {
  const { missions, assignRescueMission, emergencies, updateMissionStatus } = useAegisStore();

  const [showNewMissionModal, setShowNewMissionModal] = useState(false);
  const [selectedReqId, setSelectedReqId] = useState(emergencies[0]?.id || '');
  const [teamName, setTeamName] = useState('NDRF Special Battalion Squad 7');
  const [leaderName, setLeaderName] = useState('Cmdr. Sanjeev Das');
  const [contactPhone, setContactPhone] = useState('+91 94370 88201');
  const [vehicleType, setVehicleType] = useState('3x Inflatable Motorboats + 1x Amphibious Truck');
  const [personnelCount, setPersonnelCount] = useState(25);

  const handleCreateMission = (e: React.FormEvent) => {
    e.preventDefault();
    assignRescueMission(
      selectedReqId,
      teamName,
      leaderName,
      contactPhone,
      vehicleType,
      personnelCount
    );
    setShowNewMissionModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900">Active Field Missions</h1>
          <p className="text-xs text-slate-600 font-mono">
            Deployed NDRF & ODRAF rescue teams, vehicle tracking & field status logs
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setShowNewMissionModal(true)}>
          <Users className="h-4 w-4 mr-1.5" />
          DISPATCH NEW RESCUE MISSION
        </Button>
      </div>

      {/* Missions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {missions.map((m) => (
          <Card key={m.id} variant="glass" className="p-5 space-y-4 border-slate-200 bg-white">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-mono text-blue-700 font-bold">{m.id} • {m.requestId}</span>
                <h3 className="font-bold text-base font-heading text-slate-900">{m.teamName}</h3>
                <p className="text-xs text-slate-600">Leader: {m.leaderName} ({m.contactPhone})</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-bold">
                {m.status.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-600">Squad Personnel:</span>
                <span className="text-slate-900 font-bold">{m.personnelCount} Rescuers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Vehicles:</span>
                <span className="text-blue-700 font-bold">{m.vehicleType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Allocated Supplies:</span>
                <span className="text-slate-900 font-semibold truncate max-w-[200px]">{m.allocatedResourcesSummary}</span>
              </div>
            </div>

            {/* Mission Log Updates */}
            <div className="space-y-1.5 text-xs">
              <p className="font-mono text-[10px] uppercase text-slate-600 font-bold">Field Logs ({m.logs.length})</p>
              <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                {m.logs.map((log) => (
                  <div key={log.id} className="bg-slate-50 p-2 rounded border border-slate-200 text-[11px] text-slate-700">
                    <p className="text-[10px] text-slate-500 font-mono">{new Date(log.timestamp).toLocaleTimeString()} - {log.author}</p>
                    <p>{log.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {m.status !== 'MISSION_COMPLETE' && (
              <div className="pt-2 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateMissionStatus(m.id, 'ON_SITE', 'Team arrived at ground location. Launching rescue boats.')}
                  className="text-xs flex-1"
                >
                  Set ON SITE
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => updateMissionStatus(m.id, 'MISSION_COMPLETE', 'Evacuation complete. All residents transferred to relief shelter.')}
                  className="text-xs flex-1"
                >
                  Mark RESOLVED
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* New Mission Dispatch Modal */}
      {showNewMissionModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card variant="glass" className="p-6 max-w-lg w-full space-y-4 border-slate-200 bg-white shadow-xl">
            <h2 className="text-lg font-bold font-heading text-slate-900">Dispatch Rescue Squad Mission</h2>

            <form onSubmit={handleCreateMission} className="space-y-3 text-xs">
              <div>
                <label className="block font-mono text-slate-700 font-bold mb-1">Target Emergency Request</label>
                <select
                  value={selectedReqId}
                  onChange={(e) => setSelectedReqId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-mono"
                >
                  {emergencies.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.id} - {e.location.district} ({e.priorityClassification} {e.priorityScore}/100)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-slate-700 font-bold mb-1">Squad Team Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-slate-700 font-bold mb-1">Commander Name</label>
                  <input
                    type="text"
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-mono text-slate-700 font-bold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-slate-700 font-bold mb-1">Vehicle Deployment Type</label>
                <input
                  type="text"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <Button variant="ghost" type="button" onClick={() => setShowNewMissionModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  CONFIRM DISPATCH
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
