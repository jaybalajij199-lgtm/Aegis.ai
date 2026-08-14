import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAegisStore } from '../store/useAegisStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldAlert, Play, CheckCircle2, RotateCcw, ArrowRight, Activity, Users, Boxes } from 'lucide-react';

export const DemoPage: React.FC = () => {
  const navigate = useNavigate();
  const { demoStepIndex, triggerDemoScenarioNextStep, resetAllData, emergencies, missions } = useAegisStore();

  const steps = [
    {
      title: 'Initial State: Baseline Monitoring',
      desc: 'AEGIS AI actively ingesting GPS feeds across Odisha districts.'
    },
    {
      title: 'Step 1: Ingest Critical Flood SOS from Tangi-Choudwar',
      desc: 'Simulates 1,500 villagers trapped on rooftops due to embankment breach in Cuttack.'
    },
    {
      title: 'Step 2: AI Triage Engine & Supply Matrix',
      desc: 'Deterministically scores incident at 94/100 (CRITICAL) and generates relief pack.'
    },
    {
      title: 'Step 3: Dispatch NDRF Rescue Squad',
      desc: 'Deploys 4 speedboats and amphibious squad with ETA 12 minutes.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 p-6 max-w-4xl mx-auto space-y-6 font-sans">
      <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">Interactive Hackathon Simulation Runner</h1>
          <p className="text-xs text-slate-600 font-mono">End-to-End AEGIS AI Disaster Operations Walkthrough</p>
        </div>

        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={resetAllData} className="text-xs">
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/control')}>
            Open Mission Control
          </Button>
        </div>
      </div>

      <Card variant="glass" className="p-6 space-y-6 border-blue-200">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-blue-700">
            CURRENT DEMO STEP: {demoStepIndex} / 3
          </span>

          <Button
            variant="danger"
            size="md"
            onClick={triggerDemoScenarioNextStep}
            className="animate-pulse text-xs font-mono font-bold"
          >
            <Play className="h-4 w-4 mr-1.5 fill-current" />
            EXECUTE NEXT SIMULATION STEP ({demoStepIndex + 1})
          </Button>
        </div>

        {/* Step Cards */}
        <div className="space-y-3 font-mono text-xs">
          {steps.map((st, idx) => {
            const isCompleted = demoStepIndex > idx;
            const isCurrent = demoStepIndex === idx;

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-blue-50/80 border-cyan-400 text-white shadow-sm'
                    : isCompleted
                    ? 'bg-white/60 border-slate-200 text-slate-600'
                    : 'bg-slate-50 border-slate-900 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                        isCurrent ? 'border-cyan-400 text-blue-600' : 'border-slate-200 text-slate-700'
                      }`}>
                        {idx}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-sm">{st.title}</p>
                      <p className="text-[11px] font-sans text-slate-700 mt-0.5">{st.desc}</p>
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded bg-blue-600 text-slate-950 font-black text-[10px] animate-pulse">
                      ACTIVE STEP
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs font-mono">
          <span className="text-slate-600">Emergencies: <strong className="text-white">{emergencies.length}</strong></span>
          <span className="text-slate-600">Missions: <strong className="text-green-600">{missions.length}</strong></span>
          <Button variant="primary" size="sm" onClick={() => navigate('/control')}>
            View Live in Mission Control <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
