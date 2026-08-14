import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAegisStore } from '../store/useAegisStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { UserRole } from '../types';
import {
  ShieldAlert,
  User,
  Mail,
  Phone,
  Lock,
  Building2,
  MapPin,
  BadgeCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Shield,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { registerNewUser } = useAegisStore();

  const [role, setRole] = useState<UserRole>('CITIZEN');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Role-specific fields
  const [assignedDistrict, setAssignedDistrict] = useState('Detecting District...');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [agencyName, setAgencyName] = useState('NDRF Battalion 03');
  const [stationAddress, setStationAddress] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [adminKey, setAdminKey] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
            const data = await res.json();
            if (data && data.address) {
              const detected = data.address.state_district || data.address.county || data.address.city || 'Regional Sector';
              setAssignedDistrict(detected);
            } else {
              setAssignedDistrict('Regional Sector');
            }
          } catch (e) {
            setAssignedDistrict('Regional Sector');
          }
        },
        () => {
          setAssignedDistrict('Regional Sector');
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setAssignedDistrict('Regional Sector');
    }
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (role === 'ADMIN' && adminKey.trim() !== 'AEGIS-MASTER-KEY-2026' && adminKey.trim() !== 'admin123') {
      setErrorMsg('Invalid System Admin Authorization Key. (Hint: AEGIS-MASTER-KEY-2026)');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const result = registerNewUser({
        name,
        email,
        phone: phone || '+91 90000 00000',
        password,
        role,
        assignedDistrict,
        badgeNumber: badgeNumber || (role === 'GOVERNMENT_OFFICER' ? `NDRF-${Math.floor(100+Math.random()*900)}` : undefined),
        agencyName: role === 'GOVERNMENT_OFFICER' ? agencyName : role === 'CONTROL_ROOM' ? 'State Disaster Management Authority' : undefined,
        stationAddress: stationAddress || undefined,
        bloodGroup: role === 'CITIZEN' ? bloodGroup : undefined,
        emergencyContactPhone: role === 'CITIZEN' ? emergencyContactPhone : undefined,
      });

      setIsSubmitting(false);

      if (result.success) {
        setSuccessMsg('Account created successfully! Redirecting to your emergency portal...');
        setTimeout(() => {
          if (role === 'CONTROL_ROOM') navigate('/control');
          else if (role === 'GOVERNMENT_OFFICER') navigate('/officer');
          else if (role === 'ADMIN') navigate('/admin');
          else navigate('/citizen');
        }, 1200);
      } else {
        setErrorMsg(result.message || 'Registration failed.');
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative">
      <Card variant="glass" className="max-w-2xl w-full p-6 sm:p-8 space-y-6 border-slate-200 bg-white shadow-xl my-8">
        <div className="text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm mx-auto">
            <ShieldAlert className="h-7 w-7 text-white stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black font-heading text-slate-900 tracking-wider">
            Register Account & Assign Role
          </h1>
          <p className="text-xs text-slate-600 font-mono">
            Create account with Role-Based Access Control (RBAC) permissions
          </p>
        </div>

        {/* Role Selector Cards */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-slate-700 block">Select Your Personnel Role:</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
            <button
              type="button"
              onClick={() => setRole('CITIZEN')}
              className={`p-3 rounded-xl border text-left transition-all ${
                role === 'CITIZEN'
                  ? 'bg-red-50 border-red-400 text-red-800 font-bold shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <p className="font-bold">Citizen</p>
              <p className="text-[10px] text-slate-500 font-sans mt-0.5">Victim & SOS</p>
            </button>

            <button
              type="button"
              onClick={() => setRole('GOVERNMENT_OFFICER')}
              className={`p-3 rounded-xl border text-left transition-all ${
                role === 'GOVERNMENT_OFFICER'
                  ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <p className="font-bold">NDRF Officer</p>
              <p className="text-[10px] text-slate-500 font-sans mt-0.5">Field Squad</p>
            </button>

            <button
              type="button"
              onClick={() => setRole('CONTROL_ROOM')}
              className={`p-3 rounded-xl border text-left transition-all ${
                role === 'CONTROL_ROOM'
                  ? 'bg-blue-50 border-blue-400 text-blue-800 font-bold shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <p className="font-bold">Control Room</p>
              <p className="text-[10px] text-slate-500 font-sans mt-0.5">GIS & Triage</p>
            </button>

            <button
              type="button"
              onClick={() => setRole('ADMIN')}
              className={`p-3 rounded-xl border text-left transition-all ${
                role === 'ADMIN'
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <p className="font-bold">Sys Admin</p>
              <p className="text-[10px] text-slate-500 font-sans mt-0.5">Security RBAC</p>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-xs font-sans">
          {/* Basic User Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-mono text-slate-700 font-bold block">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Subhashree Mahapatra"
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-mono text-slate-700 font-bold block">Official / Personal Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. subhashree@gmail.com"
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-mono text-slate-700 font-bold block">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-mono text-slate-700 font-bold block">Assigned / Home District</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={assignedDistrict}
                  onChange={(e) => setAssignedDistrict(e.target.value)}
                  placeholder="e.g. Cuttack District"
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Role Specific Fields */}
          {role === 'GOVERNMENT_OFFICER' && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
              <p className="font-mono text-xs font-bold text-amber-900 flex items-center">
                <BadgeCheck className="h-4 w-4 mr-1.5 text-amber-600" /> NDRF / ODRAF Official Credentials
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[11px] text-slate-700">Badge / Officer ID</label>
                  <input
                    type="text"
                    value={badgeNumber}
                    onChange={(e) => setBadgeNumber(e.target.value)}
                    placeholder="e.g. NDRF-309-K2"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="font-mono text-[11px] text-slate-700">Agency / Battalion Unit</label>
                  <input
                    type="text"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    placeholder="e.g. NDRF Battalion 03"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 placeholder-slate-400 text-xs mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {role === 'CITIZEN' && (
            <div className="p-4 bg-red-50 rounded-xl border border-red-200 space-y-3">
              <p className="font-mono text-xs font-bold text-red-900 flex items-center">
                <ShieldAlert className="h-4 w-4 mr-1.5 text-red-600" /> Citizen Emergency Profile
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[11px] text-slate-700">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 text-xs mt-1"
                  >
                    <option value="O+">O positive (O+)</option>
                    <option value="O-">O negative (O-)</option>
                    <option value="A+">A positive (A+)</option>
                    <option value="B+">B positive (B+)</option>
                    <option value="AB+">AB positive (AB+)</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono text-[11px] text-slate-700">Emergency Family Contact</label>
                  <input
                    type="text"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 text-xs mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {role === 'ADMIN' && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
              <p className="font-mono text-xs font-bold text-emerald-900 flex items-center">
                <KeyRound className="h-4 w-4 mr-1.5 text-emerald-600" /> Master Authorization Key
              </p>
              <input
                type="password"
                required
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter Authorization Key (Hint: AEGIS-MASTER-KEY-2026)"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs"
              />
            </div>
          )}

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="font-mono text-slate-700 font-bold block">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-8 py-2 text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-mono text-slate-700 font-bold block">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-8 py-2 text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            className="w-full py-3 text-sm font-bold mt-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? 'Registering Account...' : 'Create Account & Enter Portal'}
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs font-mono">
          <span className="text-slate-600">Already registered?</span>
          <Link to="/login" className="text-blue-700 hover:text-blue-800 font-bold flex items-center">
            Sign In Here <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </div>
      </Card>
    </div>
  );
};
