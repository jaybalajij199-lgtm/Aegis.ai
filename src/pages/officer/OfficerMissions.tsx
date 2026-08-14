import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAegisStore } from '../../store/useAegisStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Users,
  CheckCircle2,
  Clock,
  MapPin,
  AlertTriangle,
  Send,
  PlusCircle,
  Truck,
  ShieldCheck,
  ChevronRight,
  Radio,
  FileText,
  Activity,
  HeartPulse,
  Package
} from 'lucide-react';
import { RescueMission } from '../../types';

export const OfficerMissions: React.FC = () => {
  const navigate = useNavigate();
  const { missions, emergencies, updateMissionStatus, currentUser } = useAegisStore();

  const [selectedMissionId, setSelectedMissionId] = useState<string>(
    missions[0]?.id || 'MIS-101'
  );
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const [customLogMsg, setCustomLogMsg] = useState('');
  const [quickActionSuccess, setQuickActionSuccess] = useState('');

  const activeMission = missions.find((m) => m.id === selectedMissionId) || missions[0];
  const targetEmergency = emergencies.find((e) => e.id === activeMission?.requestId);

  const filteredMissions = missions.filter((m) => {
    if (filterStatus === 'ALL') return true;
    return m.status === filterStatus;
  });

  const handleQuickAction = (actionText: string, targetStatus?: any) => {
    if (!activeMission) return;
    const statusToUse = targetStatus || activeMission.status;

    updateMissionStatus(
      activeMission.id,
      statusToUse,
      `[FIELD QUICK LOG] ${actionText}`
    );

    setQuickActionSuccess(`Logged: ${actionText}`);
    setTimeout(() => setQuickActionSuccess(''), 3000);
  };

  const handleCustomLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMission || !customLogMsg.trim()) return;

    updateMissionStatus(
      activeMission.id,
      activeMission.status,
      customLogMsg.trim()
    );

    setCustomLogMsg('');
    setQuickActionSuccess('Custom telemetry log transmitted to Mission Control.');
    setTimeout(() => setQuickActionSuccess(''), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 flex items-center space-x-2">
            <Users className="h-6 w-6 text-amber-600" />
            <span>Tactical Rescue Mission Control</span>
          </h1>
          <p className="text-xs text-slate-600 font-mono">
            Ground execution, stage stepper, live field logs, and HQ supply requests
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/officer/report')}
          className="text-xs font-mono font-bold bg-amber-600 hover:bg-amber-700 text-white"
        >
          <FileText className="h-4 w-4 mr-1.5" />
          Full Telemetry Report
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-mono">
        <span className="text-slate-700 font-bold mr-1">Filter Status:</span>
        {['ALL', 'DISPATCHED', 'EN_ROUTE', 'ON_SITE', 'EVACUATING', 'MISSION_COMPLETE'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all ${
              filterStatus === st
                ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Mission Selection List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold font-mono text-slate-700 uppercase tracking-wider">
            Assigned Squad Missions ({filteredMissions.length})
          </h3>

          {filteredMissions.length === 0 ? (
            <Card variant="glass" className="p-6 text-center text-slate-600 text-xs font-mono bg-white border-slate-200">
              No rescue missions match filter criteria.
            </Card>
          ) : (
            filteredMissions.map((m) => {
              const isSelected = m.id === activeMission?.id;

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMissionId(m.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 font-mono text-xs ${
                    isSelected
                      ? 'bg-amber-50 border-amber-400 text-slate-900 shadow-sm ring-1 ring-amber-400'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="font-bold text-amber-800">{m.id}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] border border-emerald-300 font-bold">
                      {m.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <p className="font-bold text-slate-900 text-sm font-heading">{m.teamName}</p>
                    <p className="text-[11px] text-slate-600 flex items-center mt-0.5">
                      <MapPin className="h-3 w-3 mr-1 text-slate-500" />
                      {m.assignedDistrict}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-600 pt-1">
                    <span>ETA: ~{m.estimatedArrivalMinutes}m</span>
                    <span className="text-blue-700 font-bold">Ticket: {m.requestId}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Mission Deep Dive & Stepper Control */}
        {activeMission && (
          <div className="lg:col-span-2 space-y-6">
            <Card variant="glass" className="p-5 border-slate-200 bg-white space-y-5">
              {/* Mission Banner Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-mono">
                    <span className="text-amber-800 font-bold">{activeMission.id}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-blue-700 font-bold">Request Ticket {activeMission.requestId}</span>
                  </div>
                  <h2 className="text-xl font-bold font-heading text-slate-900 mt-1">
                    {activeMission.teamName}
                  </h2>
                  <p className="text-xs font-mono text-slate-600 mt-0.5">
                    Commander: <strong className="text-slate-900">{activeMission.leaderName}</strong> ({activeMission.contactPhone})
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1 font-mono text-xs">
                  <span className="px-3 py-1 rounded bg-amber-50 border border-amber-300 text-amber-800 font-bold uppercase">
                    Stage: {activeMission.status.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-600">
                    Dispatched: {new Date(activeMission.assignedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Tactical Progress Stepper */}
              <div className="space-y-2">
                <span className="text-xs font-bold font-mono text-slate-700 uppercase">
                  Tactical Progress Stepper (Click to update status)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                  {[
                    { id: 'EN_ROUTE', label: '1. EN ROUTE', color: 'amber' },
                    { id: 'ON_SITE', label: '2. ON SITE', color: 'cyan' },
                    { id: 'EVACUATING', label: '3. EVACUATING', color: 'purple' },
                    { id: 'MISSION_COMPLETE', label: '4. COMPLETED', color: 'emerald' }
                  ].map((step) => {
                    const isActive = activeMission.status === step.id;
                    return (
                      <button
                        key={step.id}
                        onClick={() =>
                          updateMissionStatus(
                            activeMission.id,
                            step.id as any,
                            `Mission progress updated to ${step.label}`
                          )
                        }
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isActive
                            ? 'bg-amber-100 border-amber-500 text-amber-900 font-bold ring-2 ring-amber-400'
                            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {step.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Incident & Casualty Telemetry */}
              {targetEmergency && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-900 flex items-center">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mr-1.5" />
                      Target Emergency Incident Detail
                    </span>
                    <span className="text-red-600 font-bold">
                      Priority: {targetEmergency.priorityScore} / 100 ({targetEmergency.priorityClassification})
                    </span>
                  </div>

                  <p className="text-slate-800 text-xs leading-relaxed bg-white p-2.5 rounded border border-slate-200">
                    "{targetEmergency.description}"
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-slate-700">
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-500 text-[10px] block uppercase">Address</span>
                      <strong className="text-slate-900 text-[11px]">{targetEmergency.location.address}</strong>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-500 text-[10px] block uppercase">People Affected</span>
                      <strong className="text-amber-800 text-[11px]">{targetEmergency.peopleAffected} Citizens</strong>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-500 text-[10px] block uppercase">Injured Count</span>
                      <strong className="text-red-600 text-[11px]">{targetEmergency.injuredCount} Injured</strong>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-500 text-[10px] block uppercase">Children & Seniors</span>
                      <strong className="text-blue-700 text-[11px]">{targetEmergency.childrenCount} kids / {targetEmergency.seniorCount} seniors</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Field Telemetry Logging Presets */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold font-mono text-slate-700 uppercase">
                    One-Tap Field Telemetry Presets
                  </span>
                  {quickActionSuccess && (
                    <span className="text-[11px] font-mono text-emerald-700 animate-pulse font-bold">
                      ✓ {quickActionSuccess}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  <button
                    onClick={() => handleQuickAction('Motorized inflatables deployed into floodwaters.', 'ON_SITE')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-amber-500 text-slate-800 hover:bg-amber-50"
                  >
                    🚤 Deploy Boats
                  </button>
                  <button
                    onClick={() => handleQuickAction('Extracted 15 trapped residents (including 4 children) via motorboat.', 'EVACUATING')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-purple-500 text-slate-800 hover:bg-purple-50"
                  >
                    👥 Extracted 15 Residents
                  </button>
                  <button
                    onClick={() => handleQuickAction('Administered emergency first aid & fracture splints on site.', 'EVACUATING')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-emerald-500 text-slate-800 hover:bg-emerald-50"
                  >
                    🩺 First Aid Administered
                  </button>
                  <button
                    onClick={() => handleQuickAction('Main road submerged 4 feet. Requesting amphibious truck reinforcement.', activeMission.status)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-red-500 text-slate-800 hover:bg-red-50"
                  >
                    🚨 Road Submerged Hazard
                  </button>
                </div>
              </div>

              {/* Custom Telemetry Log Input */}
              <form onSubmit={handleCustomLogSubmit} className="space-y-2">
                <span className="text-xs font-bold font-mono text-slate-700 uppercase">
                  Transmit Custom Field Observation
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customLogMsg}
                    onChange={(e) => setCustomLogMsg(e.target.value)}
                    placeholder="e.g. Current water speed 4 knots. Extracting remaining 30 residents from terrace..."
                    className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                  <Button variant="primary" size="sm" type="submit" className="font-mono text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold">
                    <Send className="h-3.5 w-3.5 mr-1" /> TRANSMIT
                  </Button>
                </div>
              </form>

              {/* Live Telemetry Log History */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <h4 className="font-bold text-xs font-mono text-slate-900 uppercase flex items-center space-x-1">
                  <Radio className="h-3.5 w-3.5 text-amber-600" />
                  <span>Mission Telemetry Feed ({activeMission.logs.length} entries)</span>
                </h4>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {activeMission.logs.slice().reverse().map((log) => (
                    <div
                      key={log.id}
                      className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono space-y-1"
                    >
                      <div className="flex justify-between items-center text-[10px] text-slate-500">
                        <span className="font-bold text-amber-800">{log.author}</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-800">{log.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
