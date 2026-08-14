import React from 'react';
import { AcousticVoiceAnalyzer } from '../../components/recon/AcousticVoiceAnalyzer';
import { MeshRelaySimulator } from '../../components/recon/MeshRelaySimulator';
import { Card } from '../../components/ui/Card';
import { Video, Camera, Mic, Radio, ShieldAlert, Sparkles, Activity } from 'lucide-react';

export const ControlTacticalReconPage: React.FC = () => {
  return (
    <div className="space-y-6 font-sans text-xs">
      {/* Top Banner */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-2 font-mono text-rose-600 text-[11px] mb-1">
          <Camera className="h-3.5 w-3.5 text-rose-600" />
          <span className="font-bold uppercase tracking-wider">AEGIS NEXT-GEN ACOUSTIC INTELLIGENCE</span>
        </div>
        <h1 className="text-2xl font-black font-heading text-slate-900">
          Voice SOS Intelligence & Mesh Relays
        </h1>
        <p className="text-xs text-slate-600 font-mono">
          Regional Voice Speech-to-Intent AI via Sarvam Samvaad, and Offline LoRa Mesh Relays
        </p>
      </div>

      {/* Feature 2 & 3 in Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AcousticVoiceAnalyzer />
        <MeshRelaySimulator />
      </div>
    </div>
  );
};
