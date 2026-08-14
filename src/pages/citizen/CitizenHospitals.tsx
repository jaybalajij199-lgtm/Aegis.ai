import React, { useState } from 'react';
import { useAegisStore } from '../../store/useAegisStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Hospital, Phone, HeartPulse, Truck, MapPin, Search, CheckCircle2, ShieldAlert } from 'lucide-react';

export const CitizenHospitals: React.FC = () => {
  const { hospitals } = useAegisStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [requestedHospitalId, setRequestedHospitalId] = useState<string | null>(null);

  const filteredHospitals = hospitals.filter((h) => {
    const matchesDistrict = districtFilter === 'ALL' || h.district === districtFilter;
    const matchesSearch =
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.district.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDistrict && matchesSearch;
  });

  const handleBookAmbulance = (id: string) => {
    setRequestedHospitalId(id);
    setTimeout(() => {
      setRequestedHospitalId(null);
    }, 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 flex items-center space-x-2">
            <Hospital className="h-5 w-5 text-amber-600" />
            <span>Emergency Hospitals & Bed Telemetry</span>
          </h1>
          <p className="text-xs text-slate-600 font-mono mt-0.5">
            Real-time ICU bed availability, trauma level status, and ambulance readiness
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search hospital or district..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-2 py-1.5 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>

          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="bg-white border border-slate-300 text-xs font-mono rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none"
          >
            <option value="ALL">All Districts</option>
            {Array.from(new Set(hospitals.map(h => h.district))).map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Hospital Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHospitals.map((hosp) => (
          <Card key={hosp.id} variant="glass" className="p-5 space-y-4 border-slate-200 bg-white hover:border-slate-300 transition-all shadow-sm">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 font-heading">{hosp.name}</h3>
                <p className="text-xs text-slate-600 flex items-center mt-1 font-mono">
                  <MapPin className="h-3.5 w-3.5 text-blue-600 mr-1 shrink-0" />
                  {hosp.location.address}, {hosp.district}
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold shrink-0 ${
                  hosp.status === 'OPERATIONAL'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-red-50 text-red-800 border border-red-300'
                }`}
              >
                {hosp.status}
              </span>
            </div>

            {/* Bed & Ambulance Gauges */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <p className="text-[10px] text-slate-500 uppercase">General Beds</p>
                <p className="text-sm font-black text-blue-700 mt-0.5">
                  {hosp.availableBeds} / {hosp.totalBeds}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 uppercase flex items-center justify-center">
                  <HeartPulse className="h-3 w-3 mr-1 text-red-600" /> ICU Beds
                </p>
                <p className="text-sm font-black text-red-600 mt-0.5">
                  {hosp.icuBedsAvailable} / {hosp.icuBedsTotal}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 uppercase flex items-center justify-center">
                  <Truck className="h-3 w-3 mr-1 text-emerald-600" /> Ambulances
                </p>
                <p className="text-sm font-black text-emerald-700 mt-0.5">
                  {hosp.ambulancesAvailable} / {hosp.ambulancesTotal}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs font-mono">
              <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-300 text-[10px] w-fit">
                {hosp.traumaLevel.replace('_', ' ')} CENTER
              </span>

              <div className="flex items-center space-x-2">
                <a
                  href={`tel:${hosp.contactNumber}`}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-blue-700 font-mono font-bold text-xs flex items-center"
                >
                  <Phone className="h-3.5 w-3.5 mr-1 text-blue-600" /> {hosp.contactNumber}
                </a>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleBookAmbulance(hosp.id)}
                  disabled={requestedHospitalId === hosp.id}
                  className="text-xs font-mono font-bold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {requestedHospitalId === hosp.id ? 'Ambulance Dispatched!' : 'Request Ambulance'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
