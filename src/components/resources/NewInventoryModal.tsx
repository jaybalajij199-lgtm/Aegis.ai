import React, { useState } from 'react';
import { useAegisStore } from '../../store/useAegisStore';
import { ResourceCategory } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { PlusCircle, X, CheckCircle2, PackagePlus } from 'lucide-react';

interface NewInventoryModalProps {
  onClose: () => void;
}

export const NewInventoryModal: React.FC<NewInventoryModalProps> = ({ onClose }) => {
  const { addInventoryItem } = useAegisStore();

  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<ResourceCategory>('WATER_FOOD');
  const [totalStock, setTotalStock] = useState<number>(1000);
  const [unit, setUnit] = useState<string>('units');
  const [district, setDistrict] = useState<string>('');
  const [warehouseLocation, setWarehouseLocation] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addInventoryItem({
      name,
      category,
      totalStock,
      allocatedStock: 0,
      unit,
      district,
      warehouseLocation,
      status: 'OPTIMAL'
    });

    setSuccessMsg(`Logged new supply batch "${name}" into ${warehouseLocation}.`);

    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50/80 backdrop-blur-md flex items-center justify-center p-4 font-sans text-xs">
      <Card variant="glass" className="w-full max-w-lg p-5 border-blue-200 space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-600 hover:text-white p-1 rounded-lg bg-white border border-slate-200"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center space-x-3 border-b border-slate-200 pb-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
            <PackagePlus className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-blue-600 font-mono font-bold uppercase">SUPPLY INGESTION ENGINE</span>
            <h2 className="text-sm font-bold text-white font-heading">
              Register New Relief Supply Shipment
            </h2>
          </div>
        </div>

        {successMsg ? (
          <div className="p-4 bg-green-50/80 border border-green-500/50 rounded-xl text-emerald-200 font-mono text-center space-y-2">
            <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto" />
            <p className="font-bold">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 font-mono">
            <div>
              <label className="text-slate-700 font-bold text-[11px] block mb-1">Item Title / Brand:</label>
              <input
                type="text"
                required
                placeholder="e.g. Dehydration Oral Electrolyte Packets (500g)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-white text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 font-bold text-[11px] block mb-1">Category:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-white text-xs focus:ring-2 focus:ring-blue-500"
                >
                  <option value="WATER_FOOD">Water & Food Rations</option>
                  <option value="MEDICAL_SUPPLIES">Medical Supplies</option>
                  <option value="RESCUE_EQUIPMENT">Rescue Equipment</option>
                  <option value="VEHICLES_BOATS">Vehicles & Motorboats</option>
                  <option value="PERSONNEL_SQUADS">Rescuer Personnel</option>
                  <option value="SHELTER_KITS">Shelter Kits & Tents</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold text-[11px] block mb-1">Quantity Unit:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. packs, kits, units, personnel"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-white text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 font-bold text-[11px] block mb-1">Initial Total Stock:</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={totalStock}
                  onChange={(e) => setTotalStock(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-white text-xs focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold text-[11px] block mb-1">Warehouse Depot:</label>
                <input
                  type="text"
                  required
                  value={warehouseLocation}
                  onChange={(e) => setWarehouseLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-white text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-700 font-bold text-[11px] block mb-1">Target District:</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-white text-xs focus:ring-2 focus:ring-blue-500"
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
                <PlusCircle className="h-4 w-4 mr-1.5" />
                Ingest Inventory Shipment
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};
