import React, { useState } from 'react';
import { useAegisStore } from '../../store/useAegisStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { UserRole, UserProfile } from '../../types';
import {
  User,
  KeyRound,
  Users,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Building2,
  Sliders,
  UserPlus,
  Radio,
  Lock,
  Unlock,
  Sparkles,
  RefreshCw,
  Database,
  Trash2,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    allUsers,
    currentUser,
    emergencies,
    missions,
    resources,
    shelters,
    hospitals,
    updateUserRole,
    toggleUserVerification,
    registerNewUser,
    clearAllIncidents,
    restoreDefaultDatasets
  } = useAegisStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [dbActionStatus, setDbActionStatus] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // New user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('GOVERNMENT_OFFICER');
  const [newAgency, setNewAgency] = useState('NDRF Battalion 03');
  const [newDistrict, setNewDistrict] = useState('');

  const handleClearIncidents = async () => {
    if (!window.confirm('Are you sure you want to delete all active emergencies and rescue missions? Datasets (Hospitals, Shelters, Inventory, Users) will be safely kept.')) {
      return;
    }
    setIsProcessing(true);
    await clearAllIncidents();
    setIsProcessing(false);
    setDbActionStatus('All live emergency incidents and dispatch missions cleared! Datasets preserved.');
    setTimeout(() => setDbActionStatus(null), 5000);
  };

  const handleRestoreDatasets = async () => {
    if (!window.confirm('Reset database back to the default curated Odisha disaster dataset?')) {
      return;
    }
    setIsProcessing(true);
    await restoreDefaultDatasets();
    setIsProcessing(false);
    setDbActionStatus('Default datasets and initial disaster baseline restored.');
    setTimeout(() => setDbActionStatus(null), 5000);
  };

  const filteredUsers = allUsers.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.agencyName && u.agencyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.badgeNumber && u.badgeNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    registerNewUser({
      name: newName,
      email: newEmail,
      phone: '+91 94370 00112',
      password: 'password123',
      role: newRole,
      agencyName: newAgency,
      assignedDistrict: newDistrict,
      isVerified: true
    });

    setNewName('');
    setNewEmail('');
    setShowAddUserModal(false);
  };

  const getRoleBadgeVariant = (r: UserRole) => {
    switch (r) {
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

  const permissionsMatrix = [
    {
      capability: '1-Tap SOS Emergency Distress Call',
      citizen: true,
      officer: true,
      control: true,
      admin: true
    },
    {
      capability: 'Submit Incident & Disaster Photos',
      citizen: true,
      officer: true,
      control: true,
      admin: true
    },
    {
      capability: 'View Live GIS Disaster Map & Inundation Layers',
      citizen: false,
      officer: true,
      control: true,
      admin: true
    },
    {
      capability: 'Execute AI Priority Triage & Score Calculations',
      citizen: false,
      officer: false,
      control: true,
      admin: true
    },
    {
      capability: 'Allocate Water, Food & Medical Supply Stock',
      citizen: false,
      officer: false,
      control: true,
      admin: true
    },
    {
      capability: 'Dispatch NDRF / ODRAF Rescue Squads',
      citizen: false,
      officer: false,
      control: true,
      admin: true
    },
    {
      capability: 'Update Field Mission Status & Telemetry Logs',
      citizen: false,
      officer: true,
      control: true,
      admin: true
    },
    {
      capability: 'Manage System Users & Security RBAC Policies',
      citizen: false,
      officer: false,
      control: false,
      admin: true
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <KeyRound className="h-6 w-6 text-green-600" />
            <h1 className="text-2xl font-black font-heading text-white">
              System Admin & RBAC Security Center
            </h1>
          </div>
          <p className="text-xs text-slate-600 font-mono mt-0.5">
            Role-Based Access Control, Personnel Verification & Global Permissions Matrix
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAddUserModal(!showAddUserModal)}
          className="text-xs"
        >
          <UserPlus className="h-4 w-4 mr-1.5" /> Provision New Officer
        </Button>
      </div>

      {/* Quick Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="glass" className="p-4 space-y-1 border-blue-200">
          <p className="text-[10px] font-mono text-blue-600 uppercase font-bold">Total Accounts</p>
          <p className="text-2xl font-black text-white">{allUsers.length}</p>
          <p className="text-[10px] text-slate-600">Registered System Users</p>
        </Card>

        <Card variant="glass" className="p-4 space-y-1 border-amber-200">
          <p className="text-[10px] font-mono text-amber-600 uppercase font-bold">NDRF Rescuers</p>
          <p className="text-2xl font-black text-amber-300">
            {allUsers.filter((u) => u.role === 'GOVERNMENT_OFFICER').length}
          </p>
          <p className="text-[10px] text-slate-600">Field Squad Leaders</p>
        </Card>

        <Card variant="glass" className="p-4 space-y-1 border-blue-500/30">
          <p className="text-[10px] font-mono text-blue-400 uppercase font-bold">Control Room</p>
          <p className="text-2xl font-black text-blue-300">
            {allUsers.filter((u) => u.role === 'CONTROL_ROOM').length}
          </p>
          <p className="text-[10px] text-slate-600">GIS & Triage Officers</p>
        </Card>

        <Card variant="glass" className="p-4 space-y-1 border-green-200">
          <p className="text-[10px] font-mono text-green-600 uppercase font-bold">Verified Officers</p>
          <p className="text-2xl font-black text-emerald-300">
            {allUsers.filter((u) => u.isVerified).length}
          </p>
          <p className="text-[10px] text-slate-600">Clearance Approved</p>
        </Card>
      </div>

      {/* Database & Dataset Lifecycle Controls */}
      <Card variant="glass" className="p-5 space-y-4 border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center">
              <Database className="h-4 w-4 mr-2 text-cyan-400" /> Database & Dataset Lifecycle Controls
            </h3>
            <p className="text-xs text-slate-600 font-sans mt-0.5">
              Clear dynamic disaster signals, purge test distress calls, or restore default regional datasets without dropping schemas.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700">
              Active SOS: <strong className="text-rose-400">{emergencies.length}</strong>
            </span>
            <span className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700">
              Missions: <strong className="text-blue-400">{missions.length}</strong>
            </span>
            <span className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700">
              Shelters: <strong className="text-emerald-400">{shelters.length}</strong>
            </span>
            <span className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700">
              Hospitals: <strong className="text-amber-400">{hospitals.length}</strong>
            </span>
          </div>
        </div>

        {dbActionStatus && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs font-mono text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{dbActionStatus}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white/40 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center space-x-2">
              <Trash2 className="h-4 w-4 text-rose-400" />
              <h4 className="text-xs font-bold font-mono text-slate-800 uppercase">Clear All Live Incidents (Keep Datasets)</h4>
            </div>
            <p className="text-xs text-slate-600">
              Deletes all ongoing citizen distress calls, SOS signals, and active rescue missions. Resets warehouse stock allocations to 0 while keeping hospitals, shelters, inventory items, and accounts intact.
            </p>
            <Button
              variant="outline"
              size="sm"
              disabled={isProcessing}
              onClick={handleClearIncidents}
              className="text-xs text-rose-400 border-rose-500/40 hover:bg-rose-500/10 w-full sm:w-auto"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Purge Live Incidents & Missions
            </Button>
          </div>

          <div className="p-4 bg-white/40 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center space-x-2">
              <RotateCcw className="h-4 w-4 text-cyan-400" />
              <h4 className="text-xs font-bold font-mono text-slate-800 uppercase">Restore Default Demo Datasets</h4>
            </div>
            <p className="text-xs text-slate-600">
              Resets and re-seeds the operational state with curated Odisha Mahanadi flood baseline datasets, NDRF squad locations, hospitals, and relief shelters.
            </p>
            <Button
              variant="outline"
              size="sm"
              disabled={isProcessing}
              onClick={handleRestoreDatasets}
              className="text-xs text-cyan-400 border-cyan-500/40 hover:bg-cyan-500/10 w-full sm:w-auto"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Restore Default Disaster Datasets
            </Button>
          </div>
        </div>
      </Card>

      {/* Add Officer Form Drawer */}
      {showAddUserModal && (
        <Card variant="glass" className="p-5 space-y-4 border-green-500/40 bg-green-50/20">
          <h3 className="text-sm font-bold font-mono text-emerald-300 uppercase flex items-center">
            <UserPlus className="h-4 w-4 mr-2" /> Provision New Government Officer / Control Room Account
          </h3>

          <form onSubmit={handleCreateUserSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-slate-700 font-mono block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Capt. Rajesh Mohanty"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-white"
              />
            </div>

            <div>
              <label className="text-slate-700 font-mono block mb-1">Official Email</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="officer.rajesh@ndrf.gov.in"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-white"
              />
            </div>

            <div>
              <label className="text-slate-700 font-mono block mb-1">Assigned Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-white"
              >
                <option value="GOVERNMENT_OFFICER">GOVERNMENT_OFFICER (NDRF)</option>
                <option value="CONTROL_ROOM">CONTROL_ROOM (SDMA)</option>
                <option value="CITIZEN">CITIZEN</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-700 font-mono block mb-1">Agency / Department</label>
              <input
                type="text"
                value={newAgency}
                onChange={(e) => setNewAgency(e.target.value)}
                placeholder="NDRF Battalion 03"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-white"
              />
            </div>

            <div className="flex items-end space-x-2">
              <Button type="submit" variant="primary" size="sm" className="w-full">
                Create & Verify User
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAddUserModal(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* User Directory & Role Assignment Section */}
      <Card variant="glass" className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
              System Personnel Directory & Role Switcher
            </h3>
            <p className="text-xs text-slate-600 font-sans">
              Modify active permissions, verify officer clearance, or promote user roles on the fly
            </p>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, email, agency..."
                className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-mono focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="CONTROL_ROOM">Control Room</option>
              <option value="GOVERNMENT_OFFICER">Field Officer</option>
              <option value="CITIZEN">Citizen</option>
              <option value="ADMIN">System Admin</option>
            </select>
          </div>
        </div>

        {/* Users Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-200 font-mono text-[11px] text-slate-600 uppercase">
                <th className="py-2 px-3">Personnel</th>
                <th className="py-2 px-3">Active Role</th>
                <th className="py-2 px-3">Agency / District</th>
                <th className="py-2 px-3">Verification</th>
                <th className="py-2 px-3 text-right">Actions (RBAC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {filteredUsers.map((usr) => (
                <tr key={usr.id} className="hover:bg-white/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="h-8 w-8 rounded-xl bg-blue-50/50 border border-blue-500/40 text-blue-700 overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 flex items-center">
                          {usr.name}
                          {usr.id === currentUser.id && (
                            <span className="ml-1.5 px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-mono text-[9px]">
                              YOU
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-slate-600 font-mono">{usr.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 font-mono">
                    <Badge variant={getRoleBadgeVariant(usr.role)}>
                      {usr.role.replace('_', ' ')}
                    </Badge>
                  </td>

                  <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                    <p>{usr.agencyName || 'Citizen User'}</p>
                    <p className="text-[10px] text-slate-500">{usr.assignedDistrict || 'Unassigned District'}</p>
                  </td>

                  <td className="py-3 px-3">
                    {usr.isVerified ? (
                      <span className="inline-flex items-center text-[10px] font-mono text-green-600 bg-green-50/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> VERIFIED
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-mono text-amber-600 bg-amber-50/60 border border-amber-800 px-2 py-0.5 rounded-full">
                        UNVERIFIED
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {/* Role Dropdown */}
                      <select
                        value={usr.role}
                        onChange={(e) => updateUserRole(usr.id, e.target.value as UserRole)}
                        className="bg-white border border-slate-200 text-slate-800 rounded px-2 py-1 text-[11px] font-mono focus:outline-none focus:border-blue-500"
                      >
                        <option value="CITIZEN">Role: CITIZEN</option>
                        <option value="GOVERNMENT_OFFICER">Role: OFFICER</option>
                        <option value="CONTROL_ROOM">Role: CONTROL</option>
                        <option value="ADMIN">Role: ADMIN</option>
                      </select>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleUserVerification(usr.id)}
                        className="text-[10px] font-mono py-1 px-2 text-slate-700"
                        title="Toggle Government Clearance Status"
                      >
                        {usr.isVerified ? 'Unverify' : 'Verify'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Role-Based Access Control (RBAC) Permissions Matrix Table */}
      <Card variant="glass" className="p-5 space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center">
            <Sliders className="h-4 w-4 mr-2 text-blue-600" /> System Capabilities Permission Matrix (RBAC)
          </h3>
          <p className="text-xs text-slate-600 font-sans">
            Explicit functional capabilities governed per persona role in AEGIS AI
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] text-slate-600 uppercase">
                <th className="py-2 px-3">System Module / Capability</th>
                <th className="py-2 px-3 text-center text-rose-300">CITIZEN</th>
                <th className="py-2 px-3 text-center text-amber-300">NDRF OFFICER</th>
                <th className="py-2 px-3 text-center text-blue-700">CONTROL ROOM</th>
                <th className="py-2 px-3 text-center text-emerald-300">ADMIN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 font-sans text-xs">
              {permissionsMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/40">
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{row.capability}</td>
                  <td className="py-2.5 px-3 text-center">
                    {row.citizen ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {row.officer ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {row.control ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {row.admin ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
