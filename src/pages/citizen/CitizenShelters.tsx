import React, { useState } from 'react';
import { useAegisStore } from '../../store/useAegisStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Home,
  Phone,
  Users,
  Droplets,
  Utensils,
  MapPin,
  Search,
  CheckCircle2,
  HeartPulse,
  Navigation,
  Check
} from 'lucide-react';

export const CitizenShelters: React.FC = () => {
  const { shelters } = useAegisStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [transportRequestedId, setTransportRequestedId] = useState<string | null>(null);

  const filteredShelters = shelters.filter((sh) => {
    const matchesStatus = statusFilter === 'ALL' || sh.status === statusFilter;
    const matchesSearch =
      sh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sh.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sh.district.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleRequestTransport = (id: string) => {
    setTransportRequestedId(id);
    setTimeout(() => {
      setTransportRequestedId(null);
    }, 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 flex items-center space-x-2">
            <Home className="h-5 w-5 text-blue-600" />
            <span>Multipurpose Disaster Relief Shelters</span>
          </h1>
          <p className="text-xs text-slate-600 font-mono mt-0.5">
            Real-time occupancy, food & water stock days, and medical post readiness
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search shelter or district..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-2 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 text-xs font-mono rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open Only</option>
            <option value="FULL">Full Capacity</option>
          </select>
        </div>
      </div>

      {/* Shelter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredShelters.map((sh) => {
          const percent = Math.round((sh.currentOccupancy / sh.capacity) * 100);
          const isFull = percent >= 95;

          return (
            <Card key={sh.id} variant="glass" className="p-5 space-y-4 border-slate-200 bg-white hover:border-slate-300 transition-all shadow-sm">
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-heading">{sh.name}</h3>
                  <p className="text-xs text-slate-600 flex items-center mt-1 font-mono">
                    <MapPin className="h-3.5 w-3.5 text-blue-600 mr-1 shrink-0" />
                    {sh.location.address}, {sh.district}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold shrink-0 ${
                    sh.status === 'OPEN'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {sh.status}
                </span>
              </div>

              {/* Occupancy Progress Bar */}
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-[11px] text-slate-700">
                  <span>Shelter Capacity Occupancy</span>
                  <span className="text-slate-900 font-bold">
                    {sh.currentOccupancy.toLocaleString()} / {sh.capacity.toLocaleString()} ({percent}%)
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden border border-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percent > 90 ? 'bg-red-500' : percent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Rations & Medical Facilities Grid */}
              <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <p className="text-[10px] text-slate-600 uppercase flex items-center">
                    <Utensils className="h-3 w-3 mr-1 text-amber-600" /> Meal Kits
                  </p>
                  <p className="font-bold text-slate-900 mt-0.5">{sh.foodStockDays} Days</p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-600 uppercase flex items-center">
                    <Droplets className="h-3 w-3 mr-1 text-blue-600" /> Water Supply
                  </p>
                  <p className="font-bold text-slate-900 mt-0.5">{sh.waterStockDays} Days</p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-600 uppercase flex items-center">
                    <HeartPulse className="h-3 w-3 mr-1 text-emerald-600" /> Medical Post
                  </p>
                  <p className={`font-bold mt-0.5 ${sh.hasMedicalPost ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                    {sh.hasMedicalPost ? 'AVAILABLE' : 'LIMITED'}
                  </p>
                </div>
              </div>

              {/* Contact & Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs font-mono">
                <div>
                  <span className="text-slate-600 text-[11px] block">In-Charge: {sh.contactPerson}</span>
                  <a
                    href={`tel:${sh.phone}`}
                    className="inline-flex items-center text-blue-700 font-bold hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5 mr-1 text-blue-600" /> {sh.phone}
                  </a>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={isFull || transportRequestedId === sh.id}
                  onClick={() => handleRequestTransport(sh.id)}
                  className="text-xs font-mono border-slate-300 text-emerald-700 hover:bg-emerald-50 bg-white"
                >
                  {transportRequestedId === sh.id ? (
                    <span className="flex items-center text-emerald-700 font-bold">
                      <Check className="h-3.5 w-3.5 mr-1" /> Transport Requested!
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Navigation className="h-3.5 w-3.5 mr-1" /> Request Evacuation Transport
                    </span>
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
