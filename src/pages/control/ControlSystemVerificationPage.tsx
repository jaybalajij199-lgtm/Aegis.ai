import React from 'react';
import { SystemTestRunner } from '../../components/testing/SystemTestRunner';
import { PerformanceProfiler } from '../../components/testing/PerformanceProfiler';
import { ShieldCheck, Gauge, CheckCircle2, Cpu } from 'lucide-react';

export const ControlSystemVerificationPage: React.FC = () => {
  return (
    <div className="space-y-6 font-sans text-xs">
      {/* Top Banner */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-2 font-mono text-blue-600 text-[11px] mb-1">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
          <span className="font-bold uppercase tracking-wider">AEGIS AUTOMATED TESTING & SYSTEM PERFORMANCE COMMAND</span>
        </div>
        <h1 className="text-2xl font-black font-heading text-slate-900">
          System Verification & Performance Profiler
        </h1>
        <p className="text-xs text-slate-600 font-mono">
          Automated unit tests, load stress simulation, triage benchmarks, and state latency profiling
        </p>
      </div>

      <SystemTestRunner />
      <PerformanceProfiler />
    </div>
  );
};
