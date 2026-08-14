import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  ShieldAlert,
  Activity,
  MapPin,
  Boxes,
  Users,
  Home,
  BarChart3,
  LogOut,
  Radio,
  Sparkles,
  ShieldCheck,
  Video,
  Mic
} from 'lucide-react';
import { useAegisStore } from '../../store/useAegisStore';
import { UserHeaderProfile } from '../auth/UserHeaderProfile';
import { Button } from '../ui/Button';

export const ControlLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, emergencies, setUserRole } = useAegisStore();

  const criticalCount = emergencies.filter((e) => e.priorityClassification === 'CRITICAL').length;

  const navItems = [
    { path: '/control', label: 'Command Dashboard', icon: Activity },
    { path: '/control/queue', label: 'Emergency Queue', icon: ShieldAlert, badge: emergencies.length },
    { path: '/control/map', label: 'Disaster Map GIS', icon: MapPin },
    { path: '/control/recon', label: 'Voice SOS Tactical Recon & Voice Mesh Relays', icon: Mic, badge: 'WOW' },
    { path: '/control/resources', label: 'Supply & Forecast', icon: Boxes },
    { path: '/control/missions', label: 'Field Missions', icon: Users },
    { path: '/control/shelters', label: 'Shelters & Hospitals', icon: Home },
    { path: '/control/analytics', label: 'National Analytics', icon: BarChart3 },
    { path: '/control/ai', label: 'AI Intelligence', icon: Sparkles, badge: 'AI' },
    { path: '/control/testing', label: 'Testing & Performance', icon: ShieldCheck, badge: 'TEST' }
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 flex flex-col font-sans">
      {/* Top Mission Control Header */}
      <header className="glass-nav sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <ShieldAlert className="h-5 w-5 text-white stroke-[2.5]" />
            </div>
            <span className="font-heading font-black text-lg tracking-wider text-slate-900">
              AEGIS<span className="text-blue-600">.AI</span>
            </span>
          </Link>
          <span className="hidden sm:inline-block text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-bold">
            MISSION CONTROL CENTER
          </span>
        </div>

        {/* Center Live Triage Alert Banner */}
        <div className="hidden md:flex items-center space-x-3 bg-white/90 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-mono">
          <Radio className="h-4 w-4 text-red-600 animate-pulse" />
          <span>Active Emergencies: <strong className="text-slate-900">{emergencies.length}</strong></span>
          <span className="text-slate-600">|</span>
          <span>Critical: <strong className="text-red-600">{criticalCount}</strong></span>
        </div>

        {/* Right User Actions */}
        <div className="flex items-center space-x-2.5">
          <UserHeaderProfile />
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-16 lg:w-60 bg-slate-50/80 border-r border-slate-200/80 p-3 flex flex-col justify-between shrink-0">
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50/80 text-blue-700 border border-blue-500/40 font-bold shadow-sm'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-600'}`} />
                    <span className="hidden lg:inline">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="hidden lg:inline-block px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-200 hidden lg:block text-[10px] font-mono text-slate-500">
            <p>AEGIS AI Engine v2.4</p>
            <p>National Emergency Operations</p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F4F7FB]">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
