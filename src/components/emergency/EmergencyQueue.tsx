import React, { useState } from 'react';
import { useAegisStore } from '../../store/useAegisStore';
import { EmergencyRequest } from '../../types';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { ShieldAlert, MapPin, Users, Activity, CheckCircle, Clock, Search, Filter } from 'lucide-react';

interface EmergencyQueueProps {
  emergencies?: EmergencyRequest[];
  selectedId?: string;
  onSelectEmergency?: (id: string) => void;
}

export const EmergencyQueue: React.FC<EmergencyQueueProps> = ({
  emergencies: propEmergencies,
  selectedId: propSelectedId,
  onSelectEmergency: propOnSelect
}) => {
  const store = useAegisStore();

  const activeList = propEmergencies || store.emergencies;
  const activeSelectedId = propSelectedId !== undefined ? propSelectedId : store.selectedEmergencyId;
  const handleSelect = propOnSelect || store.setSelectedEmergencyId;

  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const filtered = activeList.filter((e) => {
    if (e.status === 'RESOLVED' || e.status === 'COMPLETED') return false;
    const matchesPriority = priorityFilter === 'ALL' || e.priorityClassification === priorityFilter;
    const matchesSearch =
      e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.location.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.disasterType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  const sorted = [...filtered].sort((a, b) => b.priorityScore - a.priorityScore);

  return (
    <Card variant="glass" className="p-4 space-y-3 border-slate-200">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-2">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="h-5 w-5 text-rose-500 animate-pulse" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono">
            Active SOS Incident Stream ({sorted.length})
          </h2>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-44">
            <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search district, type..."
              className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-2 py-1 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>

          {/* Priority filter tab */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-mono focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Incident Cards Stream */}
      <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
        {sorted.length === 0 ? (
          <div className="p-6 text-center text-slate-500 font-mono text-xs">
            No active emergencies match the current filter criteria.
          </div>
        ) : (
          sorted.map((emerg) => {
            const isSelected = activeSelectedId === emerg.id;
            const isResolved = emerg.status === 'RESOLVED' || emerg.status === 'COMPLETED';

            return (
              <div
                key={emerg.id}
                onClick={() => handleSelect(emerg.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-500 text-slate-900 shadow-lg shadow-cyan-950/60 ring-1 ring-cyan-500/50'
                    : isResolved
                    ? 'bg-white/40 border-slate-200/80 opacity-60'
                    : 'bg-white/80 border-slate-200/80 hover:border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          emerg.priorityClassification === 'CRITICAL'
                            ? 'critical'
                            : emerg.priorityClassification === 'HIGH'
                            ? 'high'
                            : 'medium'
                        }
                      >
                        SCORE: {emerg.priorityScore}/100
                      </Badge>

                      <span className="font-mono text-xs font-bold text-slate-800 flex items-center">
                        <MapPin className="h-3 w-3 mr-1 text-blue-600" />
                        {emerg.location.district} ({emerg.disasterType})
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 line-clamp-2 mt-1 font-sans">
                      {emerg.description}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    {isResolved ? (
                      <span className="inline-flex items-center text-[10px] text-green-600 font-mono font-bold bg-green-50/60 border border-emerald-800 px-2 py-0.5 rounded">
                        <CheckCircle className="h-3 w-3 mr-1" /> RESOLVED
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] text-amber-600 font-mono font-bold bg-amber-50/60 border border-amber-800 px-2 py-0.5 rounded">
                        <Clock className="h-3 w-3 mr-1" /> {emerg.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600 font-mono">
                  <span className="flex items-center">
                    <Users className="h-3 w-3 mr-1 text-blue-600" /> Affected: {emerg.peopleAffected.toLocaleString()} villagers
                  </span>

                  <span className="flex items-center">
                    <Activity className="h-3 w-3 mr-1 text-rose-400" /> Injured: {emerg.injuredCount}
                  </span>

                  <span className="text-slate-500 text-[10px]">
                    Waiting: {emerg.waitingTimeMinutes || 12} mins
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
