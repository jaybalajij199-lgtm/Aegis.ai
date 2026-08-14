import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAegisStore } from '../../store/useAegisStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmergencyTimeline } from '../../components/emergency/EmergencyTimeline';
import { ShieldAlert, ArrowRight, Radio, MapPin, Users, PlusCircle, CheckCircle2 } from 'lucide-react';

export const CitizenRequests: React.FC = () => {
  const navigate = useNavigate();
  const { emergencies, missions, currentUser } = useAegisStore();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const myRequests = emergencies.filter(
    (e) => (e.reporterPhone === currentUser?.phone || e.reporterName === currentUser?.name) &&
           e.status !== 'RESOLVED' && e.status !== 'COMPLETED'
  );

  const filteredRequests = myRequests;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 flex items-center space-x-2">
            <Radio className="h-5 w-5 text-blue-600 animate-pulse" />
            <span>My Reported Emergency Tickets ({myRequests.length})</span>
          </h1>
          <p className="text-xs text-slate-600 font-mono mt-0.5">
            Real-time rescue battalion tracking, AI priority score & squad dispatch logs
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="danger" size="sm" onClick={() => navigate('/citizen/sos')} className="text-xs font-mono font-bold bg-red-600 hover:bg-red-700 text-white">
            <ShieldAlert className="h-3.5 w-3.5 mr-1" />
            NEW SOS
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card variant="glass" className="p-8 text-center space-y-3 border-slate-200 bg-white shadow-sm">
            <Radio className="h-8 w-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-600 font-mono">No reported emergency tickets match this filter.</p>
          </Card>
        ) : (
          filteredRequests.map((req) => {
            const mission = missions.find((m) => m.requestId === req.id);
            const isResolved = req.status === 'RESOLVED' || req.status === 'COMPLETED';

            return (
              <Card key={req.id} variant="glass" className="p-5 space-y-4 border-slate-200 bg-white hover:border-slate-300 transition-all shadow-sm">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-blue-700 font-bold">{req.id}</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(req.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 font-heading mt-0.5">
                      {req.disasterType} Report - {req.location.address}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant={req.priorityClassification === 'CRITICAL' ? 'critical' : 'high'}>
                      {req.priorityClassification}
                    </Badge>
                    <span className="text-xs font-mono font-bold text-blue-800 bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg">
                      Score: {req.priorityScore}/100
                    </span>
                  </div>
                </div>

                {/* Assigned Squad Header snippet if available */}
                {mission && (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-blue-600 shrink-0" />
                      <div>
                        <span className="text-slate-600">Assigned Battalion: </span>
                        <strong className="text-slate-900 font-bold">{mission.teamName}</strong>
                      </div>
                    </div>
                    <span className="text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 text-[10px]">
                      ETA ~{mission.estimatedArrivalMinutes} MINS
                    </span>
                  </div>
                )}

                {/* Audit Timeline */}
                <EmergencyTimeline />

                {/* Footer Controls */}
                <div className="pt-2 flex flex-wrap justify-between items-center gap-2 border-t border-slate-200 text-xs font-mono">
                  <div className="text-slate-600 flex items-center space-x-3">
                    <span>
                      Affected: <strong className="text-slate-900">{req.peopleAffected}</strong>
                    </span>
                    <span>
                      Injured: <strong className="text-red-600">{req.injuredCount}</strong>
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/citizen/requests/${req.id}`)}
                    className="text-xs font-mono border-slate-300 text-blue-700 hover:bg-blue-50 bg-white"
                  >
                    Inspect Telemetry & Rescue Contacts <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
