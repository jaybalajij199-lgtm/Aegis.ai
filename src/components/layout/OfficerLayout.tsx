import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { ShieldAlert, Users, FileText, Activity, Package, UserCheck, Radio, Signal } from 'lucide-react';
import { useAegisStore } from '../../store/useAegisStore';
import { UserHeaderProfile } from '../auth/UserHeaderProfile';

export const OfficerLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAegisStore();

  const navItems = [
    { path: '/officer', label: 'Field Command Overview', icon: Activity },
    { path: '/officer/missions', label: 'Active Missions & Stepper', icon: Users },
    { path: '/officer/report', label: 'Transmit Telemetry Log', icon: FileText },
    { path: '/officer/resources', label: 'Squad Equipment & Stocks', icon: Package }
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="glass-nav sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <Link to="/officer" className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Users className="h-5 w-5 text-white stroke-[2.5]" />
            </div>
            <span className="font-heading font-black text-lg text-slate-900">
              AEGIS<span className="text-amber-600">.NDRF</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-2 text-[10px] font-mono bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-300 text-amber-900">
            <Signal className="h-3 w-3 text-green-600 animate-pulse" />
            <span>TACTICAL FREQ: 142.85 MHz • SATELLITE LINK ACTIVE</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <UserHeaderProfile />
        </div>
      </header>

      {/* Navigation Sub-bar */}
      <nav className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center space-x-2 overflow-x-auto text-xs font-mono">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-50 text-amber-200 border border-amber-500/40 font-bold'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full">
        {children || <Outlet />}
      </main>
    </div>
  );
};

