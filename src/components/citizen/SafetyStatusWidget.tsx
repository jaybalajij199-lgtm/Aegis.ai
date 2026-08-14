import React, { useState } from 'react';
import { useAegisStore } from '../../store/useAegisStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ShieldCheck, AlertCircle, HeartPulse, CheckCircle2, Users, MapPin } from 'lucide-react';

export const SafetyStatusWidget: React.FC = () => {
  const { currentUser } = useAegisStore();
  const [safetyStatus, setSafetyStatus] = useState<'SAFE' | 'NEED_SUPPLIES' | 'EMERGENCY' | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const handleStatusCheckIn = (status: 'SAFE' | 'NEED_SUPPLIES' | 'EMERGENCY') => {
    setSafetyStatus(status);
    setIsCheckedIn(true);
    setTimeout(() => {
      // Auto dismiss success toast state after a while
    }, 5000);
  };

  return (
    <Card variant="glass" className="p-4 space-y-3 border-green-200 bg-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-green-600 border border-green-200">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono text-slate-900 uppercase tracking-wider">
              Citizen Household Safety Check-In
            </h3>
            <p className="text-[10px] text-slate-600 font-sans">
              Notifies district authorities & emergency contacts of your current status
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-[10px] font-mono text-green-700 bg-green-50/80 px-2 py-1 rounded border border-green-200">
          <Users className="h-3 w-3 text-green-600" />
          <span>Citizens Marked Safe in your Regional Sector</span>
        </div>
      </div>

      {isCheckedIn ? (
        <div className="p-3 bg-white/90 rounded-xl border border-green-500/40 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <div>
              <p className="text-slate-800 font-bold">
                Household Status Updated:{' '}
                <span className={safetyStatus === 'SAFE' ? 'text-green-600' : 'text-amber-600'}>
                  {safetyStatus === 'SAFE' ? 'MARKED SAFE' : safetyStatus === 'NEED_SUPPLIES' ? 'NEED RATIONS/SUPPLIES' : 'CRITICAL SOS'}
                </span>
              </p>
              <p className="text-[10px] text-slate-600 font-sans">
                Logged at {new Date().toLocaleTimeString()} for {currentUser.name} ({currentUser.phone})
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCheckedIn(false)}
            className="text-[10px] text-slate-600 hover:text-slate-900 underline font-mono"
          >
            Change Status
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => handleStatusCheckIn('SAFE')}
            className="p-2.5 rounded-xl bg-green-50/60 border border-green-500/40 hover:bg-green-100 transition-all text-left group flex items-center space-x-2"
          >
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-green-600 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-green-700 font-mono">I Am Safe</p>
              <p className="text-[10px] text-slate-600 font-sans">Household uninjured & sheltered</p>
            </div>
          </button>

          <button
            onClick={() => handleStatusCheckIn('NEED_SUPPLIES')}
            className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-500/40 hover:bg-amber-100 transition-all text-left group flex items-center space-x-2"
          >
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 group-hover:scale-110 transition-transform">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-700 font-mono">Need Food/Water</p>
              <p className="text-[10px] text-slate-600 font-sans">Safe but low on basic rations</p>
            </div>
          </button>

          <button
            onClick={() => handleStatusCheckIn('EMERGENCY')}
            className="p-2.5 rounded-xl bg-red-50/60 border border-red-500/40 hover:bg-red-100 transition-all text-left group flex items-center space-x-2"
          >
            <div className="p-1.5 rounded-lg bg-red-500/20 text-red-600 group-hover:scale-110 transition-transform">
              <HeartPulse className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-red-700 font-mono">Critical Assistance</p>
              <p className="text-[10px] text-slate-600 font-sans">Trapped or injured casualty</p>
            </div>
          </button>
        </div>
      )}
    </Card>
  );
};
