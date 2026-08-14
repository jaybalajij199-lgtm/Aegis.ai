import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAegisStore } from '../../store/useAegisStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmergencyTimeline } from '../../components/emergency/EmergencyTimeline';
import { SafetyStatusWidget } from '../../components/citizen/SafetyStatusWidget';
import { DisasterAlertBanner } from '../../components/citizen/DisasterAlertBanner';
import { EmergencyHelplineModal } from '../../components/citizen/EmergencyHelplineModal';
import {
  ShieldAlert,
  FileText,
  Home,
  Hospital,
  Radio,
  PhoneCall,
  Droplets,
  Utensils,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { emergencies, shelters, hospitals, currentUser } = useAegisStore();
  const [isHelplineOpen, setIsHelplineOpen] = useState(false);

  // Filter active requests reported by citizen
  const myRequests = emergencies.filter(
    (e) => (e.reporterPhone === currentUser?.phone || e.reporterName === currentUser?.name) &&
           e.status !== 'RESOLVED' && e.status !== 'COMPLETED'
  ).slice(0, 3);
  const openSheltersCount = shelters.filter((s) => s.status === 'OPEN').length;
  const operationalHospitalsCount = hospitals.filter((h) => h.status === 'OPERATIONAL').length;

  const nearestShelter = shelters[0];
  const nearestHospital = hospitals[0];

  return (
    <div className="space-y-6 pb-8">
      {/* Live Disaster Alert Banner */}
      <DisasterAlertBanner />

      {/* Safety Status Check-In Widget */}
      <SafetyStatusWidget />

      {/* High impact Emergency Callout Banner */}
      <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-mono text-xs border border-red-300 font-bold">
              NATIONAL EMERGENCY RESPONSE: 112 / 1070
            </span>
            <button
              onClick={() => setIsHelplineOpen(true)}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white text-blue-700 hover:bg-blue-50 font-mono text-xs border border-blue-200 font-bold transition-colors"
            >
              <PhoneCall className="h-3 w-3 mr-1 text-blue-600" />
              Directory
            </button>
          </div>
          <h1 className="text-2xl font-black font-heading text-slate-900">
            In Immediate Danger? Trigger 1-Tap Emergency SOS
          </h1>
          <p className="text-xs text-red-900 font-sans max-w-xl">
            Locks high-precision GPS coordinates, transmits distress audio telemetry directly to AEGIS Mission Control, and dispatches nearest NDRF water rescue squad.
          </p>
        </div>

        <Button
          variant="danger"
          size="lg"
          onClick={() => navigate('/citizen/sos')}
          className="shadow-md animate-pulse text-sm font-bold font-mono px-8 py-3.5 shrink-0 bg-red-600 hover:bg-red-700 text-white"
        >
          <ShieldAlert className="h-5 w-5 mr-2" />
          TRIGGER 1-TAP SOS NOW
        </Button>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/citizen/report')}
          className="bg-white border border-slate-200 p-4 rounded-xl text-left hover:border-red-400 hover:bg-red-50/20 transition-all group shadow-sm"
        >
          <div className="p-2.5 rounded-lg bg-red-100 text-red-600 w-fit mb-2 group-hover:scale-110 transition-transform">
            <FileText className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 font-heading">Report Incident</h3>
          <p className="text-[11px] text-slate-600 mt-0.5 font-sans">Submit flood, damage or casualty intelligence</p>
        </button>

        <button
          onClick={() => navigate('/citizen/requests')}
          className="bg-white border border-slate-200 p-4 rounded-xl text-left hover:border-blue-400 hover:bg-blue-50/20 transition-all group shadow-sm"
        >
          <div className="p-2.5 rounded-lg bg-blue-100 text-blue-600 w-fit mb-2 group-hover:scale-110 transition-transform">
            <Radio className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 font-heading">My SOS Status</h3>
          <p className="text-[11px] text-slate-600 mt-0.5 font-sans">Track live rescue squad dispatch ETA</p>
        </button>

        <button
          onClick={() => navigate('/citizen/shelters')}
          className="bg-white border border-slate-200 p-4 rounded-xl text-left hover:border-emerald-400 hover:bg-emerald-50/20 transition-all group shadow-sm"
        >
          <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-600 w-fit mb-2 group-hover:scale-110 transition-transform">
            <Home className="h-5 w-5" />
          </div>
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900 font-heading">Relief Shelters</h3>
            <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
              {openSheltersCount} OPEN
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5 font-sans">Locate nearest open shelter with meals & water</p>
        </button>

        <button
          onClick={() => navigate('/citizen/hospitals')}
          className="bg-white border border-slate-200 p-4 rounded-xl text-left hover:border-amber-400 hover:bg-amber-50/20 transition-all group shadow-sm"
        >
          <div className="p-2.5 rounded-lg bg-amber-100 text-amber-600 w-fit mb-2 group-hover:scale-110 transition-transform">
            <Hospital className="h-5 w-5" />
          </div>
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900 font-heading">Hospitals & Beds</h3>
            <span className="text-[10px] font-mono text-amber-800 font-bold bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
              {operationalHospitalsCount} ACTIVE
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5 font-sans">Check ICU beds & ambulance readiness</p>
        </button>
      </div>

      {/* Active Requests Tracker */}
      <Card variant="glass" className="p-5 space-y-4 border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-bold text-base font-heading text-slate-900 flex items-center space-x-2">
              <Radio className="h-4 w-4 text-blue-600 animate-pulse" />
              <span>Your Reported Emergency Tickets</span>
            </h3>
            <p className="text-xs text-slate-600 font-mono">
              Live deterministic AI triage tracking and rescue battalion logs
            </p>
          </div>

          <Button variant="ghost" size="sm" onClick={() => navigate('/citizen/requests')} className="text-xs font-mono text-slate-700 hover:text-slate-900">
            View All ({myRequests.length}) <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>

        {myRequests.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-mono text-xs">
            No active emergency tickets reported. Tap SOS button if in danger.
          </div>
        ) : (
          <div className="space-y-4">
            {myRequests.map((req) => (
              <div key={req.id} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-blue-700 font-bold">{req.id}</span>
                      <span className="text-[10px] font-mono text-slate-600">
                        {new Date(req.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 font-heading mt-0.5">
                      {req.disasterType} Report - {req.location.address}
                    </h4>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant={req.priorityClassification === 'CRITICAL' ? 'critical' : 'high'}>
                      {req.priorityClassification}
                    </Badge>
                    <span className="text-xs font-mono font-bold text-blue-800 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded">
                      Score: {req.priorityScore}/100
                    </span>
                  </div>
                </div>

                {/* Audit Log / Timeline */}
                <EmergencyTimeline />

                <div className="pt-2 flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-600">
                    District Sector: <strong className="text-slate-900">{req.location.district}</strong>
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/citizen/requests/${req.id}`)}
                    className="text-xs h-8 border-slate-300 text-blue-700 hover:border-blue-500 bg-white"
                  >
                    Inspect Telemetry <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* District Relief Infrastructure Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nearest Open Relief Shelter Highlight */}
        <Card variant="glass" className="p-4 space-y-3 border-slate-200 bg-white">
          <div className="flex justify-between items-start border-b border-slate-200 pb-2">
            <div className="flex items-center space-x-2">
              <Home className="h-4 w-4 text-emerald-600" />
              <h3 className="text-xs font-bold font-mono text-slate-900 uppercase">Primary Relief Hub</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 font-bold">
              OPEN 24/7
            </span>
          </div>

          <div className="space-y-1 font-sans text-xs">
            <p className="font-bold text-slate-900 text-sm">{nearestShelter?.name || 'No open shelter nearby'}</p>
            {nearestShelter?.location?.address && (
              <p className="text-slate-600 flex items-center">
                <MapPin className="h-3.5 w-3.5 text-blue-600 mr-1 shrink-0" />
                {nearestShelter.location.address}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-1.5 text-slate-700">
              <Utensils className="h-3.5 w-3.5 text-amber-600" />
              <span>Meals: <strong className="text-slate-900">{nearestShelter?.foodStockDays || 0} days</strong></span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-700">
              <Droplets className="h-3.5 w-3.5 text-blue-600" />
              <span>Water: <strong className="text-slate-900">{nearestShelter?.waterStockDays || 0} days</strong></span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/citizen/shelters')}
            className="w-full text-xs font-mono border-slate-300 text-slate-800 hover:bg-slate-50"
          >
            Browse All Relief Shelters
          </Button>
        </Card>

        {/* Nearest Trauma Hospital Highlight */}
        <Card variant="glass" className="p-4 space-y-3 border-slate-200 bg-white">
          <div className="flex justify-between items-start border-b border-slate-200 pb-2">
            <div className="flex items-center space-x-2">
              <Hospital className="h-4 w-4 text-amber-600" />
              <h3 className="text-xs font-bold font-mono text-slate-900 uppercase">Disaster Medical Center</h3>
            </div>
            <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 font-bold">
              LEVEL-1 TRAUMA
            </span>
          </div>

          <div className="space-y-1 font-sans text-xs">
            <p className="font-bold text-slate-900 text-sm">{nearestHospital?.name || 'No operational hospital nearby'}</p>
            {nearestHospital?.location?.address && (
              <p className="text-slate-600 flex items-center">
                <MapPin className="h-3.5 w-3.5 text-blue-600 mr-1 shrink-0" />
                {nearestHospital.location.address}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div>
              <p className="text-[9px] text-slate-500 uppercase">General</p>
              <p className="text-xs font-bold text-blue-700">{nearestHospital?.availableBeds || 0}/{nearestHospital?.totalBeds || 0}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-500 uppercase">ICU Beds</p>
              <p className="text-xs font-bold text-red-600">{nearestHospital?.icuBedsAvailable || 0}/{nearestHospital?.icuBedsTotal || 0}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-500 uppercase">Ambulance</p>
              <p className="text-xs font-bold text-emerald-700">{nearestHospital?.ambulancesAvailable || 0}/{nearestHospital?.ambulancesTotal || 0}</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/citizen/hospitals')}
            className="w-full text-xs font-mono border-slate-300 text-slate-800 hover:bg-slate-50"
          >
            Inspect Hospital Bed Telemetry
          </Button>
        </Card>
      </div>

      {/* Helpline Modal */}
      <EmergencyHelplineModal isOpen={isHelplineOpen} onClose={() => setIsHelplineOpen(false)} />
    </div>
  );
};
