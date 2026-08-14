import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// General Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AboutPage } from './pages/AboutPage';
import { DemoPage } from './pages/DemoPage';

// Auth Guard & Layouts
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ControlLayout } from './components/layout/ControlLayout';
import { CitizenLayout } from './components/layout/CitizenLayout';
import { OfficerLayout } from './components/layout/OfficerLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Control Room Pages
import { ControlDashboard } from './pages/control/ControlDashboard';
import { ControlLiveQueue } from './pages/control/ControlLiveQueue';
import { ControlMapPage } from './pages/control/ControlMapPage';
import { ControlResourcePage } from './pages/control/ControlResourcePage';
import { ControlMissionsPage } from './pages/control/ControlMissionsPage';
import { ControlSheltersPage } from './pages/control/ControlSheltersPage';
import { ControlAnalyticsPage } from './pages/control/ControlAnalyticsPage';
import { ControlAIIntelligence } from './pages/control/ControlAIIntelligence';
import { ControlTacticalReconPage } from './pages/control/ControlTacticalReconPage';
import { ControlSystemVerificationPage } from './pages/control/ControlSystemVerificationPage';

// Citizen Pages
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { CitizenSOS } from './pages/citizen/CitizenSOS';
import { CitizenReport } from './pages/citizen/CitizenReport';
import { CitizenRequests } from './pages/citizen/CitizenRequests';
import { CitizenRequestDetail } from './pages/citizen/CitizenRequestDetail';
import { CitizenShelters } from './pages/citizen/CitizenShelters';
import { CitizenHospitals } from './pages/citizen/CitizenHospitals';
import { CitizenProfile } from './pages/citizen/CitizenProfile';

// Officer Pages
import { OfficerDashboard } from './pages/officer/OfficerDashboard';
import { OfficerMissions } from './pages/officer/OfficerMissions';
import { OfficerFieldReport } from './pages/officer/OfficerFieldReport';
import { OfficerResources } from './pages/officer/OfficerResources';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Marketing & Authentication */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/demo" element={<DemoPage />} />

        {/* System Admin Center (ADMIN Role Only) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'CONTROL_ROOM']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
        </Route>

        {/* Mission Control Room Dashboard (CONTROL_ROOM, ADMIN) */}
        <Route
          path="/control"
          element={
            <ProtectedRoute allowedRoles={['CONTROL_ROOM', 'ADMIN']}>
              <ControlLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ControlDashboard />} />
          <Route path="queue" element={<ControlLiveQueue />} />
          <Route path="map" element={<ControlMapPage />} />
          <Route path="recon" element={<ControlTacticalReconPage />} />
          <Route path="resources" element={<ControlResourcePage />} />
          <Route path="missions" element={<ControlMissionsPage />} />
          <Route path="shelters" element={<ControlSheltersPage />} />
          <Route path="analytics" element={<ControlAnalyticsPage />} />
          <Route path="ai" element={<ControlAIIntelligence />} />
          <Route path="testing" element={<ControlSystemVerificationPage />} />
        </Route>

        {/* Citizen SOS & Reporting Portal (CITIZEN, GOVERNMENT_OFFICER, CONTROL_ROOM, ADMIN) */}
        <Route
          path="/citizen"
          element={
            <ProtectedRoute allowedRoles={['CITIZEN', 'GOVERNMENT_OFFICER', 'CONTROL_ROOM', 'ADMIN']}>
              <CitizenLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CitizenDashboard />} />
          <Route path="sos" element={<CitizenSOS />} />
          <Route path="report" element={<CitizenReport />} />
          <Route path="requests" element={<CitizenRequests />} />
          <Route path="requests/:id" element={<CitizenRequestDetail />} />
          <Route path="shelters" element={<CitizenShelters />} />
          <Route path="hospitals" element={<CitizenHospitals />} />
          <Route path="profile" element={<CitizenProfile />} />
        </Route>

        {/* Field Rescuer / Government Officer Portal (GOVERNMENT_OFFICER, CONTROL_ROOM, ADMIN) */}
        <Route
          path="/officer"
          element={
            <ProtectedRoute allowedRoles={['GOVERNMENT_OFFICER', 'CONTROL_ROOM', 'ADMIN']}>
              <OfficerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<OfficerDashboard />} />
          <Route path="missions" element={<OfficerMissions />} />
          <Route path="report" element={<OfficerFieldReport />} />
          <Route path="resources" element={<OfficerResources />} />
        </Route>

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
