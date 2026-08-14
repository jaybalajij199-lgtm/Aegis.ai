import React, { useState } from 'react';
import { useAegisStore } from '../../store/useAegisStore';
import { DisasterMap } from '../../components/map/DisasterMap';
import { EmergencyQueue } from '../../components/emergency/EmergencyQueue';
import { WeatherDashboard } from '../../components/weather/WeatherDashboard';
import { Map, CloudRain, ShieldAlert, Waves, Users, Radio, Sparkles } from 'lucide-react';

export const ControlMapPage: React.FC = () => {
  const { emergencies, selectedEmergencyId, setSelectedEmergencyId } = useAegisStore();
  const [activeTab, setActiveTab] = useState<'map' | 'weather'>('map');

  const criticalCount = emergencies.filter((e) => e.priorityClassification === 'CRITICAL').length;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2 font-mono text-xs text-blue-600 mb-1">
            <Radio className="h-3.5 w-3.5 animate-pulse text-blue-600" />
            <span className="font-bold uppercase tracking-wider">AEGIS GIS & METEOROLOGICAL TELEMETRY COMMAND</span>
          </div>
          <h1 className="text-2xl font-black font-heading text-slate-900">
            Disaster GIS Map & Live Weather Operations
          </h1>
          <p className="text-xs text-slate-600 font-mono">
            Multi-layer satellite GIS mapping, real-time weather radar, and Mahanadi river hydrographs
          </p>
        </div>

        {/* View Selector Tabs */}
        <div className="flex items-center p-1 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs font-bold">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
              activeTab === 'map'
                ? 'bg-blue-600 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Map className="h-4 w-4" />
            <span>GIS Satellite Map</span>
            <span className="ml-1 px-1.5 py-0.2 bg-white text-blue-700 rounded text-[10px]">
              {emergencies.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('weather')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
              activeTab === 'weather'
                ? 'bg-blue-600 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CloudRain className="h-4 w-4" />
            <span>Live Weather & Hydro</span>
            <span className="ml-1 px-1.5 py-0.2 bg-red-50 text-red-700 border border-red-200 rounded text-[10px] font-bold">
              RED ALERT
            </span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'map' ? (
        <div className="space-y-6">
          <DisasterMap
            emergencies={emergencies}
            selectedId={selectedEmergencyId}
            onSelectEmergency={setSelectedEmergencyId}
            height="620px"
          />

          <EmergencyQueue
            emergencies={emergencies}
            selectedId={selectedEmergencyId}
            onSelectEmergency={setSelectedEmergencyId}
          />
        </div>
      ) : (
        <WeatherDashboard />
      )}
    </div>
  );
};
