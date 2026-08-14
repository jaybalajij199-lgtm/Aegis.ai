import React, { useState } from 'react';
import { useAegisStore } from '../../store/useAegisStore';
import { ResourceDispatchPanel } from '../../components/resources/ResourceDispatchPanel';
import { DepotStockTransferModal } from '../../components/resources/DepotStockTransferModal';
import { NewInventoryModal } from '../../components/resources/NewInventoryModal';
import { generateResourceProposal } from '../../ai/resourceOptimizer';
import { ResourceCategory } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Boxes,
  Package,
  ShieldCheck,
  AlertCircle,
  Truck,
  Sparkles,
  PlusCircle,
  ArrowRightLeft,
  RefreshCw,
  Search,
  CheckCircle2,
  TrendingDown,
  Layers,
  Activity,
  Zap,
  PackageCheck
} from 'lucide-react';

export const ControlResourcePage: React.FC = () => {
  const { resources, emergencies, currentUser, allocateResources, reStockResource } = useAegisStore();

  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals state
  const [showDispatchPanel, setShowDispatchPanel] = useState<boolean>(false);
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [showNewInventoryModal, setShowNewInventoryModal] = useState<boolean>(false);
  const [aiOptimizing, setAiOptimizing] = useState<boolean>(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string>('');

  // Filtering
  const filteredResources = resources.filter((item) => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.warehouseLocation.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Analytics Metrics
  const totalStockSum = resources.reduce((acc, r) => acc + r.totalStock, 0);
  const allocatedStockSum = resources.reduce((acc, r) => acc + r.allocatedStock, 0);
  const remainingStockSum = resources.reduce((acc, r) => acc + r.remainingStock, 0);
  const percentAllocated = totalStockSum > 0 ? Math.round((allocatedStockSum / totalStockSum) * 100) : 0;
  const criticalCount = resources.filter((r) => r.status === 'CRITICAL').length;

  // AI Auto-Optimization for all pending/prioritized incidents
  const handleAiAutoOptimizeAll = () => {
    setAiOptimizing(true);
    setAiSuccessMsg('');

    setTimeout(() => {
      const pendingReqs = emergencies.filter(
        (e) => e.status === 'AI_PRIORITIZED' || e.status === 'VERIFIED' || e.status === 'PENDING'
      );

      let totalAssigned = 0;
      pendingReqs.forEach((req) => {
        const proposals = generateResourceProposal(req, resources);
        allocateResources(req.id, proposals, 'AEGIS Gemini 3.6 Flash Engine');
        totalAssigned += 1;
      });

      setAiOptimizing(false);
      setAiSuccessMsg(
        `Gemini AI Auto-Optimization executed! Dispatched optimal supply matrix to ${totalAssigned} active flood hotspots.`
      );

      setTimeout(() => setAiSuccessMsg(''), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* Top Banner & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2 font-mono text-blue-600 text-[11px] mb-1">
            <Boxes className="h-3.5 w-3.5 text-blue-600" />
            <span className="font-bold uppercase tracking-wider">NATIONAL DISASTER LOGISTICS & RESOURCE MATRIX</span>
          </div>
          <h1 className="text-2xl font-black font-heading text-slate-900">
            Resource Allocation & Depot Logistics
          </h1>
          <p className="text-xs text-slate-600 font-mono">
            Depot inventory, depletion curves, AI supply proposals, and freight dispatch
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 font-mono">
          <Button
            variant="primary"
            size="sm"
            onClick={handleAiAutoOptimizeAll}
            disabled={aiOptimizing}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 shadow-sm"
          >
            <Sparkles className={`h-4 w-4 mr-1.5 ${aiOptimizing ? 'animate-spin' : ''}`} />
            {aiOptimizing ? 'Running Gemini AI...' : 'AI Auto-Optimize All'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDispatchPanel(!showDispatchPanel)}
            className="border-blue-300 text-blue-700 hover:bg-blue-50 text-xs font-bold"
          >
            <PackageCheck className="h-4 w-4 mr-1.5" /> Dispatch Incident Pack
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTransferModal(true)}
            className="border-slate-200 text-slate-800 hover:bg-slate-50 text-xs font-bold"
          >
            <ArrowRightLeft className="h-4 w-4 mr-1.5" /> Depot Freight Transfer
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewInventoryModal(true)}
            className="border-slate-200 text-slate-800 hover:bg-slate-50 text-xs font-bold"
          >
            <PlusCircle className="h-4 w-4 mr-1.5" /> Log Shipment
          </Button>
        </div>
      </div>

      {/* AI Success Banner */}
      {aiSuccessMsg && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 font-mono text-center font-bold flex items-center justify-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-blue-600" />
          <span>{aiSuccessMsg}</span>
        </div>
      )}

      {/* KPI Overview Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <Card variant="glass" className="p-4 border-slate-200 space-y-1 bg-white">
          <div className="flex justify-between items-center text-slate-600 text-[10px] uppercase font-bold">
            <span>Total Registered Stock</span>
            <Boxes className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-heading">
            {totalStockSum.toLocaleString()} <span className="text-xs font-normal text-slate-600">units</span>
          </div>
          <p className="text-[10px] text-blue-700 font-bold">
            6 Regional Warehouse Depots
          </p>
        </Card>

        <Card variant="glass" className="p-4 border-slate-200 space-y-1 bg-white">
          <div className="flex justify-between items-center text-slate-600 text-[10px] uppercase font-bold">
            <span>Allocated Supplies</span>
            <Truck className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-heading">
            {allocatedStockSum.toLocaleString()} <span className="text-xs font-normal text-slate-600">units</span>
          </div>
          <p className="text-[10px] text-amber-700 font-bold">
            {percentAllocated}% of National Stock En Route
          </p>
        </Card>

        <Card variant="glass" className="p-4 border-slate-200 space-y-1 bg-white">
          <div className="flex justify-between items-center text-slate-600 text-[10px] uppercase font-bold">
            <span>Remaining Reserve</span>
            <Package className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-heading">
            {remainingStockSum.toLocaleString()} <span className="text-xs font-normal text-slate-600">units</span>
          </div>
          <p className="text-[10px] text-emerald-700 font-bold">
            Ready for Emergency Dispatch
          </p>
        </Card>

        <Card variant="glass" className="p-4 border-red-200 space-y-1 bg-red-50/20">
          <div className="flex justify-between items-center text-slate-600 text-[10px] uppercase font-bold">
            <span>Critical Depot Warnings</span>
            <AlertCircle className="h-4 w-4 text-red-600 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-red-600 font-heading">
            {criticalCount} <span className="text-xs font-normal text-slate-600">items</span>
          </div>
          <p className="text-[10px] text-red-700 font-bold">
            Re-stocking Required (&lt;25% stock)
          </p>
        </Card>
      </div>

      {/* Interactive Resource Dispatch Panel Drawer */}
      {showDispatchPanel && (
        <ResourceDispatchPanel onClose={() => setShowDispatchPanel(false)} />
      )}

      {/* Warehouse Inventory Section with Category Filters & Re-Stock */}
      <Card variant="glass" className="p-5 space-y-4 border-slate-200 font-mono text-xs bg-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <Boxes className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-sm font-heading text-slate-900">
              Regional Depot Stock Inventory Matrix
            </h3>
          </div>

          {/* Search Input & Category Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search item or depot..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-blue-500 w-44"
              />
            </div>

            <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-lg border border-slate-200 text-[10px]">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-2 py-1 rounded font-bold ${selectedCategory === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                ALL
              </button>
              <button
                onClick={() => setSelectedCategory('WATER_FOOD')}
                className={`px-2 py-1 rounded font-bold ${selectedCategory === 'WATER_FOOD' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                WATER/FOOD
              </button>
              <button
                onClick={() => setSelectedCategory('MEDICAL_SUPPLIES')}
                className={`px-2 py-1 rounded font-bold ${selectedCategory === 'MEDICAL_SUPPLIES' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                MEDICAL
              </button>
              <button
                onClick={() => setSelectedCategory('VEHICLES_BOATS')}
                className={`px-2 py-1 rounded font-bold ${selectedCategory === 'VEHICLES_BOATS' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                BOATS
              </button>
              <button
                onClick={() => setSelectedCategory('PERSONNEL_SQUADS')}
                className={`px-2 py-1 rounded font-bold ${selectedCategory === 'PERSONNEL_SQUADS' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                SQUADS
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] uppercase text-slate-600 bg-slate-50">
                <th className="p-3">Resource Item</th>
                <th className="p-3">Category</th>
                <th className="p-3">Depot Warehouse</th>
                <th className="p-3">Total Capacity</th>
                <th className="p-3">Allocated</th>
                <th className="p-3">Remaining Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Quick Re-Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 font-mono">
              {filteredResources.map((item) => {
                const percent = Math.round((item.remainingStock / item.totalStock) * 100);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 text-slate-800">
                    <td className="p-3 font-bold text-slate-900">
                      <div>{item.name}</div>
                      <div className="text-[10px] text-slate-500">{item.district}</div>
                    </td>
                    <td className="p-3 text-slate-600 text-[10px]">{item.category}</td>
                    <td className="p-3 text-slate-700">{item.warehouseLocation}</td>
                    <td className="p-3 font-bold">{item.totalStock.toLocaleString()} {item.unit}</td>
                    <td className="p-3 text-amber-700 font-bold">{item.allocatedStock.toLocaleString()} {item.unit}</td>
                    <td className="p-3 text-blue-700 font-bold">{item.remainingStock.toLocaleString()} {item.unit}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          percent < 25
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : percent < 50
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-green-50 text-emerald-700 border border-green-200'
                        }`}
                      >
                        {item.status} ({percent}%)
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => reStockResource(item.id, 500)}
                          className="px-2 py-0.5 bg-white hover:bg-slate-50 border border-slate-200 text-blue-700 rounded text-[10px] font-bold"
                          title="Add 500 units"
                        >
                          +500
                        </button>
                        <button
                          onClick={() => reStockResource(item.id, 2000)}
                          className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded text-[10px] font-bold"
                          title="Add 2,000 units"
                        >
                          +2,000
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Audit Log of Active Dispatches */}
      <Card variant="glass" className="p-5 space-y-3 border-slate-200 font-mono text-xs bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h3 className="font-bold text-sm text-slate-900 font-heading flex items-center space-x-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <span>Recent Incident Supply Dispatch Audit Trail</span>
          </h3>
          <span className="text-[10px] text-slate-600">Real-Time Ingestion Logs</span>
        </div>

        <div className="space-y-2">
          {emergencies
            .filter((e) => e.allocatedResources && e.allocatedResources.length > 0)
            .map((e) => (
              <div key={e.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-blue-700 text-xs">{e.id}</span>
                    <Badge variant={e.priorityClassification === 'CRITICAL' ? 'critical' : e.priorityClassification === 'HIGH' ? 'high' : 'medium'}>{e.priorityClassification}</Badge>
                    <span className="text-slate-600 text-[11px]">• {e.location.district}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 mt-1">
                    Dispatched Supplies:{' '}
                    <strong className="text-amber-800">
                      {e.allocatedResources?.map((r) => `${r.quantityAllocated} ${r.unit} ${r.resourceName}`).join(', ')}
                    </strong>
                  </p>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{new Date(e.updatedAt).toLocaleTimeString()}</span>
              </div>
            ))}
        </div>
      </Card>

      {/* Modals */}
      {showTransferModal && (
        <DepotStockTransferModal onClose={() => setShowTransferModal(false)} />
      )}

      {showNewInventoryModal && (
        <NewInventoryModal onClose={() => setShowNewInventoryModal(false)} />
      )}
    </div>
  );
};
