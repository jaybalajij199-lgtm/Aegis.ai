import React, { useState } from 'react';
import { useAegisStore } from '../../store/useAegisStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  HeartPulse,
  Users,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const CitizenProfile: React.FC = () => {
  const { currentUser, updateUserProfile } = useAegisStore();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [bloodGroup, setBloodGroup] = useState(currentUser?.bloodGroup || '');
  const [emergencyPhone, setEmergencyPhone] = useState(currentUser?.emergencyContactPhone || '');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [savedMsg, setSavedMsg] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(currentUser.id, {
      name,
      phone,
      bloodGroup,
      emergencyContactPhone: emergencyPhone
    });
    setSavedMsg('Emergency Medical ID & Profile Saved Successfully!');
    setTimeout(() => setSavedMsg(''), 4000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold font-heading text-slate-900">Citizen Emergency Profile & Medical ID</h1>
        <p className="text-xs text-slate-600 font-mono">
          Pre-registered identity & medical parameters auto-attached to SOS distress signals
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* User Identity Card */}
        <Card variant="glass" className="p-6 space-y-4 border-slate-200 bg-white text-xs font-mono shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200">
                <User className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-bold text-slate-900">{currentUser.name}</h2>
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold flex items-center">
                    <ShieldCheck className="h-3 w-3 mr-1 text-emerald-600" /> VERIFIED
                  </span>
                </div>
                <p className="text-slate-600">{currentUser.role} • {currentUser.assignedDistrict || 'Regional'} Sector</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 font-sans">
            <div>
              <label className="block font-mono text-slate-700 font-bold mb-1 text-[11px]">Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-mono text-slate-700 font-bold mb-1 text-[11px]">Mobile Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </Card>

        {/* Emergency Medical ID Card */}
        <Card variant="glass" className="p-6 space-y-4 border-slate-200 bg-white text-xs font-mono shadow-sm">
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
            <HeartPulse className="h-5 w-5 text-red-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase">Emergency Medical ID & Kin Contacts</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
            <div>
              <label className="block font-mono text-slate-700 font-bold mb-1 text-[11px]">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="O+">O Positive (O+)</option>
                <option value="O-">O Negative (O-)</option>
                <option value="A+">A Positive (A+)</option>
                <option value="A-">A Negative (A-)</option>
                <option value="B+">B Positive (B+)</option>
                <option value="B-">B Negative (B-)</option>
                <option value="AB+">AB Positive (AB+)</option>
                <option value="AB-">AB Negative (AB-)</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-slate-700 font-bold mb-1 text-[11px]">Next-of-Kin SOS Emergency Contact</label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="font-sans">
            <label className="block font-mono text-slate-700 font-bold mb-1 text-[11px]">
              Chronic Medical Conditions / Allergies / Mobility Needs
            </label>
            <textarea
              rows={2}
              value={medicalNotes}
              onChange={(e) => setMedicalNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {savedMsg && (
            <p className="text-xs font-mono text-emerald-700 font-bold flex items-center pt-1">
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> {savedMsg}
            </p>
          )}

          <div className="pt-2 flex justify-end">
            <Button variant="primary" type="submit" className="font-mono text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white">
              <Save className="h-4 w-4 mr-1.5" /> SAVE EMERGENCY PROFILE
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};
