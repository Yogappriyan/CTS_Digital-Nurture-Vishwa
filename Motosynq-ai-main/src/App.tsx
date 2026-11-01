import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { DataProvider } from './features/data/DataContext';
import { AuthGuard } from './components/layout/AuthGuard';
import { AppLayout } from './components/layout/AppLayout';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { DiagnosticLabPage } from './pages/DiagnosticLabPage';
import { HealthPassportPage } from './pages/HealthPassportPage';
import { InspectionDetailPage } from './pages/InspectionDetailPage';
import { SettingsPage } from './pages/SettingsPage';
import { SharedReportPage } from './pages/SharedReportPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/shared/:token" element={<SharedReportPage />} />

            {/* Protected Routes inside AppLayout */}
            <Route
              path="/"
              element={
                <AuthGuard>
                  <AppLayout />
                </AuthGuard>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="digital-twin" element={<DigitalTwinPage />} />
              <Route path="diagnostic-lab" element={<DiagnosticLabPage />} />
              <Route path="health-passport" element={<HealthPassportPage />} />
              <Route path="inspection/:id" element={<InspectionDetailPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
