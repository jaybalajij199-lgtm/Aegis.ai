import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAegisStore } from '../store/useAegisStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { UserRole } from '../types';
import {
  ShieldAlert,
  Users,
  Radio,
  ArrowRight,
  ArrowLeft,
  Home,
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Building2,
  Sparkles
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithCredentials } = useAegisStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fromRoute = (location.state as any)?.from?.pathname;

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await loginWithCredentials(email, password);
      setIsSubmitting(false);

      if (res.success && res.user) {
        const userRole = res.user.role;
        const defaultPortal = (
          userRole === 'ADMIN' ? '/admin' :
          userRole === 'CONTROL_ROOM' ? '/control' :
          userRole === 'GOVERNMENT_OFFICER' ? '/officer' :
          '/citizen'
        );

        // Check if fromRoute is valid for this specific user's role
        if (fromRoute && fromRoute !== '/' && fromRoute !== '/login' && fromRoute !== '/register') {
          const isAllowed = (
            (userRole === 'ADMIN') ||
            (userRole === 'CONTROL_ROOM' && fromRoute.startsWith('/control')) ||
            (userRole === 'GOVERNMENT_OFFICER' && fromRoute.startsWith('/officer')) ||
            (userRole === 'CITIZEN' && fromRoute.startsWith('/citizen'))
          );

          if (isAllowed) {
            navigate(fromRoute);
          } else {
            navigate(defaultPortal);
          }
        } else {
          navigate(defaultPortal);
        }
      } else {
        setErrorMessage(res.message || 'Authentication failed.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage('Server connection error. Please try again later.');
    }
  };

  const handleSelectPreset = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('password123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Back to Landing Page Link */}
      <div className="max-w-xl w-full mb-3 flex items-center justify-between z-10">
        <Link
          to="/"
          className="inline-flex items-center text-xs font-mono font-medium text-slate-600 hover:text-blue-600 bg-white/80 hover:bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-1.5 transition-all shadow-xs group"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5 transition-transform group-hover:-translate-x-1 text-slate-500 group-hover:text-blue-600" />
          <span>Back to Landing Page</span>
        </Link>
        <Link
          to="/"
          className="text-xs font-mono text-slate-500 hover:text-slate-800 flex items-center gap-1"
        >
          <Home className="h-3.5 w-3.5" />
          <span>AEGIS Home</span>
        </Link>
      </div>

      <Card variant="glass" className="max-w-xl w-full p-6 sm:p-8 space-y-6 border-slate-200 bg-white shadow-xl relative z-10">
        <div className="text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm mx-auto">
            <ShieldAlert className="h-7 w-7 text-white stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black font-heading text-slate-900 tracking-wider">
            AEGIS<span className="text-blue-600">.AI</span> Operations Security
          </h1>
          <p className="text-xs text-slate-600 font-mono">
            National Disaster Response & Role-Based Access Controller (RBAC)
          </p>
        </div>

        <form onSubmit={handleCredentialLogin} className="space-y-4 font-sans text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Persona Fill */}
          <div className="space-y-2 pb-1">
            <p className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
              Select Preset Role Account:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => handleSelectPreset('ananya.s@gmail.com')}
                className={`p-2 rounded-xl border text-center transition-all ${
                  email === 'ananya.s@gmail.com'
                    ? 'bg-rose-50 border-rose-400 text-rose-800 font-bold ring-1 ring-rose-400'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold text-[11px]">Citizen</div>
                <div className="text-[10px] text-slate-500 truncate">ananya.s@...</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('field.officer@ndrf.gov.in')}
                className={`p-2 rounded-xl border text-center transition-all ${
                  email === 'field.officer@ndrf.gov.in'
                    ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold ring-1 ring-amber-400'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold text-[11px]">Field Officer</div>
                <div className="text-[10px] text-slate-500 truncate">field.officer@...</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('control@aegis.gov.in')}
                className={`p-2 rounded-xl border text-center transition-all ${
                  email === 'control@aegis.gov.in'
                    ? 'bg-blue-50 border-blue-400 text-blue-800 font-bold ring-1 ring-blue-400'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold text-[11px]">Control Room</div>
                <div className="text-[10px] text-slate-500 truncate">control@...</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('admin@aegis.gov.in')}
                className={`p-2 rounded-xl border text-center transition-all ${
                  email === 'admin@aegis.gov.in'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold ring-1 ring-emerald-400'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold text-[11px]">Admin</div>
                <div className="text-[10px] text-slate-500 truncate">admin@...</div>
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-mono text-slate-700 font-bold block">Official Registered Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. control@aegis.gov.in"
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-mono text-slate-700 font-bold block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-10 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            className="w-full py-2.5 text-sm font-bold mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? 'Verifying Authorization...' : 'Authenticate & Sign In'}
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs font-mono">
          <span className="text-slate-600">Need a new account?</span>
          <Link to="/register" className="text-blue-700 hover:text-blue-800 font-bold flex items-center">
            Register New Role <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </div>
      </Card>
    </div>
  );
};
