import React from 'react';
import { PhoneCall, ShieldAlert, HeartPulse, Flame, Phone, X, Building2, Radio } from 'lucide-react';
import { Button } from '../ui/Button';

interface EmergencyHelplineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyHelplineModal: React.FC<EmergencyHelplineModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const helplines = [
    {
      number: '112',
      title: 'National Emergency Helpline',
      subtitle: 'Police, Fire, Ambulance Unified Response',
      icon: ShieldAlert,
      color: 'text-red-600 bg-red-50 border-red-500/40'
    },
    {
      number: '1070',
      title: 'State Disaster Operations Center',
      subtitle: 'SRC Odisha Emergency Control Room',
      icon: Radio,
      color: 'text-blue-600 bg-blue-50 border-blue-500/40'
    },
    {
      number: '108',
      title: 'National Health Mission Ambulance',
      subtitle: 'Emergency Medical & Trauma Transport',
      icon: HeartPulse,
      color: 'text-green-600 bg-green-50 border-green-500/40'
    },
    {
      number: '101',
      title: 'Fire & Water Rescue Services',
      subtitle: 'Water logging, fire hazards & structural collapse',
      icon: Flame,
      color: 'text-amber-600 bg-amber-50 border-amber-500/40'
    },
    {
      number: '1077',
      title: 'District Collectorate Helpline',
      subtitle: 'Local relief distribution & shelter allocation',
      icon: Building2,
      color: 'text-purple-700 bg-purple-50 border-purple-200'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-slate-900">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200">
              <PhoneCall className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono text-slate-900">Emergency Hotline Directory</h2>
              <p className="text-xs text-slate-600">Direct 24/7 Government Response Helplines</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 p-1 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {helplines.map((h, idx) => {
            const Icon = h.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl border ${h.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 font-mono">{h.title}</h3>
                    <p className="text-[11px] text-slate-600 font-sans">{h.subtitle}</p>
                  </div>
                </div>

                <a
                  href={`tel:${h.number}`}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 font-mono font-bold text-xs flex items-center shrink-0"
                >
                  <Phone className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                  {h.number}
                </a>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-200 text-center">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs font-mono">
            Close Directory
          </Button>
        </div>
      </div>
    </div>
  );
};
