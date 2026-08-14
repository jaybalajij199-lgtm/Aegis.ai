import React, { useState } from 'react';
import { AlertTriangle, Radio, ShieldAlert, ChevronRight, X, Waves, Wind } from 'lucide-react';

export const DisasterAlertBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-red-950 via-rose-900 to-amber-950 border border-red-500/50 p-3.5 rounded-2xl shadow-xl space-y-2 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-red-500/20 text-red-600 border border-red-500/40 animate-pulse">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold font-mono text-red-200 uppercase tracking-wide">
            SEVERE DISASTER ADVISORY • RED ALERT
          </span>
          <span className="text-[10px] font-mono bg-red-500 text-white font-bold px-2 py-0.5 rounded-full animate-pulse">
            LIVE BROADCAST
          </span>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="text-slate-600 hover:text-white p-1 rounded-lg hover:bg-red-900/50 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs font-sans">
        <div className="bg-slate-50/60 p-2.5 rounded-xl border border-red-200 flex items-start space-x-2.5">
          <Waves className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-white font-mono text-[11px]">Regional River Inundation Level</p>
            <p className="text-[11px] text-slate-700">
              Current level approaching Danger thresholds. Water discharge levels at regional dams are critical.
            </p>
          </div>
        </div>

        <div className="bg-slate-50/60 p-2.5 rounded-xl border border-red-200 flex items-start space-x-2.5">
          <Wind className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-white font-mono text-[11px]">Evacuation Order for Low-Lying Wards</p>
            <p className="text-[11px] text-slate-700">
              Low-lying zones in your regional sector ordered to evacuate to designated relief shelters immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
