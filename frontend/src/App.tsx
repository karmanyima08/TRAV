import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TripProvider } from './context/TripContext';
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { TripWizard } from './pages/TripWizard';
import { ItineraryPage } from './pages/Itinerary';
import { AIExplorer } from './pages/AIExplorer';
import { BudgetSimulator } from './pages/BudgetSimulator';
import { GroupOptimizer } from './pages/GroupOptimizer';
import { Dashboard } from './pages/Dashboard';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TripProvider>
          <Routes>
            {/* Public Landing & Marketing */}
            <Route
              path="/"
              element={
                <MainLayout>
                  <Landing />
                </MainLayout>
              }
            />

            {/* Authentication */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Core User Flow */}
            <Route
              path="/plan"
              element={
                <MainLayout>
                  <TripWizard />
                </MainLayout>
              }
            />

            <Route
              path="/itinerary/:tripId"
              element={
                <MainLayout>
                  <ItineraryPage />
                </MainLayout>
              }
            />

            {/* AI Explorer & Visualizer */}
            <Route
              path="/ai-explorer"
              element={
                <MainLayout>
                  <AIExplorer />
                </MainLayout>
              }
            />

            {/* Advanced What-If & Group Balancing */}
            <Route
              path="/budget-simulator"
              element={
                <MainLayout>
                  <BudgetSimulator />
                </MainLayout>
              }
            />

            <Route
              path="/group-optimizer"
              element={
                <MainLayout>
                  <GroupOptimizer />
                </MainLayout>
              }
            />

            {/* Protected User Dashboard */}
            <Route
              path="/dashboard"
              element={
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </TripProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

