import React, { useMemo } from 'react';
import { Card } from '../ui/Card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAegisStore } from '../../store/useAegisStore';

export const ScarcityForecastChart: React.FC = () => {
  const { resources } = useAegisStore();

  const forecastData = useMemo(() => {
    // Find current stock percentage
    const getPercent = (cat: string) => {
      const items = (resources || []).filter(i => i.category === cat);
      if (items.length === 0) return 0;
      const total = items.reduce((acc, i) => acc + i.totalStock, 0);
      const remaining = items.reduce((acc, i) => acc + i.remainingStock, 0);
      return total > 0 ? Math.round((remaining / total) * 100) : 0;
    };

    const curWater = getPercent('WATER');
    const curFood = getPercent('FOOD');
    const curMed = getPercent('MEDICAL');

    return [
      { hour: '00:00', water: curWater, food: curFood, medical: curMed },
      { hour: '04:00', water: Math.max(0, curWater - 18), food: Math.max(0, curFood - 12), medical: Math.max(0, curMed - 10) },
      { hour: '08:00', water: Math.max(0, curWater - 39), food: Math.max(0, curFood - 28), medical: Math.max(0, curMed - 25) },
      { hour: '12:00', water: Math.max(0, curWater - 62), food: Math.max(0, curFood - 46), medical: Math.max(0, curMed - 37) },
      { hour: '16:00', water: Math.max(0, curWater - 82), food: Math.max(0, curFood - 68), medical: Math.max(0, curMed - 53) },
      { hour: '20:00', water: Math.max(0, curWater - 95), food: Math.max(0, curFood - 85), medical: Math.max(0, curMed - 67) },
      { hour: '24:00', water: 0, food: Math.max(0, curFood - 96), medical: Math.max(0, curMed - 83) },
    ];
  }, [resources]);

  return (
    <Card variant="glass" className="p-4 space-y-2">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
          24-Hour Resource Depletion Scarcity Forecast
        </h3>
        <span className="text-[10px] font-mono text-rose-400 bg-red-50/60 px-2 py-0.5 rounded border border-rose-800">
          Dynamic Forecast based on Live Stock
        </span>
      </div>
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="foodGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
            <YAxis stroke="#64748b" fontSize={10} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
            <Area type="monotone" dataKey="water" stroke="#06b6d4" fillOpacity={1} fill="url(#waterGrad)" name="Drinking Water (%)" />
            <Area type="monotone" dataKey="food" stroke="#f59e0b" fillOpacity={1} fill="url(#foodGrad)" name="Food Rations (%)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
