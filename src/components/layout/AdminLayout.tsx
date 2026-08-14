import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { KeyRound, ShieldAlert, Users, Radio, Activity, BarChart3 } from 'lucide-react';
import { UserHeaderProfile } from '../auth/UserHeaderProfile';

export const AdminLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/admin', label: 'RBAC & User Management', icon: KeyRound },
    { path: '/control', label: 'Mission Control Room', icon: Activity },
    { path: '/officer', label: 'Field Rescuer Command', icon: Users },
    { path: '/citizen', label: 'Citizen Emergency Portal', icon: Radio }
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="glass-nav sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b border-slate-200">
        <Link to="/admin" className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <KeyRound className="h-5 w-5 text-white stroke-[2.5]" />
          </div>
          <span className="font-heading font-black text-lg text-slate-900 tracking-wider">
            AEGIS<span className="text-green-600">.ADMIN</span>
          </span>
        </Link>

        <div className="flex items-center space-x-3">
          <UserHeaderProfile />
        </div>
      </header>

      {/* Sub Navigation Bar */}
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
                  ? 'bg-green-50 text-emerald-200 border border-green-500/40 font-bold'
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
