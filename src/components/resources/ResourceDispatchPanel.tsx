import React, { useState, useEffect } from 'react';
import { useAegisStore } from '../../store/useAegisStore';
import { generateResourceProposal } from '../../ai/resourceOptimizer';
import { ResourceRequirement, EmergencyRequest } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Boxes,
  Truck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  X
} from 'lucide-react';

interface ResourceDispatchPanelProps {
  onClose?: () => void;
  preselectedRequestId?: string;
}

export const ResourceDispatchPanel: React.FC<ResourceDispatchPanelProps> = ({
  onClose,
  preselectedRequestId
}) => {
  const { emergencies, resources, currentUser, allocateResources } = useAegisStore();

  const activeEmergencies = emergencies.filter(
    (e) => e.status !== 'COMPLETED' && e.status !== 'RESOLVED'
  );

  const [selectedReqId, setSelectedReqId] = useState<string>(
    preselectedRequestId || (activeEmergencies[0]?.id || '')
  );

  const selectedReq = emergencies.find((e) => e.id === selectedReqId);

  // Proposal state
  const [proposals, setProposals] = useState<ResourceRequirement[]>([]);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    if (selectedReq) {
      const generated = generateResourceProposal(selectedReq, resources);
      setProposals(generated);
    }
  }, [selectedReqId, selectedReq, resources]);

  const handleQuantityChange = (resourceId: string, val: number) => {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.resourceId === resourceId) {
          return { ...p, quantityAllocated: Math.max(0, val) };
        }
        return p;
      })
    );
  };

  const handleConfirmDispatch = () => {
    if (!selectedReq) return;
    const filteredProposals = proposals.filter((p) => p.quantityAllocated > 0);

    allocateResources(selectedReq.id, filteredProposals, currentUser.name);

    setSuccessMsg(
      `Successfully dispatched ${filteredProposals.length} supply categories to ${selectedReq.id} (${selectedReq.location.district}). Stock updated in central inventory.`
    );

    setTimeout(() => {
      setSuccessMsg('');
      if (onClose) onClose();
    }, 2200);
  };

  if (!selectedReq) {
    return (
      <Card variant="glass" className="p-6 text-center space-y-3 font-mono text-xs">
        <AlertTriangle className="h-6 w-6 text-amber-600 mx-auto" />
        <p className="text-slate-700">No active disaster incidents available for resource dispatch.</p>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </Card>
    );
  }

  return (
    <Card variant="glass" className="p-5 border-blue-200 space-y-5 font-sans text-xs shadow-2xl relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-600 hover:text-white p-1 rounded-lg bg-white border border-slate-200"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Header */}
      <div className="flex items-center space-x-3 border-b border-slate-200 pb-3">
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
          <Truck className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2 font-mono text-[10px]">
            <span className="text-blue-600 font-bold uppercase">AEGIS SMART ALLOCATION MATRIX</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-600">DISPATCH CONSOLE</span>
          </div>
          <h2 className="text-sm font-bold text-white font-heading">
            Target Incident Supply Dispatch
          </h2>
        </div>
      </div>

      {successMsg ? (
        <div className="p-4 bg-green-50/80 border border-green-500/50 rounded-xl text-emerald-200 font-mono space-y-2 text-center animate-fadeIn">
          <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto" />
          <p className="font-bold text-xs">{successMsg}</p>
        </div>
      ) : (
        <>
          {/* Target Emergency Selector */}
          <div className="space-y-1.5 font-mono">
            <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
              <span>Select Incident Request:</span>
              <span className="text-blue-600 text-[10px]">{activeEmergencies.length} Active Hotspots</span>
            </label>
            <select
              value={selectedReqId}
              onChange={(e) => setSelectedReqId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-white font-mono text-xs focus:ring-2 focus:ring-blue-500"
            >
              {activeEmergencies.map((e) => (
                <option key={e.id} value={e.id}>
                  [{e.id}] {e.location.district} - {e.disasterType} ({e.peopleAffected} affected, {e.priorityClassification})
                </option>
              ))}
            </select>
          </div>

          {/* Incident Context Overview */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[11px]">
            <div>
              <span className="text-slate-500 block text-[10px]">Priority Level</span>
              <Badge priority={selectedReq.priorityClassification}>
                {selectedReq.priorityClassification} ({selectedReq.priorityScore}/100)
              </Badge>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">People Affected</span>
              <strong className="text-white">{selectedReq.peopleAffected} citizens</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Injured Casualties</span>
              <strong className="text-rose-400">{selectedReq.injuredCount} reported</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Road Access</span>
              <span className={selectedReq.roadAccessAvailable ? 'text-green-600 font-bold' : 'text-rose-400 font-bold'}>
                {selectedReq.roadAccessAvailable ? 'ACCESSIBLE' : 'SEVERED (WATERBORNE)'}
              </span>
            </div>
          </div>

          {/* AI Recommended Supply Allocation Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>AI Recommended Allocation vs Dispatch Quantity:</span>
              </span>
              <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                GEMINI 3.6 MATRIX
              </span>
            </div>

            <div className="space-y-2.5">
              {proposals.map((prop) => {
                const matchedInventory = resources.find((r) => r.id === prop.resourceId);
                const remaining = matchedInventory ? matchedInventory.remainingStock : 0;
                const isOverStock = prop.quantityAllocated > remaining;

                return (
                  <div
                    key={prop.resourceId}
                    className="p-3 bg-white/80 rounded-xl border border-slate-200 space-y-2 hover:border-slate-200 transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-white text-xs">{prop.resourceName}</div>
                        <div className="text-[10px] text-slate-600 font-mono">
                          Warehouse Stock: <span className="text-blue-700 font-bold">{remaining.toLocaleString()} {prop.unit} remaining</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 font-mono">
                        <span className="text-[10px] text-slate-600">Rec: <strong className="text-amber-300">{prop.quantityRecommended}</strong></span>
                        <div className="flex items-center space-x-1 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                          <label className="text-[10px] text-slate-600 font-bold">Dispatch:</label>
                          <input
                            type="number"
                            min="0"
                            max={remaining}
                            value={prop.quantityAllocated}
                            onChange={(e) => handleQuantityChange(prop.resourceId, parseInt(e.target.value) || 0)}
                            className="w-20 bg-white text-blue-700 font-bold text-xs px-2 py-0.5 rounded border border-slate-200 focus:outline-none focus:border-blue-500"
                          />
                          <span className="text-[10px] text-slate-600">{prop.unit}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono border-t border-slate-200/80 pt-1.5 text-slate-600">
                      <span className="italic">"{prop.reason}"</span>
                      {isOverStock && (
                        <span className="text-rose-400 font-bold flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" /> Exceeds Depot Stock
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 font-mono">
            <span className="text-[10px] text-slate-600">
              Dispatches will immediately update central warehouse stock levels.
            </span>

            <div className="flex items-center space-x-2">
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
                  Cancel
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmDispatch}
                className="bg-blue-600 hover:bg-blue-600 text-slate-950 font-bold text-xs px-4 py-2"
              >
                <PackageCheck className="h-4 w-4 mr-1.5" />
                Confirm & Dispatch Supply Pack
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};
