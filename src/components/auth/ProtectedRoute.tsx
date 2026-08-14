import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAegisStore } from '../../store/useAegisStore';
import { UserRole } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ShieldAlert, ShieldX, ArrowRight, UserCheck, RefreshCw, KeyRound } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, currentUser, setUserRole } = useAegisStore();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    const getDefaultRouteForRole = (role: UserRole) => {
      switch (role) {
        case 'CONTROL_ROOM':
          return '/control';
        case 'GOVERNMENT_OFFICER':
          return '/officer';
        case 'CITIZEN':
          return '/citizen';
        case 'ADMIN':
          return '/admin';
        default:
          return '/login';
      }
    };

    return (
      <div className="min-h-screen bg-[#F4F7FB] text-slate-900 flex items-center justify-center p-6 font-sans">
        <Card variant="glass" className="max-w-lg w-full p-8 space-y-6 border-rose-500/40 text-center shadow-2xl shadow-rose-950/30">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-700 shadow-xl mx-auto animate-bounce">
            <ShieldX className="h-9 w-9 text-white stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-50 text-rose-300 border border-rose-800">
              HTTP 403: ACCESS DENIED (RBAC GUARD)
            </div>
            <h1 className="text-2xl font-black font-heading text-white">Role Permission Restricted</h1>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              You are signed in as <strong className="text-slate-800">{currentUser.name}</strong>, but your assigned active role does not possess authorization for this section.
            </p>
          </div>

          <div className="bg-white/90 p-4 rounded-xl border border-slate-200 text-left space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">YOUR ACTIVE ROLE:</span>
              <Badge variant="high">{currentUser.role.replace('_', ' ')}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">REQUIRED ROLE(S):</span>
              <div className="flex gap-1 flex-wrap justify-end">
                {allowedRoles.map((r) => (
                  <Badge key={r} variant="info">
                    {r.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
            {currentUser.agencyName && (
              <div className="flex justify-between items-center border-t border-slate-200/80 pt-2 text-[11px]">
                <span className="text-slate-500">Agency:</span>
                <span className="text-slate-700">{currentUser.agencyName}</span>
              </div>
            )}
          </div>

          {/* Persona Quick Switching Helper for Admin */}
          {currentUser.role === 'ADMIN' && (
            <div className="p-4 bg-blue-50/30 rounded-xl border border-blue-200 space-y-3 text-left">
              <p className="text-xs font-bold text-blue-700 font-mono flex items-center">
                <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-blue-600" /> Admin Role Switcher:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {allowedRoles.map((role) => (
                  <Button
                    key={role}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUserRole(role);
                      navigate(getDefaultRouteForRole(role));
                    }}
                    className="text-[11px] py-1.5 font-mono text-blue-700 border-blue-500/40 hover:bg-blue-100/50"
                  >
                    Switch to {role.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate(getDefaultRouteForRole(currentUser.role))}
              className="w-full text-xs"
            >
              Back to My Default Portal
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/login')}
              className="w-full text-xs"
            >
              Sign In with Other Account <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
