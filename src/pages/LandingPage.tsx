import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  ShieldAlert,
  Radio,
  Boxes,
  Users,
  Activity,
  ArrowRight,
  ShieldCheck,
  Zap,
  MapPin,
  Cpu
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 flex flex-col font-sans selection:bg-blue-600/30">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <ShieldAlert className="h-6 w-6 text-white stroke-[2.5]" />
          </div>
          <span className="font-heading font-black text-xl tracking-wider text-slate-900">
            AEGIS<span className="text-blue-600">.AI</span>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="text-slate-700 hover:text-slate-900">
            Sign In
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/control')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
            Launch Mission Control
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono font-bold">
          <Cpu className="h-3.5 w-3.5 text-blue-600" />
          <span>DETERMINISTIC 100-POINT AI TRIAGE & RESOURCE DEPLOYMENT</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black font-heading tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
          National-Grade AI Emergency Operations & Resource Allocation
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          AEGIS AI coordinates disaster response with explainable triage scoring, real-time GIS heatmaps, and 24-hour supply scarcity forecast matrices.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          <Button
            variant="danger"
            size="lg"
            onClick={() => navigate('/citizen/sos')}
            className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-md"
          >
            <ShieldAlert className="h-5 w-5 mr-2" />
            Citizen 1-Tap Emergency SOS
          </Button>

          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/control')}
            className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Activity className="h-5 w-5 mr-2" />
            Mission Control Center
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/officer')}
            className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold border-slate-300 text-slate-700 hover:bg-slate-50 bg-white"
          >
            <Users className="h-5 w-5 mr-2 text-slate-500" />
            Field Officer Portal
          </Button>
        </div>
      </section>

      {/* Feature Pillar Cards */}
      <section className="px-6 py-12 max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="glass" className="p-6 space-y-3 border-slate-200 bg-white hover:border-slate-300 transition-all shadow-sm">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 w-fit">
            <Zap className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg font-heading text-slate-900">100-Point Triage Scoring</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Deterministic explainable AI scoring evaluating population density, casualty severity, vulnerability, and road access isolation.
          </p>
        </Card>

        <Card variant="glass" className="p-6 space-y-3 border-slate-200 bg-white hover:border-slate-300 transition-all shadow-sm">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 w-fit">
            <Boxes className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg font-heading text-slate-900">Scarcity Depletion Curves</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Predicts 24-hour water/food depot depletion times and automates inter-district relief truck transfer orders.
          </p>
        </Card>

        <Card variant="glass" className="p-6 space-y-3 border-slate-200 bg-white hover:border-slate-300 transition-all shadow-sm">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 w-fit">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg font-heading text-slate-900">Amphibious Fleet Tracking</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Real-time rescue team telemetry connecting NDRF field squads, motorboat fleets, and regional emergency control rooms.
          </p>
        </Card>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 px-6 py-6 text-center text-xs font-mono text-slate-500 bg-white">
        <p>AEGIS AI • National Emergency Management Platform • Odisha Operations Division</p>
      </footer>
    </div>
  );
};
