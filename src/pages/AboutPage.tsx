import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldAlert, Cpu, Boxes, Activity, MapPin } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 p-6 max-w-4xl mx-auto space-y-8 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <Link to="/" className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <ShieldAlert className="h-5 w-5 text-white stroke-[2.5]" />
          </div>
          <span className="font-heading font-black text-lg text-slate-900">
            AEGIS<span className="text-blue-600">.AI</span> Architecture
          </span>
        </Link>

        <Button variant="outline" size="sm" onClick={() => navigate('/control')} className="border-slate-300 bg-white text-slate-800 hover:bg-slate-50">
          Launch Control Room
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black font-heading text-slate-900">System Architectural Overview</h1>
          <p className="text-xs text-slate-600 font-mono mt-1">
            Explainable AI decision algorithms for disaster response & resource management
          </p>
        </div>

        <Card variant="glass" className="p-6 space-y-4 border-slate-200 bg-white shadow-sm">
          <h2 className="text-lg font-bold font-heading text-blue-700">1. Deterministic 100-Point Triage Engine</h2>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Unlike opaque LLM prompts that introduce hallucinations, AEGIS AI utilizes a deterministic mathematical formula combining 6 weighted vectors: Population Density (25%), Casualty Trauma Severity (20%), Demographics Vulnerability (15%), Supply Exhaustion (15%), Accessibility Isolation (15%), and Queue Waiting Delay (10%).
          </p>
        </Card>

        <Card variant="glass" className="p-6 space-y-4 border-slate-200 bg-white shadow-sm">
          <h2 className="text-lg font-bold font-heading text-amber-700">2. Automated 24h Supply Forecast & Transfer Matrix</h2>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Tracks real-time stock levels of drinking water, food kits, and medical burn packs across regional warehouses. Depletion algorithms forecast stock-out hours and auto-generate inter-district truck transfer mandates.
          </p>
        </Card>

        <Card variant="glass" className="p-6 space-y-4 border-slate-200 bg-white shadow-sm">
          <h2 className="text-lg font-bold font-heading text-emerald-700">3. Multi-Tier Operational Telemetry</h2>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Interlinks three distinct operational vistas: Citizen 1-Tap SOS dispatch with GPS, NDRF Field Squad amphibious fleet tracking, and Central Command Room decision control.
          </p>
        </Card>
      </div>
    </div>
  );
};
