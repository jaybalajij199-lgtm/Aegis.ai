import React, { useState } from 'react';
import { useAegisStore } from '../../store/useAegisStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  Truck,
  ArrowRightLeft,
  X,
  CheckCircle2,
  AlertCircle,
  Boxes
} from 'lucide-react';

interface DepotStockTransferModalProps {
  onClose: () => void;
}



export const DepotStockTransferModal: React.FC<DepotStockTransferModalProps> = ({ onClose }) => {
  const { resources, transferResourceDepot } = useAegisStore();

  const [selectedResourceId, setSelectedResourceId] = useState<string>(resources[0]?.id || '');
  const [targetDepot, setTargetDepot] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<number>(500);
  const [successMsg, setSuccessMsg] = useState<string>('');

  const selectedItem = resources.find((r) => r.id === selectedResourceId);

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    transferResourceDepot(selectedResourceId, targetDepot, transferAmount);

    setSuccessMsg(
      `Dispatched ${transferAmount.toLocaleString()} ${selectedItem.unit} of ${selectedItem.name} to ${targetDepot}. Truck freight scheduled.`
    );

    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50/80 backdrop-blur-md flex items-center justify-center p-4">
      <Card variant="glass" className="w-full max-w-lg p-5 border-blue-200 space-y-4 relative font-sans text-xs">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-600 hover:text-white p-1 rounded-lg bg-white border border-slate-200"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center space-x-3 border-b border-slate-200 pb-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-blue-600 font-mono font-bold uppercase">INTER-DEPOT LOGISTICS FREIGHT</span>
            <h2 className="text-sm font-bold text-white font-heading">
              Transfer Warehouse Inventory
            </h2>
          </div>
        </div>

        {successMsg ? (
          <div className="p-4 bg-green-50/80 border border-green-500/50 rounded-xl text-emerald-200 font-mono text-center space-y-2">
            <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto" />
            <p className="font-bold">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleTransfer} className="space-y-4 font-mono">
            {/* Select Resource Item */}
            <div className="space-y-1">
              <label className="text-slate-700 font-bold text-[11px]">Source Inventory Item:</label>
              <select
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-white text-xs focus:ring-2 focus:ring-blue-500"
              >
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.warehouseLocation}) - {r.remainingStock.toLocaleString()} {r.unit} available
                  </option>
                ))}
              </select>
            </div>

            {selectedItem && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-600">Current Depot:</span>
                  <strong className="text-white">{selectedItem.warehouseLocation}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Available Remaining Stock:</span>
                  <strong className="text-blue-700 font-bold">{selectedItem.remainingStock.toLocaleString()} {selectedItem.unit}</strong>
                </div>
              </div>
            )}

            {/* Destination Depot */}
            <div className="space-y-1">
              <label className="text-slate-700 font-bold text-[11px]">Target Destination Depot:</label>
              <input
                type="text"
                value={targetDepot}
                onChange={(e) => setTargetDepot(e.target.value)}
                placeholder="e.g. Relief Hub 01"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-white text-xs focus:ring-2 focus:ring-blue-500 placeholder-slate-600"
              />
            </div>

            {/* Transfer Quantity */}
            <div className="space-y-1">
              <label className="text-slate-700 font-bold text-[11px]">Transfer Quantity ({selectedItem?.unit || 'units'}):</label>
              <input
                type="number"
                min="1"
                max={selectedItem?.remainingStock || 10000}
                value={transferAmount}
                onChange={(e) => setTransferAmount(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-white font-bold text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-blue-600 hover:bg-blue-600 text-slate-950 font-bold text-xs"
              >
                <Truck className="h-4 w-4 mr-1.5" />
                Dispatch Transfer Truck
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};
