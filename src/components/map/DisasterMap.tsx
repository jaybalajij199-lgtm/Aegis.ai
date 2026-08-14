import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { EmergencyRequest } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { RIVER_HYDRO_GAUGES, RiverHydroGauge } from '../../services/weatherService';
import { useAegisStore } from '../../store/useAegisStore';
import {
  ShieldAlert,
  Waves,
  Home,
  Users,
  Layers,
  ArrowRight
} from 'lucide-react';

interface DisasterMapProps {
  emergencies: EmergencyRequest[];
  selectedId?: string | null;
  onSelectEmergency?: (id: string) => void;
  height?: string;
}

// Custom Leaflet DivIcons for clean dark GIS rendering
const createCustomIcon = (bgColor: string, text: string) => {
  return L.divIcon({
    className: 'custom-leaflet-pin',
    html: `<div style="background-color: ${bgColor};" class="w-7 h-7 rounded-full border-2 border-white text-slate-950 font-black text-[10px] flex items-center justify-center shadow-lg font-mono">${text}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

const shelterIcon = createCustomIcon('#10b981', '🏫');
const squadIcon = createCustomIcon('#06b6d4', '🚤');

// Component to dynamically re-center map when selected item changes
const MapRecenter: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo([lat, lng], 12, { duration: 1 });
  }, [lat, lng, map]);
  return null;
};

export const DisasterMap: React.FC<DisasterMapProps> = ({
  emergencies,
  selectedId,
  onSelectEmergency,
  height = '560px'
}) => {
  const { shelters, missions } = useAegisStore();
  
  // Calculate dynamic center based on active emergencies, fallback to a central point if none exist
  const defaultCenter = useMemo(() => {
    if (emergencies.length === 0) return { lat: 20.2961, lng: 85.8245 }; // Bhubaneswar
    const lats = emergencies.map(e => e.location.lat);
    const lngs = emergencies.map(e => e.location.lng);
    return {
      lat: lats.reduce((a, b) => a + b, 0) / lats.length,
      lng: lngs.reduce((a, b) => a + b, 0) / lngs.length
    };
  }, [emergencies]);

  // Layer Toggles State
  const [showEmergencies, setShowEmergencies] = useState(true);
  const [showHydroGauges, setShowHydroGauges] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showSquads, setShowSquads] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL');

  const selectedEmergency = emergencies.find((e) => e.id === selectedId);

  const filteredEmergencies = emergencies.filter((item) => {
    if (item.status === 'RESOLVED' || item.status === 'COMPLETED') return false;
    if (priorityFilter === 'CRITICAL') return item.priorityClassification === 'CRITICAL';
    if (priorityFilter === 'HIGH') return item.priorityClassification === 'CRITICAL' || item.priorityClassification === 'HIGH';
    return true;
  });

  const getMarkerColor = (classification: string) => {
    switch (classification) {
      case 'CRITICAL': return '#ef4444'; // Red
      case 'HIGH': return '#f97316';     // Orange
      case 'MEDIUM': return '#eab308';   // Yellow
      default: return '#38bdf8';         // Cyan
    }
  };

  const getGaugeColor = (status: RiverHydroGauge['status']) => {
    switch (status) {
      case 'CRITICAL_OVERFLOW': return '#dc2626';
      case 'DANGER': return '#f97316';
      case 'WARNING': return '#eab308';
      default: return '#10b981';
    }
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-2xl relative bg-slate-50 font-sans text-xs">
      {/* GIS Floating Layer Control Panel Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 z-10 relative">
        <div className="flex items-center space-x-2">
          <Layers className="h-4 w-4 text-blue-600" />
          <span className="font-bold text-slate-900 font-heading">GIS Satellite Disaster Map & Hydro Layers</span>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setShowEmergencies(!showEmergencies)}
            className={`px-2.5 py-1 rounded-full border flex items-center space-x-1 transition-all ${
              showEmergencies
                ? 'bg-red-50 border-rose-500/50 text-rose-300 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-500 line-through'
            }`}
          >
            <ShieldAlert className="h-3 w-3" />
            <span>SOS Incidents ({emergencies.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHydroGauges(!showHydroGauges)}
            className={`px-2.5 py-1 rounded-full border flex items-center space-x-1 transition-all ${
              showHydroGauges
                ? 'bg-blue-50 border-blue-500/50 text-blue-700 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-500 line-through'
            }`}
          >
            <Waves className="h-3 w-3" />
            <span>River Hydro Gauges ({RIVER_HYDRO_GAUGES.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setShowShelters(!showShelters)}
            className={`px-2.5 py-1 rounded-full border flex items-center space-x-1 transition-all ${
              showShelters
                ? 'bg-green-50 border-green-500/50 text-green-700 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-500 line-through'
            }`}
          >
            <Home className="h-3 w-3" />
            <span>Relief Shelters ({shelters.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSquads(!showSquads)}
            className={`px-2.5 py-1 rounded-full border flex items-center space-x-1 transition-all ${
              showSquads
                ? 'bg-purple-950 border-purple-500/50 text-purple-300 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-500 line-through'
            }`}
          >
            <Users className="h-3 w-3" />
            <span>NDRF Squads ({missions.length})</span>
          </button>

          {/* Priority Filter */}
          <div className="flex items-center space-x-1 bg-slate-50 p-0.5 rounded border border-slate-200 ml-2">
            <span className="text-slate-600 text-[10px] px-1">Priority:</span>
            <button
              onClick={() => setPriorityFilter('ALL')}
              className={`px-1.5 py-0.5 rounded ${priorityFilter === 'ALL' ? 'bg-blue-600 text-white text-slate-950 font-bold' : 'text-slate-600'}`}
            >
              ALL
            </button>
            <button
              onClick={() => setPriorityFilter('CRITICAL')}
              className={`px-1.5 py-0.5 rounded ${priorityFilter === 'CRITICAL' ? 'bg-rose-500 text-slate-900 font-bold' : 'text-slate-600'}`}
            >
              CRITICAL
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div style={{ height }} className="w-full relative z-0">
        <MapContainer
          center={[defaultCenter.lat, defaultCenter.lng]}
          zoom={10}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          {selectedEmergency && (
            <MapRecenter
              lat={selectedEmergency.location.lat}
              lng={selectedEmergency.location.lng}
            />
          )}

          {/* LAYER 1: Emergency SOS Incidents */}
          {showEmergencies &&
            filteredEmergencies.map((item) => {
              const color = getMarkerColor(item.priorityClassification);
              const isSelected = item.id === selectedId;

              return (
                <React.Fragment key={`emerg-${item.id}`}>
                  {/* Heatmap Outer Pulse Circle */}
                  <CircleMarker
                    center={[item.location.lat, item.location.lng]}
                    radius={isSelected ? 32 : 22}
                    pathOptions={{
                      color,
                      fillColor: color,
                      fillOpacity: item.priorityClassification === 'CRITICAL' ? 0.38 : 0.22,
                      weight: isSelected ? 3 : 1
                    }}
                  />

                  {/* Core Solid Pin */}
                  <CircleMarker
                    center={[item.location.lat, item.location.lng]}
                    radius={isSelected ? 10 : 7}
                    pathOptions={{
                      color: '#ffffff',
                      fillColor: color,
                      fillOpacity: 1,
                      weight: 2
                    }}
                    eventHandlers={{
                      click: () => {
                        if (onSelectEmergency) onSelectEmergency(item.id);
                      }
                    }}
                  >
                    <Popup>
                      <div className="p-1 space-y-2 text-slate-900 font-sans min-w-[230px]">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                          <span className="font-mono font-bold text-blue-700 text-xs">{item.id}</span>
                          <Badge priority={item.priorityClassification}>{item.priorityClassification}</Badge>
                        </div>

                        <div className="space-y-1 text-xs">
                          <p className="font-bold text-slate-900">{item.location.district}</p>
                          <p className="text-[11px] text-slate-600">{item.location.address}</p>
                          <div className="flex justify-between text-[11px] font-mono text-slate-600 pt-1 border-t border-slate-200">
                            <span>Affected: <strong className="text-slate-900">{item.peopleAffected}</strong></span>
                            <span>Injured: <strong className="text-red-600">{item.injuredCount}</strong></span>
                          </div>
                          <p className="text-[10px] text-slate-600 italic">"{item.description}"</p>
                        </div>

                        {onSelectEmergency && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => onSelectEmergency(item.id)}
                            className="w-full text-xs h-7 mt-2 bg-blue-600 text-white hover:bg-blue-600 text-white font-bold"
                          >
                            Inspect Triage <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                </React.Fragment>
              );
            })}

          {/* LAYER 2: River Basin Hydro Gauges */}
          {showHydroGauges &&
            RIVER_HYDRO_GAUGES.map((gauge) => {
              const gaugeColor = getGaugeColor(gauge.status);

              return (
                <CircleMarker
                  key={gauge.id}
                  center={[gauge.lat, gauge.lng]}
                  radius={12}
                  pathOptions={{
                    color: '#ffffff',
                    fillColor: gaugeColor,
                    fillOpacity: 0.9,
                    weight: 2
                  }}
                >
                  <Popup>
                    <div className="p-1 space-y-2 text-slate-900 font-sans min-w-[220px]">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                        <span className="font-mono font-bold text-blue-700 text-xs">{gauge.riverName}</span>
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-rose-800">
                          {gauge.status}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <p className="font-bold text-slate-900">{gauge.gaugeStation}</p>
                        <div className="bg-white p-2 rounded border border-slate-200 space-y-1 font-mono text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Current Level:</span>
                            <strong className="text-red-600 font-bold text-xs">{gauge.currentLevelMeters}m</strong>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Danger Mark:</span>
                            <span>{gauge.dangerLevelMeters}m</span>
                          </div>
                          <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-1">
                            <span>Discharge Rate:</span>
                            <span className="text-blue-700 font-bold">{gauge.dischargeCusecs.toLocaleString()} cusecs</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

          {/* LAYER 3: Relief Shelters */}
          {showShelters &&
            shelters.map((shelter) => (
              <Marker
                key={shelter.id}
                position={[shelter.location.lat, shelter.location.lng]}
                icon={shelterIcon}
              >
                <Popup>
                  <div className="p-1 space-y-1.5 text-slate-900 font-sans min-w-[200px]">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <span className="font-bold text-green-600 text-xs">🏫 Relief Shelter</span>
                      <span className="text-[10px] text-slate-600 font-mono">{shelter.currentOccupancy} / {shelter.capacity} Capacity</span>
                    </div>
                    <p className="font-bold text-slate-900 text-xs">{shelter.name}</p>
                    <p className="text-[11px] text-slate-600">{shelter.location.address}</p>
                    <div className="bg-white p-1.5 rounded border border-slate-200 text-[10px] font-mono text-green-700">
                      Medical Aid Unit • Water Stocks Available
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* LAYER 4: NDRF Rescuer Squads */}
          {showSquads &&
            missions
              .filter(m => m.status !== 'MISSION_COMPLETE')
              .map((mission) => (
              <Marker
                key={mission.id}
                position={[mission.location.lat, mission.location.lng]}
                icon={squadIcon}
              >
                <Popup>
                  <div className="p-1 space-y-1.5 text-slate-900 font-sans min-w-[210px]">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <span className="font-bold text-blue-700 text-xs">🚤 {mission.teamName}</span>
                      <span className="text-[10px] font-bold text-purple-300 bg-purple-950 px-1.5 py-0.5 rounded">
                        {mission.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800">Cmdr: {mission.leaderName}</p>
                    <div className="bg-white p-2 rounded border border-slate-200 text-[11px] font-mono space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Personnel:</span>
                        <strong className="text-slate-900">{mission.personnelCount} Rescuers</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Vehicles:</span>
                        <strong className="text-blue-700">{mission.vehicleType}</strong>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>
    </div>
  );
};
