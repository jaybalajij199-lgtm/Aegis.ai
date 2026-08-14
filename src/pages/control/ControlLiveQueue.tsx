import React from 'react';
import { useAegisStore } from '../../store/useAegisStore';
import { EmergencyQueue } from '../../components/emergency/EmergencyQueue';
import { ExplainableAIPanel } from '../../components/ai/ExplainableAIPanel';
import { ResourceAllocationSimulator } from '../../components/ai/ResourceAllocationSimulator';

export const ControlLiveQueue: React.FC = () => {
  const { emergencies, selectedEmergencyId, setSelectedEmergencyId } = useAegisStore();
  const selectedReq = emergencies.find((e) => e.id === selectedEmergencyId) || emergencies[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-slate-900">Emergency Triage Queue</h1>
        <p className="text-xs text-slate-600 font-mono">
          Deterministic 100-point priority sorted incident incoming stream
        </p>
      </div>

      <EmergencyQueue
        emergencies={emergencies}
        selectedId={selectedEmergencyId}
        onSelectEmergency={setSelectedEmergencyId}
      />

      {selectedReq && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExplainableAIPanel request={selectedReq} />
          <ResourceAllocationSimulator request={selectedReq} />
        </div>
      )}
    </div>
  );
};
