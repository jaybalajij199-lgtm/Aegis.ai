import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAegisStore } from '../../store/useAegisStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmergencyTimeline } from '../../components/emergency/EmergencyTimeline';
import { ExplainableAIPanel } from '../../components/ai/ExplainableAIPanel';
import {
  ArrowLeft,
  Users,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Radio,
  Truck,
  MessageSquare
} from 'lucide-react';

export const CitizenRequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { emergencies, missions, updateMissionStatus } = useAegisStore();

  const [escalated, setEscalated] = useState(false);
  const [escalateMsg, setEscalateMsg] = useState('');

  const req = emergencies.find((e) => e.id === id) || emergencies[0];
  const mission = missions.find((m) => m.requestId === req.id);

  if (!req) {
    return (
      <div className="space-y-4 font-mono text-xs text-center py-12">
        <p className="text-slate-600">Emergency request ticket not found.</p>
        <Button variant="ghost" onClick={() => navigate('/citizen/requests')}>
          Return to My Requests
        </Button>
      </div>
    );
  }

  const handleEscalateSituation = () => {
    setEscalated(true);
    setEscalateMsg('Escalation note transmitted to AEGIS Mission Control Center!');
    setTimeout(() => setEscalateMsg(''), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button */}
      <Button variant="ghost" size="sm" onClick={() => navigate('/citizen/requests')} className="text-xs font-mono text-slate-700 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to My Emergency Requests
      </Button>

      {/* Main Ticket Summary Card */}
      <Card variant="glass" className="p-6 space-y-6 border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center space-x-2 font-mono text-xs">
              <span className="text-blue-700 font-bold">{req.id}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600">Reported {new Date(req.createdAt).toLocaleString()}</span>
            </div>
            <h1 className="text-2xl font-black font-heading text-slate-900 mt-1">
              {req.disasterType} Report - {req.location.address}
            </h1>
            <p className="text-xs text-slate-600 flex items-center mt-1 font-mono">
              <MapPin className="h-3.5 w-3.5 text-blue-600 mr-1" />
              {req.location.address}, {req.location.district}, {req.location.state}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant={req.priorityClassification === 'CRITICAL' ? 'critical' : 'high'}>
              {req.priorityClassification}
            </Badge>
            <span className="text-sm font-black font-mono text-blue-800 bg-blue-100 border border-blue-200 px-3 py-1 rounded-xl">
              SCORE: {req.priorityScore} / 100
            </span>
          </div>
        </div>

        {/* Assigned Rescue Battalion Card */}
        {mission ? (
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-blue-200 pb-2">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 border border-blue-200">
                  <Users className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Assigned Field Rescue Squad</h3>
              </div>

              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                STATUS: {mission.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-slate-700 pt-1">
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Squad Designation</p>
                <p className="text-slate-900 font-bold mt-0.5">{mission.teamName}</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 uppercase">Squad Commander</p>
                <p className="text-blue-700 font-bold mt-0.5">{mission.leaderName}</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 uppercase">Vehicles & Personnel</p>
                <p className="text-slate-900 mt-0.5">{mission.vehicleType} ({mission.personnelCount} members)</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 uppercase">Estimated Arrival</p>
                <p className="text-emerald-700 font-bold text-sm mt-0.5">~{mission.estimatedArrivalMinutes} Minutes</p>
              </div>
            </div>

            <div className="pt-2 border-t border-blue-200 flex items-center justify-between">
              <span className="text-slate-600 text-[11px]">Direct Commander Phone Contact:</span>
              <a
                href={`tel:${mission.contactPhone}`}
                className="px-3 py-1 rounded-xl bg-white border border-blue-300 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center shadow-sm"
              >
                <Phone className="h-3.5 w-3.5 mr-1.5" />
                {mission.contactPhone}
              </a>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-mono text-xs flex items-center justify-between">
            <span className="flex items-center">
              <Clock className="h-4 w-4 text-amber-600 mr-2 animate-spin" />
              Awaiting Squad Assignment from Commander Dispatch...
            </span>
            <span className="text-[10px] text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded">
              QUEUED
            </span>
          </div>
        )}

        {/* Action Escalation Bar */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <p className="text-xs font-mono text-slate-900 font-bold">Situation Update or Escalation</p>
              <p className="text-[11px] text-slate-600 font-sans">
                Notify Mission Control if water levels rise or medical situation worsens.
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEscalateSituation}
                className="text-xs font-mono border-amber-400 text-amber-900 bg-amber-50 hover:bg-amber-100"
              >
                <AlertTriangle className="h-3.5 w-3.5 mr-1 text-amber-600" />
                Escalate (Water Level Rising)
              </Button>
            </div>
          </div>

          {escalateMsg && (
            <p className="text-xs font-mono text-emerald-700 font-bold pt-1 flex items-center">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> {escalateMsg}
            </p>
          )}
        </div>

        {/* Explainable AI Factor Breakdown */}
        <ExplainableAIPanel request={req} />

        {/* Execution Timeline */}
        <EmergencyTimeline requestId={req.id} />
      </Card>
    </div>
  );
};
