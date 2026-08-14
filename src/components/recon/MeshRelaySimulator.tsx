import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  Radio,
  WifiOff,
  Share2,
  CheckCircle2,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  RefreshCw
} from 'lucide-react';

interface MeshNode {
  id: string;
  name: string;
  type: 'CITIZEN' | 'BOAT' | 'DRONE' | 'BASE';
  battery: number;
  status: 'ONLINE' | 'TRANSMITTING' | 'SYNCED';
  distanceKm: number;
}

export const MeshRelaySimulator: React.FC = () => {
  const [nodes, setNodes] = useState<MeshNode[]>([
    { id: 'NODE_01', name: 'Citizen Mobile (No Cellular)', type: 'CITIZEN', battery: 64, status: 'ONLINE', distanceKm: 0 },
    { id: 'NODE_02', name: 'NDRF Boat Alpha-1 Relay', type: 'BOAT', battery: 92, status: 'ONLINE', distanceKm: 2.4 },
    { id: 'NODE_03', name: 'AEGIS Portable Cell Relay', type: 'RELAY', battery: 86, status: 'ONLINE', distanceKm: 5.8 },
    { id: 'NODE_04', name: 'Regional Control Base Station', type: 'BASE', battery: 100, status: 'ONLINE', distanceKm: 12.1 }
  ]);

  const [simulatingHop, setSimulatingHop] = useState<boolean>(false);
  const [currentHopIndex, setCurrentHopIndex] = useState<number>(-1);
  const [payloadText, setPayloadText] = useState<string>('SOS! Flood level 5ft. 4 people on roof. GPS: 20.4632N 85.8812E.');
  const [encryptedHex, setEncryptedHex] = useState<string>('0x7A99F3B1A002C98143FE1109');
  const [transferLog, setTransferLog] = useState<string[]>([]);

  const handleStartMeshRelay = () => {
    setSimulatingHop(true);
    setCurrentHopIndex(0);
    setTransferLog(['[LORA MESH] Initializing 868MHz frequency handshake...']);

    // Hop 1: Citizen to Boat
    setTimeout(() => {
      setCurrentHopIndex(1);
      setTransferLog((prev) => [
        ...prev,
        '• Hop 1: Packet received by NDRF Boat Alpha-1 (RSSI: -72 dBm, Latency: 42ms)'
      ]);
    }, 1000);

    // Hop 2: Boat to Relay
    setTimeout(() => {
      setCurrentHopIndex(2);
      setTransferLog((prev) => [
        ...prev,
        '• Hop 2: Packet relayed to AEGIS Portable Cell Relay (LoRaWAN Gateway, High-ground Placement)'
      ]);
    }, 2000);

    // Hop 3: Relay to Base Station
    setTimeout(() => {
      setCurrentHopIndex(3);
      setTransferLog((prev) => [
        ...prev,
        '• Hop 3: Payload decrypted at Base Station! Emergency Incident logged in Database.'
      ]);
      setSimulatingHop(false);
    }, 3000);
  };

  return (
    <Card variant="glass" className="p-5 border-blue-200 space-y-4 font-sans text-xs relative shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-green-50 text-green-600 rounded-xl border border-emerald-800">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2 font-mono text-[10px]">
              <span className="text-green-600 font-bold uppercase">ZERO-CELLULAR LORA & SATELLITE MESH RELAY</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-600">868MHz HYBRID PROTOCOL</span>
            </div>
            <h2 className="text-sm font-bold text-white font-heading">
              Offline Mesh Emergency SOS Transmission Simulator
            </h2>
          </div>
        </div>

        <span className="text-[10px] font-mono text-emerald-300 bg-green-50 px-2.5 py-1 rounded-full border border-emerald-800 font-bold flex items-center">
          <WifiOff className="h-3 w-3 mr-1 text-green-600" /> Works Without Internet / Cell Towers
        </span>
      </div>

      {/* Interactive Node Network Diagram */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 font-mono">
        <div className="text-slate-600 text-[11px] font-bold flex items-center justify-between">
          <span>Active Mesh Node Hop Topology:</span>
          <span className="text-blue-600 text-[10px]">AES-256 Encrypted Packet</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 relative">
          {nodes.map((node, idx) => {
            const isCurrentHop = currentHopIndex === idx;
            const isCompletedHop = currentHopIndex > idx;

            return (
              <div
                key={node.id}
                className={`p-3 rounded-xl border transition-all space-y-1 relative ${
                  isCurrentHop
                    ? 'bg-blue-50/90 border-cyan-400 scale-105 shadow-xl shadow-cyan-950 z-10 animate-pulse'
                    : isCompletedHop
                    ? 'bg-green-50/60 border-green-500/80 text-emerald-200'
                    : 'bg-white/80 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-600">{node.id}</span>
                  <span className="text-blue-700">{node.battery}% Bat</span>
                </div>
                <div className="font-bold text-white text-xs truncate">{node.name}</div>
                <div className="text-[10px] text-slate-600">Dist: {node.distanceKm} km</div>

                {isCurrentHop && (
                  <div className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 animate-bounce">
                    TRANSMITTING...
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Encrypted Binary Payload Display */}
        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 text-[11px]">
          <div className="flex items-center justify-between text-slate-600 text-[10px]">
            <span className="flex items-center"><Lock className="h-3 w-3 mr-1 text-blue-600" /> Payload Text:</span>
            <span className="text-slate-500 font-mono">Encrypted Hash: {encryptedHex}</span>
          </div>
          <p className="text-slate-800 font-bold">"{payloadText}"</p>
        </div>

        {/* Transmission Log */}
        {transferLog.length > 0 && (
          <div className="p-3 bg-white/90 rounded-xl border border-slate-200 space-y-1 text-[10px] text-blue-700 font-mono">
            {transferLog.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-1">
          <Button
            variant="primary"
            size="sm"
            onClick={handleStartMeshRelay}
            disabled={simulatingHop}
            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs px-4"
          >
            <Radio className={`h-4 w-4 mr-1.5 ${simulatingHop ? 'animate-spin' : ''}`} />
            {simulatingHop ? 'Relaying Packet Across Mesh Nodes...' : 'Transmit Offline LoRa Mesh SOS'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
