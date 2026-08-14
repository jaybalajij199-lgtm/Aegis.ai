import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { ShieldAlert, Home, FileText, Radio, User, LogOut, Hospital } from 'lucide-react';
import { useAegisStore } from '../../store/useAegisStore';
import { Button } from '../ui/Button';

import { UserHeaderProfile } from '../auth/UserHeaderProfile';

export const CitizenLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAegisStore();

  const navItems = [
    { path: '/citizen', label: 'Home Dashboard', icon: Home },
    { path: '/citizen/sos', label: '1-Tap SOS', icon: ShieldAlert },
    { path: '/citizen/report', label: 'Report Incident', icon: FileText },
    { path: '/citizen/requests', label: 'My Requests', icon: Radio },
    { path: '/citizen/shelters', label: 'Relief Shelters', icon: Home },
    { path: '/citizen/hospitals', label: 'Hospitals', icon: Hospital },
    { path: '/citizen/profile', label: 'Profile', icon: User }
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="glass-nav sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b border-slate-200">
        <Link to="/citizen" className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <ShieldAlert className="h-5 w-5 text-white stroke-[2.5]" />
          </div>
          <span className="font-heading font-black text-lg text-slate-900">
            AEGIS<span className="text-red-600">.CITIZEN</span>
          </span>
        </Link>

        <div className="flex items-center space-x-3">
          <Button variant="danger" size="sm" onClick={() => navigate('/citizen/sos')} className="text-xs">
            <ShieldAlert className="h-3.5 w-3.5 mr-1" />
            1-TAP SOS
          </Button>

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
                  ? 'bg-red-50 text-red-200 border border-red-500/40 font-bold'
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
      <main className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto w-full">
        {children || <Outlet />}
      </main>
    </div>
  );
};
