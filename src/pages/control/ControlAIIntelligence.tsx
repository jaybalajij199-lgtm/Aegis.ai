import React, { useState, useEffect, useMemo } from 'react';
import { useAegisStore } from '../../store/useAegisStore';
import { EmergencyRequest } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  runGeminiTriage,
  queryGeminiCopilot,
  runDamagePrediction,
  AITriageResult
} from '../../ai/geminiClient';
import { calculateAIPriorityScore } from '../../ai/priorityEngine';
import { generateScarcityForecast } from '../../ai/resourceOptimizer';
import {
  Sparkles,
  Cpu,
  BrainCircuit,
  Sliders,
  Send,
  Radio,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Waves,
  ShieldCheck,
  Zap,
  Boxes,
  Users,
  Bot,
  Truck,
  RotateCcw,
  ArrowRight
} from 'lucide-react';

export const ControlAIIntelligence: React.FC = () => {
  const { emergencies, resources, allocateResources, assignRescueMission } = useAegisStore();

  // Active / pending emergencies sorted by priority score descending
  const activePendingEmergencies = useMemo(() => {
    return (emergencies || [])
      .filter((e) => e.status !== 'RESOLVED' && e.status !== 'COMPLETED')
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }, [emergencies]);

  const topPriorityRequest = activePendingEmergencies[0] || null;

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // 1. Triage Simulator & Editable Bench State
  const [simText, setSimText] = useState('');
  const [simLocation, setSimLocation] = useState('');
  const [simPeople, setSimPeople] = useState(250);
  const [simInjured, setSimInjured] = useState(12);
  const [simChildren, setSimChildren] = useState(40);
  const [simSeniors, setSimSeniors] = useState(30);
  const [simWaterShortage, setSimWaterShortage] = useState(true);
  const [simFoodShortage, setSimFoodShortage] = useState(true);
  const [simRoadAccess, setSimRoadAccess] = useState(false);
  const [simDisasterType, setSimDisasterType] = useState('FLOOD');

  // 2. Editable Resource Allocation State for Rescue Batch
  const [allocBoats, setAllocBoats] = useState(6);
  const [allocWaterPacks, setAllocWaterPacks] = useState(1500);
  const [allocFoodKits, setAllocFoodKits] = useState(1000);
  const [allocMedicalKits, setAllocMedicalKits] = useState(250);
  const [allocPersonnel, setAllocPersonnel] = useState(20);
  const [allocRelays, setAllocRelays] = useState(4);

  const [triageLoading, setTriageLoading] = useState(false);
  const [aiTriageResult, setAiTriageResult] = useState<AITriageResult | null>(null);
  const [deploySuccessMsg, setDeploySuccessMsg] = useState<string>('');
  const [isDeploying, setIsDeploying] = useState(false);

  // Auto-populate when top priority request is detected or changed
  const loadRequestIntoBench = (req: EmergencyRequest) => {
    setSelectedRequestId(req.id);
    setSimText(req.description || '');
    setSimLocation(req.location?.address || `${req.location?.district || 'Sector 1'}`);
    setSimPeople(req.peopleAffected || 100);
    setSimInjured(req.injuredCount || 0);
    setSimChildren(req.childrenCount || 0);
    setSimSeniors(req.seniorCount || 0);
    setSimWaterShortage(req.hasWaterShortage ?? true);
    setSimFoodShortage(req.hasFoodShortage ?? true);
    setSimRoadAccess(req.roadAccessAvailable ?? false);
    setSimDisasterType(req.disasterType || 'FLOOD');

    // Auto calculate recommended editable resource defaults based on request parameters
    const people = req.peopleAffected || 100;
    const injured = req.injuredCount || 0;
    setAllocBoats(Math.max(2, Math.round(people / 150)));
    setAllocWaterPacks(people * 3);
    setAllocFoodKits(people * 2);
    setAllocMedicalKits(Math.max(50, injured * 5));
    setAllocPersonnel(Math.max(10, Math.round(people / 50)));
    setAllocRelays(4);
    setDeploySuccessMsg('');
  };

  useEffect(() => {
    // Automatically pick top priority request if available and not selected
    if (topPriorityRequest) {
      if (!selectedRequestId || !activePendingEmergencies.some((e) => e.id === selectedRequestId)) {
        loadRequestIntoBench(topPriorityRequest);
      }
    }
  }, [topPriorityRequest, activePendingEmergencies, selectedRequestId]);

  // Deterministic 100-pt calculation for visual breakdown
  const deterministicAnalysis = calculateAIPriorityScore({
    id: selectedRequestId || 'SIM-01',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reporterName: 'Operator Sim',
    reporterPhone: '0000',
    reporterRole: 'CONTROL_ROOM',
    disasterType: simDisasterType as any,
    peopleAffected: simPeople,
    injuredCount: simInjured,
    childrenCount: simChildren,
    seniorCount: simSeniors,
    hasFoodShortage: simFoodShortage,
    hasWaterShortage: simWaterShortage,
    roadAccessAvailable: simRoadAccess,
    description: simText,
    location: {
      lat: 20.4625,
      lng: 85.8828,
      address: simLocation,
      district: 'Cuttack District',
      state: 'Odisha'
    },
    status: 'PENDING',
    waitingTimeMinutes: 15
  });

  // Predictive Inundation State
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [rainfallMm, setRainfallMm] = useState(180);
  const [riverLevel, setRiverLevel] = useState(3.8);
  const [predictLoading, setPredictLoading] = useState(false);
  const [predictResult, setPredictResult] = useState<{
    inundationRiskPercent: number;
    evacuationUrgency: string;
    forecast24h: string;
    depletionWarning: string;
  } | null>(null);

  // Copilot Chat State
  const [copilotMessages, setCopilotMessages] = useState<
    Array<{ id: string; sender: 'user' | 'copilot'; text: string; timestamp: string }>
  >([
    {
      id: 'c-1',
      sender: 'copilot',
      text: 'AEGIS AI Copilot online. I am connected to the live database, ready to assist with triage analysis, resource tuning, and dispatching rescue batches.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);

  // Scarcity forecast data
  const scarcity = generateScarcityForecast(resources);

  const handleRunAiTriage = async () => {
    setTriageLoading(true);
    const res = await runGeminiTriage(simText, simLocation, simPeople, simInjured);
    setAiTriageResult(res);
    setTriageLoading(false);
  };

  const handleRunPredict = async () => {
    setPredictLoading(true);
    const res = await runDamagePrediction(selectedDistrict, rainfallMm, riverLevel);
    setPredictResult(res);
    setPredictLoading(false);
  };

  const handleCopilotSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || copilotInput;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user' as const,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setCopilotMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setCopilotInput('');
    setCopilotLoading(true);

    const reply = await queryGeminiCopilot(
      textToSend,
      `Current Emergencies: ${(emergencies || []).length} active. Critical: ${(emergencies || []).filter(e => e.priorityClassification === 'CRITICAL').length}. Top Priority: ${topPriorityRequest ? topPriorityRequest.id : 'None'}.`,
      selectedRequestId || (topPriorityRequest ? topPriorityRequest.id : undefined)
    );

    const botMsg = {
      id: `bot-${Date.now()}`,
      sender: 'copilot' as const,
      text: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setCopilotMessages((prev) => [...prev, botMsg]);
    setCopilotLoading(false);
  };

  // Deploy Rescue Batch Execution
  const handleDeployRescueBatch = async () => {
    if (!selectedRequestId) return;
    setIsDeploying(true);

    try {
      // 1. Commit edited allocated resources
      await allocateResources(
        selectedRequestId,
        [
          {
            resourceId: 'res_1',
            resourceName: 'Potable Water Packs (5L)',
            quantityRecommended: allocWaterPacks,
            quantityAllocated: allocWaterPacks,
            unit: 'packs',
            reason: `Triage dispatch: ${allocWaterPacks} packs committed`
          },
          {
            resourceId: 'res_2',
            resourceName: 'Emergency Meal Ration Kits',
            quantityRecommended: allocFoodKits,
            quantityAllocated: allocFoodKits,
            unit: 'kits',
            reason: `Triage dispatch: ${allocFoodKits} kits committed`
          },
          {
            resourceId: 'res_3',
            resourceName: 'Trauma & First-Aid Medical Kits',
            quantityRecommended: allocMedicalKits,
            quantityAllocated: allocMedicalKits,
            unit: 'kits',
            reason: `Medical response: ${allocMedicalKits} kits committed`
          },
          {
            resourceId: 'res_4',
            resourceName: 'Motorized Inflatable Rescue Boats',
            quantityRecommended: allocBoats,
            quantityAllocated: allocBoats,
            unit: 'boats',
            reason: `Waterborne evacuation capacity: ${allocBoats * 35} evac/hr`
          }
        ],
        'AEGIS AI Operations Room'
      );

      // 2. Assign Rescue Mission & Field Squad in Database
      const teamName = `NDRF Rapid Squad ${Math.floor(1 + Math.random() * 9)} (Cuttack Fleet)`;
      await assignRescueMission(
        selectedRequestId,
        teamName,
        'Inspector Sanjeev Das',
        '+91 94370 12345',
        `${allocBoats}x Motorized Speedboats + ${allocRelays}x Mesh Relays`,
        allocPersonnel
      );

      setDeploySuccessMsg(
        `✅ RESCUE BATCH DISPATCHED SUCCESSFULLY! Incident [${selectedRequestId}] updated in database. Mission assigned to ${teamName} with ${allocBoats} boats, ${allocWaterPacks} water packs & ${allocPersonnel} rescuers.`
      );

      // 3. Auto select next top priority request after 2.5s
      setTimeout(() => {
        const nextTop = activePendingEmergencies.find((e) => e.id !== selectedRequestId);
        if (nextTop) {
          loadRequestIntoBench(nextTop);
        }
      }, 2500);
    } catch (err: any) {
      console.error('Failed to deploy rescue batch:', err);
    } finally {
      setIsDeploying(false);
    }
  };

  // Live real-time resource outcome calculations
  const evacCapacityPerHour = allocBoats * 35;
  const foodCoverageDays = simPeople > 0 ? (allocFoodKits / (simPeople * 2)).toFixed(1) : '1.0';
  const medicalCoverage = Math.min(100, Math.round((allocMedicalKits / Math.max(1, simInjured * 5)) * 100));
  const survivalIndex = Math.min(
    99,
    Math.round(35 + Math.min(30, (evacCapacityPerHour * 12 / Math.max(1, simPeople)) * 25) + Math.min(20, Number(foodCoverageDays) * 8) + medicalCoverage * 0.15)
  );

  return (
    <div className="space-y-6 pb-12 font-sans text-xs">
      {/* Title & Engine Header Banner */}
      <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 font-mono">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-300 font-bold flex items-center">
              <Sparkles className="h-3.5 w-3.5 mr-1 text-blue-600" />
              AEGIS AI 3.6 FLASH • AUTOMATED AI TRIAGE & RESCUE BATCH DISPATCH
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold">
              LIVE MONGODB CONNECTED
            </span>
          </div>

          <h1 className="text-2xl font-black font-heading text-slate-900">
            AEGIS AI Intelligence & Predictive Operations Command
          </h1>
          <p className="text-xs text-slate-600 font-mono">
            Automatic Priority Ingest • XAI Triage Matrix • Interactive Resource Tuning • Live Rescue Batch Deployment
          </p>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs">
          <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] text-slate-600 block uppercase">Top Priority Request</span>
            <strong className="text-red-600 text-sm font-bold">
              {topPriorityRequest ? `${topPriorityRequest.id} (${topPriorityRequest.priorityScore} pts)` : 'None'}
            </strong>
          </div>
          <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] text-slate-600 block uppercase">Pending Incidents</span>
            <strong className="text-emerald-700 text-sm font-bold">{activePendingEmergencies.length} Incidents</strong>
          </div>
        </div>
      </div>

      {/* Auto Priority Banner Selector */}
      <Card variant="glass" className="p-4 border-slate-200 bg-white space-y-3 font-mono">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 uppercase flex items-center">
                Automated Top Priority Request Selection:
              </span>
              <p className="text-xs text-blue-700 font-sans mt-0.5">
                {topPriorityRequest
                  ? `[${topPriorityRequest.id}] Score ${topPriorityRequest.priorityScore}/100 • ${topPriorityRequest.location.district} (${topPriorityRequest.peopleAffected} affected)`
                  : 'No pending emergency requests in queue.'}
              </p>
            </div>
          </div>

          {/* Request Dropdown Selector */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <label className="text-[10px] text-slate-600 shrink-0 uppercase font-bold">Select Request:</label>
            <select
              value={selectedRequestId || ''}
              onChange={(e) => {
                const target = activePendingEmergencies.find((req) => req.id === e.target.value);
                if (target) loadRequestIntoBench(target);
              }}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500 w-full md:w-64"
            >
              {activePendingEmergencies.map((e, idx) => (
                <option key={e.id} value={e.id}>
                  {idx === 0 ? '🔥 TOP: ' : ''}{e.id} - Score {e.priorityScore} ({e.location.district})
                </option>
              ))}
            </select>
            {topPriorityRequest && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadRequestIntoBench(topPriorityRequest)}
                className="border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-bold shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reload Top
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Grid: Triage Testing Bench & Explainable Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Interactive AI Triage Testing Bench */}
        <Card variant="glass" className="p-5 border-slate-200 bg-white space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h3 className="font-bold text-sm text-slate-900 font-heading flex items-center space-x-2">
              <BrainCircuit className="h-4 w-4 text-blue-600" />
              <span>Interactive AI Triage Testing Bench</span>
            </h3>
            <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold">
              ID: {selectedRequestId || 'BENCH'}
            </span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-600 uppercase font-bold">Quick Incident Presets:</span>
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
              {topPriorityRequest && (
                <button
                  type="button"
                  onClick={() => loadRequestIntoBench(topPriorityRequest)}
                  className="px-2.5 py-1 rounded bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 font-bold"
                >
                  🚨 LOAD REAL TOP PRIORITY ({topPriorityRequest.id})
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setSimText('Inundated ICU unit in Cuttack district hospital. 45 patients on ventilator backup generators failing in 2 hours.');
                  setSimLocation('Cuttack District Hospital Sector 4');
                  setSimPeople(120);
                  setSimInjured(45);
                  setSimChildren(15);
                  setSimSeniors(30);
                  setSimWaterShortage(true);
                  setSimFoodShortage(false);
                  setSimRoadAccess(false);
                }}
                className="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-blue-500 font-medium"
              >
                🏥 Inundated ICU Unit
              </button>
              <button
                type="button"
                onClick={() => {
                  setSimText('School rooftop collapse in Jobra embankment breach. 300 children stranded with no drinking water.');
                  setSimLocation('Jobra High School Rooftop');
                  setSimPeople(300);
                  setSimInjured(8);
                  setSimChildren(280);
                  setSimSeniors(10);
                  setSimWaterShortage(true);
                  setSimFoodShortage(true);
                  setSimRoadAccess(false);
                }}
                className="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-amber-500 font-medium"
              >
                🏫 Stranded Rooftop School
              </button>
            </div>
          </div>

          {/* Incident Input Parameters */}
          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Citizen Emergency Distress Text</label>
              <textarea
                rows={3}
                value={simText}
                onChange={(e) => setSimText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Address</label>
                <input
                  type="text"
                  value={simLocation}
                  onChange={(e) => setSimLocation(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-white border border-slate-300 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Affected Population</label>
                <input
                  type="number"
                  value={simPeople}
                  onChange={(e) => {
                    const p = Number(e.target.value);
                    setSimPeople(p);
                    setAllocWaterPacks(p * 3);
                    setAllocFoodKits(p * 2);
                  }}
                  className="w-full px-3 py-1.5 rounded bg-white border border-slate-300 text-slate-900 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Injured Count</label>
                <input
                  type="number"
                  value={simInjured}
                  onChange={(e) => {
                    const inj = Number(e.target.value);
                    setSimInjured(inj);
                    setAllocMedicalKits(Math.max(50, inj * 5));
                  }}
                  className="w-full px-3 py-1.5 rounded bg-white border border-slate-300 text-red-600 font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Children</label>
                <input
                  type="number"
                  value={simChildren}
                  onChange={(e) => setSimChildren(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded bg-white border border-slate-300 text-amber-700 font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Seniors</label>
                <input
                  type="number"
                  value={simSeniors}
                  onChange={(e) => setSimSeniors(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded bg-white border border-slate-300 text-blue-700 font-bold"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
              <label className="flex items-center space-x-1.5 cursor-pointer bg-slate-50 p-2 rounded border border-slate-200">
                <input
                  type="checkbox"
                  checked={simWaterShortage}
                  onChange={(e) => setSimWaterShortage(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="text-slate-700 font-medium">Water Depleted</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer bg-slate-50 p-2 rounded border border-slate-200">
                <input
                  type="checkbox"
                  checked={simFoodShortage}
                  onChange={(e) => setSimFoodShortage(e.target.checked)}
                  className="rounded text-amber-600"
                />
                <span className="text-slate-700 font-medium">Food Shortage</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer bg-slate-50 p-2 rounded border border-slate-200">
                <input
                  type="checkbox"
                  checked={!simRoadAccess}
                  onChange={(e) => setSimRoadAccess(!e.target.checked)}
                  className="rounded text-purple-600"
                />
                <span className="text-slate-700 font-medium">Road Submerged</span>
              </label>
            </div>

            <Button
              variant="primary"
              onClick={handleRunAiTriage}
              disabled={triageLoading}
              className="w-full font-bold bg-blue-600 hover:bg-blue-700 text-white py-2.5"
            >
              <Cpu className="h-4 w-4 mr-1.5" />
              {triageLoading ? 'Processing AEGIS AI 3.6 Flash Evaluation...' : 'RUN AEGIS AI 3.6 TRIAGE EVALUATION'}
            </Button>
          </div>
        </Card>

        {/* Right: Explainable Score Breakdown */}
        <Card variant="glass" className="p-5 border-slate-200 bg-white space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-heading">
                100-Point AI Score Breakdown & Factor Weights
              </h3>
              <p className="text-[10px] text-slate-600">Deterministic XAI explainability engine</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-blue-700 font-heading">
                {deterministicAnalysis.score} / 100
              </span>
              <span className="block text-[10px] font-bold text-red-600 uppercase">
                {deterministicAnalysis.classification} PRIORITY
              </span>
            </div>
          </div>

          {/* Factor Bars */}
          <div className="space-y-3">
            {deterministicAnalysis.factors.map((f, idx) => {
              const percent = Math.round((f.pointsEarned / f.maxPoints) * 100);

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-800 font-bold">{f.factorName} (Max {f.maxPoints} pts)</span>
                    <span className="text-blue-700 font-bold">{f.pointsEarned} pts ({percent}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all ${
                        percent > 75 ? 'bg-red-500' : percent > 40 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-600">{f.description}</p>
                </div>
              );
            })}
          </div>

          {/* AI Structured Summary Box */}
          {aiTriageResult && (
            <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 space-y-2">
              <div className="flex items-center justify-between border-b border-blue-200 pb-1.5">
                <span className="font-bold text-blue-800 flex items-center">
                  <Sparkles className="h-3.5 w-3.5 mr-1 text-blue-600" />
                  AEGIS AI Structured Summary
                </span>
                <span className="text-[10px] text-emerald-700 font-bold">{aiTriageResult.disasterType}</span>
              </div>
              <p className="text-slate-800 text-xs">{aiTriageResult.summary}</p>
              <div className="bg-white p-2 rounded border border-slate-200 text-amber-800 font-bold text-[11px]">
                👉 Protocol Directive: {aiTriageResult.suggestedAction}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Editable Resource Package Allocation & Rescue Batch Deployment Panel */}
      <Card variant="glass" className="p-5 border-slate-200 bg-white space-y-4 font-mono text-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-heading uppercase tracking-wide">
                Option to Edit Allocated Resources & Deploy Rescue Batch
              </h3>
              <p className="text-[10px] text-slate-600">
                Customize supply quantities, preview survival coverage, and commit dispatch directly to MongoDB
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-300">
            Calculated Survival Index: {survivalIndex}% OPTIMAL
          </span>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          {/* 1. Motorized Speedboats */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-slate-800 font-bold">
              <span>🚤 Inflatable Speedboats:</span>
              <span className="text-blue-700 font-bold">{allocBoats} Units</span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              value={allocBoats}
              onChange={(e) => setAllocBoats(Number(e.target.value))}
              className="w-full accent-blue-600 bg-slate-200 rounded h-2 cursor-pointer"
            />
            <p className="text-[10px] text-slate-600">Evacuation Speed: {evacCapacityPerHour} evacuees/hour</p>
          </div>

          {/* 2. Potable Water Packs */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-slate-800 font-bold">
              <span>🚰 Potable Water Packs (5L):</span>
              <span className="text-blue-700 font-bold">{allocWaterPacks.toLocaleString()} Packs</span>
            </div>
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={allocWaterPacks}
              onChange={(e) => setAllocWaterPacks(Number(e.target.value))}
              className="w-full accent-blue-600 bg-slate-200 rounded h-2 cursor-pointer"
            />
            <p className="text-[10px] text-slate-600">Coverage: {(allocWaterPacks / Math.max(1, simPeople)).toFixed(1)} packs / citizen</p>
          </div>

          {/* 3. Emergency Food Kits */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-slate-800 font-bold">
              <span>🍱 Emergency Meal Ration Kits:</span>
              <span className="text-amber-700 font-bold">{allocFoodKits.toLocaleString()} Kits</span>
            </div>
            <input
              type="range"
              min="100"
              max="8000"
              step="100"
              value={allocFoodKits}
              onChange={(e) => setAllocFoodKits(Number(e.target.value))}
              className="w-full accent-amber-600 bg-slate-200 rounded h-2 cursor-pointer"
            />
            <p className="text-[10px] text-slate-600">Ration Duration: {foodCoverageDays} Days</p>
          </div>

          {/* 4. Trauma Medical Kits */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-slate-800 font-bold">
              <span>🩺 Trauma & Medical First-Aid Kits:</span>
              <span className="text-emerald-700 font-bold">{allocMedicalKits} Kits</span>
            </div>
            <input
              type="range"
              min="20"
              max="2000"
              step="20"
              value={allocMedicalKits}
              onChange={(e) => setAllocMedicalKits(Number(e.target.value))}
              className="w-full accent-emerald-600 bg-slate-200 rounded h-2 cursor-pointer"
            />
            <p className="text-[10px] text-slate-600">Medical Preparedness: {medicalCoverage}%</p>
          </div>

          {/* 5. NDRF Field Personnel */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-slate-800 font-bold">
              <span>👨‍🚒 NDRF Rescuer Squad Personnel:</span>
              <span className="text-purple-700 font-bold">{allocPersonnel} Rescuers</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={allocPersonnel}
              onChange={(e) => setAllocPersonnel(Number(e.target.value))}
              className="w-full accent-purple-600 bg-slate-200 rounded h-2 cursor-pointer"
            />
            <p className="text-[10px] text-slate-600">Squad size: {Math.ceil(allocPersonnel / 5)} sub-teams</p>
          </div>

          {/* 6. Satellite Relays */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-slate-800 font-bold">
              <span>📡 Satellite / Mesh Comm Relays:</span>
              <span className="text-blue-700 font-bold">{allocRelays} Units</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={allocRelays}
              onChange={(e) => setAllocRelays(Number(e.target.value))}
              className="w-full accent-blue-600 bg-slate-200 rounded h-2 cursor-pointer"
            />
            <p className="text-[10px] text-slate-600">Coverage radius: {allocRelays * 3} km² mesh network</p>
          </div>
        </div>

        {/* Deploy Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-700">
            Ready to dispatch batch for request <strong className="text-blue-700">{selectedRequestId}</strong>. Updates database status & creates NDRF mission.
          </p>

          <Button
            variant="primary"
            onClick={handleDeployRescueBatch}
            disabled={isDeploying || !selectedRequestId}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 text-sm shadow-md"
          >
            <Truck className={`h-5 w-5 mr-2 ${isDeploying ? 'animate-bounce' : ''}`} />
            {isDeploying ? 'COMMITTING TO MONGODB...' : 'DEPLOY RESCUE BATCH NOW'}
          </Button>
        </div>

        {/* Deploy Success Banner */}
        {deploySuccessMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold font-mono flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{deploySuccessMsg}</span>
          </div>
        )}
      </Card>

      {/* Second Section: Predictive Flood Inundation & Supply Depletion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
        {/* Left: Flood Inundation Predictor */}
        <Card variant="glass" className="p-5 border-slate-200 bg-white space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h3 className="font-bold text-sm text-slate-900 font-heading flex items-center space-x-2">
              <Waves className="h-4 w-4 text-blue-600" />
              <span>Predictive Flood Inundation Engine</span>
            </h3>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              HYDROLOGICAL LINK
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Target District</label>
              <input
                type="text"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                placeholder="e.g. Khordha"
                className="w-full px-2.5 py-2 rounded bg-white border border-slate-300 text-slate-900 font-bold placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Rainfall (mm)</label>
              <input
                type="number"
                value={rainfallMm}
                onChange={(e) => setRainfallMm(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded bg-white border border-slate-300 text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">River Level (m)</label>
              <input
                type="number"
                step="0.1"
                value={riverLevel}
                onChange={(e) => setRiverLevel(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded bg-white border border-slate-300 text-blue-700 font-bold"
              />
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleRunPredict}
            disabled={predictLoading}
            className="w-full font-bold border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            {predictLoading ? 'Computing Hydrological Models...' : 'CALCULATE 24-HOUR INUNDATION FORECAST'}
          </Button>

          {predictResult && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-600">Calculated Inundation Risk:</span>
                <span className="text-xl font-black text-red-600">
                  {predictResult.inundationRiskPercent}% Risk
                </span>
              </div>
              <p className="text-slate-800 text-xs">
                <strong>24h Forecast:</strong> {predictResult.forecast24h}
              </p>
              <p className="text-amber-800 text-xs bg-amber-50 p-2 rounded border border-amber-200">
                ⚠️ <strong>Depletion Warning:</strong> {predictResult.depletionWarning}
              </p>
            </div>
          )}
        </Card>

        {/* Right: Supply Depletion Curve */}
        <Card variant="glass" className="p-5 border-slate-200 bg-white space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h3 className="font-bold text-sm text-slate-900 font-heading flex items-center space-x-2">
              <Boxes className="h-4 w-4 text-amber-600" />
              <span>24-Hour National Scarcity Depletion Curves</span>
            </h3>
            <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              STOCK DEPLETION ~{scarcity.waterExhaustionHours}h
            </span>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-600 text-[10px] block uppercase font-bold">
                Potable Water Rations (Regional Depot 01)
              </span>
              <div className="flex justify-between items-center">
                <strong className="text-slate-900 text-base">4,500 Packs Remaining</strong>
                <span className="text-red-600 font-bold">Depletes in ~18 Hours</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-200">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-600 text-[10px] block uppercase font-bold">
                Ready-to-Eat Emergency Food Packs
              </span>
              <div className="flex justify-between items-center">
                <strong className="text-slate-900 text-base">6,000 Kits Remaining</strong>
                <span className="text-emerald-700 font-bold">Depletes in ~32 Hours</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-200">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-blue-800">
              <p className="font-bold text-[11px]">AI Replenishment Recommendation:</p>
              <p className="text-[11px] mt-0.5 leading-relaxed">{scarcity.recommendationText}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Third Section: AEGIS AI Tactical Disaster Copilot Chat Console */}
      <Card variant="glass" className="p-5 border-slate-200 bg-white space-y-4 font-mono text-xs">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-heading">
                Tactical AEGIS AI Disaster Command Copilot
              </h3>
              <p className="text-[10px] text-slate-600">
                Real-time disaster guidance, bulletin drafting, and tactical logistics assistant
              </p>
            </div>
          </div>

          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-bold flex items-center">
            <Radio className="h-3 w-3 mr-1 animate-pulse text-emerald-600" />
            ONLINE
          </span>
        </div>

        {/* Quick Prompts */}
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          <span className="text-slate-600 font-bold self-center mr-1">Quick Prompts:</span>
          <button
            onClick={() => handleCopilotSend('Draft official press bulletin for the currently active top priority flood incident.')}
            className="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 hover:border-blue-500 text-slate-700 hover:text-slate-900"
          >
            📢 Press Bulletin Draft
          </button>
          <button
            onClick={() => handleCopilotSend('Please allocate resources and generate a dispatch plan for the currently active incident.')}
            className="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 hover:border-amber-500 text-slate-700 hover:text-slate-900"
          >
            🚀 Auto-Batch Allocation
          </button>
          <button
            onClick={() => handleCopilotSend('Identify the nearest safe shelter with available capacity for 300 evacuees.')}
            className="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 hover:border-purple-500 text-slate-700 hover:text-slate-900"
          >
            🏕️ Shelter Capacity Check
          </button>
        </div>

        {/* Chat History Box */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 h-64 overflow-y-auto space-y-3">
          {copilotMessages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-2xl p-3 rounded-2xl space-y-1 ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none shadow-sm'
                }`}
              >
                <div className={`flex justify-between items-center text-[10px] space-x-4 border-b pb-1 ${m.sender === 'user' ? 'border-blue-500 text-blue-100' : 'border-slate-200 text-slate-500'}`}>
                  <span className="font-bold">
                    {m.sender === 'user' ? 'DISPATCHER OPERATOR' : 'AEGIS AI COPILOT'}
                  </span>
                  <span>{m.timestamp}</span>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
              </div>
            </div>
          ))}

          {copilotLoading && (
            <div className="flex items-center space-x-2 text-blue-600 font-mono text-xs">
              <Sparkles className="h-4 w-4 animate-spin" />
              <span>AEGIS AI Copilot is evaluating disaster telemetry...</span>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={copilotInput}
            onChange={(e) => setCopilotInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCopilotSend()}
            placeholder="Ask AEGIS AI Copilot for disaster protocols, logistical plans, or bulletin drafts..."
            className="flex-1 px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
          />
          <Button
            variant="primary"
            onClick={() => handleCopilotSend()}
            disabled={copilotLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
