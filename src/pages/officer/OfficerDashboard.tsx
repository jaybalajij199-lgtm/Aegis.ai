import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAegisStore } from '../../store/useAegisStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Users,
  FileText,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Radio,
  Navigation,
  Waves,
  Wind,
  Truck,
  Package,
  HeartPulse,
  AlertTriangle,
  Phone,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const OfficerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { missions, emergencies, resources, updateMissionStatus, currentUser } = useAegisStore();

  const [waterDepth, setWaterDepth] = useState<number>(3.25);
  const [currentKnots, setCurrentKnots] = useState<number>(4.8);
  const [hqDirective, setHqDirective] = useState<string>(
    'HQ DIRECTIVE #04: Priority evacuation of Chaudwar Housing Board Sector. Deploy amphibious truck and 2 motorboats immediately. SCB Hospital Trauma Ward notified.'
  );

  const waterRes = resources.find((r) => r.name.toLowerCase().includes('water'));
  const foodRes = resources.find((r) => r.name.toLowerCase().includes('meal') || r.name.toLowerCase().includes('food'));
  const medicalRes = resources.find((r) => r.name.toLowerCase().includes('trauma') || r.name.toLowerCase().includes('first'));
  const boatRes = resources.find((r) => r.name.toLowerCase().includes('boat'));

  const officerName = currentUser?.name || 'Officer';
  const officerAgency = currentUser?.agencyName || 'Unassigned Agency';
  const officerPhone = currentUser?.phone || 'Unknown Phone';
  const officerDistrict = currentUser?.assignedDistrict || 'Regional Sector';

  return (
    <div className="space-y-6 pb-12">
      {/* Officer & Squad Tactical Command Header */}
      <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-bold flex items-center">
              <ShieldCheck className="h-3.5 w-3.5 mr-1 text-amber-600" />
              {officerAgency}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold">
              STATUS: ON-SITE DEPLOYED
            </span>
          </div>

          <h1 className="text-2xl font-black font-heading text-slate-900">
            Field Commander Console
          </h1>
          <p className="text-xs text-slate-600 font-mono">
            Commander: <strong className="text-amber-800">{officerName}</strong> ({officerPhone}) • Sector: {officerDistrict}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/officer/report')}
            className="text-xs font-mono font-bold bg-amber-600 hover:bg-amber-700 text-white"
          >
            <FileText className="h-4 w-4 mr-1.5" />
            TRANSMIT FIELD LOG
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/officer/missions')}
            className="text-xs font-mono border-slate-300 text-slate-800 hover:bg-slate-50"
          >
            <Navigation className="h-4 w-4 mr-1.5" />
            Active Missions ({missions.filter(m => m.status !== 'MISSION_COMPLETE').length})
          </Button>
        </div>
      </div>

      {/* Live Hydrological & Ground Telemetry Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono text-xs">
        <Card variant="glass" className="p-3.5 space-y-1 border-slate-200 bg-white">
          <div className="flex justify-between items-center text-slate-600 text-[10px] uppercase font-bold">
            <span className="flex items-center">
              <Waves className="h-3.5 w-3.5 text-blue-600 mr-1" /> Water Depth
            </span>
            <span className="text-red-600 font-bold">CRITICAL</span>
          </div>
          <p className="text-2xl font-black text-blue-700">{waterDepth}m</p>
          <p className="text-[10px] text-slate-600">+0.15m in past 30 mins</p>
        </Card>

        <Card variant="glass" className="p-3.5 space-y-1 border-slate-200 bg-white">
          <div className="flex justify-between items-center text-slate-600 text-[10px] uppercase font-bold">
            <span className="flex items-center">
              <Wind className="h-3.5 w-3.5 text-amber-600 mr-1" /> River Current
            </span>
            <span className="text-amber-700 font-bold">HIGH VELOCITY</span>
          </div>
          <p className="text-2xl font-black text-amber-700">{currentKnots} Knots</p>
          <p className="text-[10px] text-slate-600">Requires motorized speedboats</p>
        </Card>

        <Card variant="glass" className="p-3.5 space-y-1 border-slate-200 bg-white">
          <div className="flex justify-between items-center text-slate-600 text-[10px] uppercase font-bold">
            <span className="flex items-center">
              <Users className="h-3.5 w-3.5 text-emerald-600 mr-1" /> Active Rescuers
            </span>
            <span className="text-emerald-700 font-bold">100% READY</span>
          </div>
          <p className="text-2xl font-black text-emerald-700">24 Rescuers</p>
          <p className="text-[10px] text-slate-600">All personnel accounted for</p>
        </Card>

        <Card variant="glass" className="p-3.5 space-y-1 border-slate-200 bg-white">
          <div className="flex justify-between items-center text-slate-600 text-[10px] uppercase font-bold">
            <span className="flex items-center">
              <Truck className="h-3.5 w-3.5 text-purple-600 mr-1" /> Fleet Assets
            </span>
            <span className="text-purple-700 font-bold">DEPLOYS ACTIVE</span>
          </div>
          <p className="text-2xl font-black text-purple-700">4 Boats + 1 Truck</p>
          <p className="text-[10px] text-slate-600">2 Inflatables + 2 Speedboats</p>
        </Card>
      </div>

      {/* HQ Mission Control Directives Banner */}
      <Card variant="glass" className="p-4 border-amber-200 bg-amber-50 space-y-2">
        <div className="flex items-center justify-between border-b border-amber-200 pb-2">
          <div className="flex items-center space-x-2">
            <Radio className="h-4 w-4 text-amber-600 animate-pulse" />
            <span className="text-xs font-bold font-mono text-amber-900 uppercase tracking-wide">
              LIVE DIRECTIVE BROADCAST FROM MISSION CONTROL CENTER
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 font-bold">
            ENCRYPTED LINK
          </span>
        </div>

        <p className="text-xs text-slate-800 font-mono leading-relaxed bg-white p-3 rounded-xl border border-amber-200">
          {hqDirective}
        </p>
      </Card>

      {/* Active Assigned Rescue Missions */}
      <Card variant="glass" className="p-5 space-y-4 border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-bold text-base font-heading text-slate-900 flex items-center space-x-2">
              <Users className="h-5 w-5 text-amber-600" />
              <span>Assigned Active Rescue Missions ({missions.filter(m => m.status !== 'MISSION_COMPLETE').length})</span>
            </h3>
            <p className="text-xs text-slate-600 font-mono mt-0.5">
              Direct tactical execution, ground status stepper and supply deployment
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/officer/missions')}
            className="text-xs font-mono text-amber-800 hover:text-slate-900"
          >
            Manage All Missions <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="space-y-4">
          {missions.filter(m => m.status !== 'MISSION_COMPLETE').map((m) => {
            const emergency = emergencies.find((e) => e.id === m.requestId);

            return (
              <div
                key={m.id}
                className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 font-mono text-xs"
              >
                {/* Mission Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-amber-800 font-bold">{m.id}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-blue-700 font-bold">Ticket: {m.requestId}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 font-heading mt-0.5">
                      {m.teamName} — {m.assignedDistrict}
                    </h4>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded bg-amber-50 border border-amber-300 text-amber-800 font-bold">
                      STATUS: {m.status.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-1 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold">
                      ETA ~{m.estimatedArrivalMinutes}m
                    </span>
                  </div>
                </div>

                {/* Target Information */}
                {emergency && (
                  <div className="bg-white p-3 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <span className="text-slate-600 text-[10px] block uppercase">Target Address</span>
                      <span className="text-slate-900 font-bold">{emergency.location.address}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 text-[10px] block uppercase">Trapped / Injured</span>
                      <span className="text-red-600 font-bold">
                        {emergency.peopleAffected} Citizens ({emergency.injuredCount} Injured)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600 text-[10px] block uppercase">AI Priority Score</span>
                      <span className="text-blue-700 font-bold">{emergency.priorityScore} / 100 ({emergency.priorityClassification})</span>
                    </div>
                  </div>
                )}

                {/* Quick Status Stepper Controls */}
                <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200">
                  <div className="flex items-center space-x-1.5 text-[11px]">
                    <span className="text-slate-600">Quick Stage Update:</span>
                    <button
                      onClick={() => updateMissionStatus(m.id, 'EN_ROUTE', 'Squad en route via water highway.')}
                      className={`px-2 py-1 rounded border text-[10px] ${
                        m.status === 'EN_ROUTE' ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      EN ROUTE
                    </button>
                    <button
                      onClick={() => updateMissionStatus(m.id, 'ON_SITE', 'Arrived at site, motorboats launched.')}
                      className={`px-2 py-1 rounded border text-[10px] ${
                        m.status === 'ON_SITE' ? 'bg-blue-100 border-blue-400 text-blue-900 font-bold' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      ON SITE
                    </button>
                    <button
                      onClick={() => updateMissionStatus(m.id, 'EVACUATING', 'Evacuation active. 20 citizens transferred.')}
                      className={`px-2 py-1 rounded border text-[10px] ${
                        m.status === 'EVACUATING' ? 'bg-purple-100 border-purple-400 text-purple-900 font-bold' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      EVACUATING
                    </button>
                    <button
                      onClick={() => updateMissionStatus(m.id, 'MISSION_COMPLETE', 'All citizens evacuated safely.')}
                      className={`px-2 py-1 rounded border text-[10px] ${
                        m.status === 'MISSION_COMPLETE' ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      COMPLETED
                    </button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/officer/report')}
                    className="text-xs font-mono border-slate-300 text-slate-800 hover:bg-slate-100"
                  >
                    Log Full Telemetry <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Squad Equipment & Stocks Summary Tile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glass" className="p-4 space-y-2 border-slate-200 bg-white">
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
            <Package className="h-4 w-4 text-blue-600" />
            <h4 className="font-bold text-xs font-mono text-slate-900">Water & Food Rations On-Board</h4>
          </div>
          <div className="font-mono text-xs text-slate-700 space-y-1">
            <p className="flex justify-between">
              <span>Potable Water Packs:</span>
              <strong className="text-blue-700">{waterRes ? `${waterRes.remainingStock} ${waterRes.unit}` : '4,500 Packs'}</strong>
            </p>
            <p className="flex justify-between">
              <span>Ready-to-Eat Meal Kits:</span>
              <strong className="text-amber-800">{foodRes ? `${foodRes.remainingStock} ${foodRes.unit}` : '2,250 Kits'}</strong>
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/officer/resources')}
            className="w-full text-[11px] font-mono text-blue-700 hover:bg-blue-50 border border-slate-200 mt-2"
          >
            Manage Equipment Stock
          </Button>
        </Card>

        <Card variant="glass" className="p-4 space-y-2 border-slate-200 bg-white">
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
            <HeartPulse className="h-4 w-4 text-red-600" />
            <h4 className="font-bold text-xs font-mono text-slate-900">Medical First-Aid Stock</h4>
          </div>
          <div className="font-mono text-xs text-slate-700 space-y-1">
            <p className="flex justify-between">
              <span>Trauma First Aid Kits:</span>
              <strong className="text-emerald-700">{medicalRes ? `${medicalRes.remainingStock} ${medicalRes.unit}` : '12 Kits'}</strong>
            </p>
            <p className="flex justify-between">
              <span>Rescue Crafts / Boats:</span>
              <strong className="text-emerald-700">{boatRes ? `${boatRes.remainingStock} ${boatRes.unit}` : '6 Boats'}</strong>
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/officer/report')}
            className="w-full text-[11px] font-mono text-red-700 hover:bg-red-50 border border-slate-200 mt-2"
          >
            Transmit Field Telemetry
          </Button>
        </Card>

        <Card variant="glass" className="p-4 space-y-2 border-slate-200 bg-white">
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
            <Phone className="h-4 w-4 text-emerald-600" />
            <h4 className="font-bold text-xs font-mono text-slate-900">District Direct Hotlines</h4>
          </div>
          <div className="font-mono text-xs text-slate-700 space-y-1">
            <p className="flex justify-between">
              <span>{officerDistrict} Control:</span>
              <strong className="text-blue-700">1077</strong>
            </p>
            <p className="flex justify-between">
              <span>State Medical ER:</span>
              <strong className="text-blue-700">104</strong>
            </p>
          </div>
          <a
            href="tel:1070"
            className="block text-center w-full py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 font-mono text-[11px] font-bold mt-2 hover:bg-red-100"
          >
            Direct Line 1070 DISASTER HQ
          </a>
        </Card>
      </div>
    </div>
  );
};
