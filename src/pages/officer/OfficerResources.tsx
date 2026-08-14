import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAegisStore } from '../../store/useAegisStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Package, Truck, ShieldAlert, CheckCircle2, PlusCircle, ArrowRight } from 'lucide-react';

export const OfficerResources: React.FC = () => {
  const navigate = useNavigate();
  const { resources } = useAegisStore();

  const [distributedLog, setDistributedLog] = useState<
    Array<{ id: string; item: string; qty: number; destination: string; timestamp: string }>
  >([
    {
      id: 'dist-1',
      item: resources[0]?.name || 'Potable Water Packs (5L)',
      qty: 120,
      destination: 'Chaudwar Housing Board Colony',
      timestamp: new Date(Date.now() - 30 * 60000).toLocaleTimeString()
    },
    {
      id: 'dist-2',
      item: resources[1]?.name || 'Emergency Meal Ration Kits',
      qty: 85,
      destination: 'Jobra Barrage Inundation Sector',
      timestamp: new Date(Date.now() - 60 * 60000).toLocaleTimeString()
    }
  ]);

  const [selectedResourceId, setSelectedResourceId] = useState(resources[0]?.id || '');
  const [newQty, setNewQty] = useState(50);
  const [newDest, setNewDest] = useState('Chaudwar Sector 3');
  const [successMsg, setSuccessMsg] = useState('');

  const handleDistributionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDest.trim()) return;

    const targetRes = resources.find((r) => r.id === selectedResourceId || r.name === selectedResourceId) || resources[0];
    const itemName = targetRes ? targetRes.name : 'Emergency Relief Supply';

    // Deduct stock in DB
    if (targetRes) {
      const newAllocated = targetRes.allocatedStock + newQty;
      const newRemaining = Math.max(0, targetRes.totalStock - newAllocated);
      const updatedItem = {
        ...targetRes,
        allocatedStock: newAllocated,
        remainingStock: newRemaining,
        lastUpdated: new Date().toISOString()
      };

      try {
        await fetch(`/api/inventory/${targetRes.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItem)
        });
      } catch (err) {
        console.error('Failed to update inventory:', err);
      }
    }

    setDistributedLog([
      {
        id: `dist-${Date.now()}`,
        item: itemName,
        qty: newQty,
        destination: newDest,
        timestamp: new Date().toLocaleTimeString()
      },
      ...distributedLog
    ]);

    setSuccessMsg(`Logged & subtracted ${newQty} ${itemName} for ${newDest} in DB`);
    setNewDest('');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 flex items-center space-x-2">
            <Package className="h-6 w-6 text-blue-600" />
            <span>Squad Equipment & Supply Ledger</span>
          </h1>
          <p className="text-xs text-slate-600 font-mono mt-0.5">
            NDRF Rapid Squad Alpha • Equipment inventory, distribution logs & HQ replenishment requests
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/officer')}
          className="text-xs font-mono border-slate-300 text-slate-800 hover:bg-slate-50"
        >
          Back to Field Command
        </Button>
      </div>

      {/* On-Board Inventory List */}
      <Card variant="glass" className="p-5 border-slate-200 bg-white space-y-4">
        <h3 className="font-bold text-sm font-heading text-slate-900 flex items-center space-x-2">
          <Truck className="h-4 w-4 text-blue-600" />
          <span>Squad Vehicles & Equipment Allocations</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
          {resources.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2"
            >
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.status === 'OPTIMAL'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : item.status === 'MODERATE'
                      ? 'bg-amber-50 text-amber-800 border border-amber-300'
                      : 'bg-red-50 text-red-800 border border-red-300'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-700">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Total</span>
                  <strong className="text-slate-900">{item.totalStock} {item.unit}</strong>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Allocated</span>
                  <strong className="text-amber-800">{item.allocatedStock} {item.unit}</strong>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Remaining</span>
                  <strong className="text-blue-700">{item.remainingStock} {item.unit}</strong>
                </div>
              </div>

              <p className="text-[10px] text-slate-600">Depot: {item.warehouseLocation}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Distribution Log Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
        <Card variant="glass" className="p-5 border-slate-200 bg-white space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h3 className="font-bold text-sm text-slate-900">Log Rations / Supply Distribution</h3>
            {successMsg && (
              <span className="text-[11px] text-emerald-700 font-bold animate-pulse">
                ✓ {successMsg}
              </span>
            )}
          </div>

          <form onSubmit={handleDistributionSubmit} className="space-y-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Resource Item</label>
              <select
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-bold"
              >
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} (Available: {r.remainingStock} {r.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Quantity Handed Out</label>
              <input
                type="number"
                min="1"
                value={newQty}
                onChange={(e) => setNewQty(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Target Sector / Destination</label>
              <input
                type="text"
                required
                value={newDest}
                onChange={(e) => setNewDest(e.target.value)}
                placeholder="e.g. Jobra Sector 12 Relief Point"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full font-bold bg-amber-600 hover:bg-amber-700 text-white">
              <PlusCircle className="h-4 w-4 mr-1.5" /> LOG DISTRIBUTION TO SATELLITE
            </Button>
          </form>
        </Card>

        {/* Recent Supply Distribution Ledger */}
        <Card variant="glass" className="p-5 border-slate-200 bg-white space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
            Field Distribution Log History
          </h3>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {distributedLog.map((log) => (
              <div
                key={log.id}
                className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-slate-900 text-xs">{log.item}</p>
                  <p className="text-[11px] text-slate-600">{log.destination}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                    +{log.qty} Units
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">{log.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
