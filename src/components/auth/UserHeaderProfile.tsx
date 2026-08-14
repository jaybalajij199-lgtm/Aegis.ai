import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAegisStore } from '../../store/useAegisStore';
import { UserRole } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  User,
  ShieldAlert,
  Users,
  Radio,
  LogOut,
  ChevronDown,
  CheckCircle2,
  Shield,
  KeyRound,
  Settings,
  Sparkles
} from 'lucide-react';

export const UserHeaderProfile: React.FC = () => {
  const { currentUser, setUserRole, logoutUser } = useAegisStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSwitch = (role: UserRole) => {
    setUserRole(role);
    setIsOpen(false);
    if (role === 'CONTROL_ROOM') navigate('/control');
    else if (role === 'GOVERNMENT_OFFICER') navigate('/officer');
    else if (role === 'CITIZEN') navigate('/citizen');
    else if (role === 'ADMIN') navigate('/admin');
  };

  const handleSignOut = () => {
    logoutUser();
    setIsOpen(false);
    navigate('/login');
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'CONTROL_ROOM':
        return 'info';
      case 'GOVERNMENT_OFFICER':
        return 'high';
      case 'CITIZEN':
        return 'critical';
      case 'ADMIN':
        return 'success';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-50/80 transition-all border border-transparent hover:border-slate-200/60 focus:outline-none"
      >
        <div className="relative">
          <div className="h-8 w-8 rounded-xl bg-blue-50/50 border border-blue-500/40 text-blue-700 flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
          {currentUser.isVerified && (
            <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-[8px] text-slate-950 font-black">
              ✓
            </span>
          )}
        </div>

        <div className="text-left hidden md:block">
          <p className="text-xs font-bold text-slate-900 flex items-center">
            {currentUser.name}
          </p>
          <div className="flex items-center space-x-1">
            <span className="text-[10px] font-mono text-slate-600 capitalize">
              {currentUser.role.replace('_', ' ').toLowerCase()}
            </span>
          </div>
        </div>

        <ChevronDown className={`h-4 w-4 text-slate-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/10 z-50 p-3 space-y-3 font-sans">
          {/* User Profile Header */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-slate-900 flex items-center">
                  {currentUser.name}
                  {currentUser.isVerified && (
                    <CheckCircle2 className="h-3.5 w-3.5 ml-1 text-green-600" title="Verified Account" />
                  )}
                </p>
                <p className="text-xs text-slate-600 truncate">{currentUser.email}</p>
              </div>
              <Badge variant={getRoleBadgeVariant(currentUser.role)}>
                {currentUser.role.replace('_', ' ')}
              </Badge>
            </div>

            {currentUser.agencyName && (
              <p className="text-[10px] font-mono text-blue-700 border-t border-slate-200 pt-1.5 mt-1 font-semibold">
                Agency: {currentUser.agencyName}
              </p>
            )}
            {currentUser.badgeNumber && (
              <p className="text-[10px] font-mono text-amber-700 font-semibold">
                Badge: {currentUser.badgeNumber}
              </p>
            )}
          </div>

          {/* Persona Quick Switcher */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider px-1">
              Switch Active Persona (RBAC)
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
              <button
                onClick={() => handleRoleSwitch('CONTROL_ROOM')}
                className={`p-2 rounded-lg border text-left transition-all ${
                  currentUser.role === 'CONTROL_ROOM'
                    ? 'bg-blue-50 border-blue-500 text-blue-800 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                }`}
              >
                Control Room
              </button>

              <button
                onClick={() => handleRoleSwitch('GOVERNMENT_OFFICER')}
                className={`p-2 rounded-lg border text-left transition-all ${
                  currentUser.role === 'GOVERNMENT_OFFICER'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                }`}
              >
                NDRF Officer
              </button>

              <button
                onClick={() => handleRoleSwitch('CITIZEN')}
                className={`p-2 rounded-lg border text-left transition-all ${
                  currentUser.role === 'CITIZEN'
                    ? 'bg-red-50 border-rose-500 text-rose-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                }`}
              >
                Citizen
              </button>

              <button
                onClick={() => handleRoleSwitch('ADMIN')}
                className={`p-2 rounded-lg border text-left transition-all ${
                  currentUser.role === 'ADMIN'
                    ? 'bg-green-50 border-green-500 text-emerald-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                }`}
              >
                Sys Admin
              </button>
            </div>
          </div>

          {/* Management & Navigation Links */}
          <div className="pt-2 border-t border-slate-200 space-y-1 text-xs font-mono">
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <KeyRound className="h-3.5 w-3.5 text-green-600" />
              <span>Admin Center & User RBAC</span>
            </Link>

            <Link
              to="/citizen/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <User className="h-3.5 w-3.5 text-blue-600" />
              <span>Profile & Security Settings</span>
            </Link>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors text-left font-semibold"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out Session</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
