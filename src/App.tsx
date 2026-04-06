/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { BuildingSearchPage } from './components/BuildingSearchPage';
import { Dashboard } from './components/Dashboard';
import { PlatformPage } from './components/PlatformPage';
import { FeaturesPage } from './components/FeaturesPage';
import { ContractorsPage } from './components/ContractorsPage';
import { PricingPage } from './components/PricingPage';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { ProfilePage } from './components/ProfilePage';
import { Layout } from './components/Layout';
import { PaymentPage } from './components/PaymentPage';
import { ContactPage } from './components/ContactPage';
import { MethodologyPage } from './components/MethodologyPage';
import { DataSourcesPage } from './components/DataSourcesPage';
import { AboutPage } from './components/AboutPage';
import { PrivacyPage, TermsPage, AccuracyPage } from './components/LegalPages';
import { BlogPage, CareersPage } from './components/CompanyPages';
import { BenchmarkingData } from './services/chicagoData';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const [selectedBuilding, setSelectedBuilding] = useState<BenchmarkingData | null>(null);
  const navigate = useNavigate();

  const handleSelectBuilding = (building: BenchmarkingData) => {
    setSelectedBuilding(building);
    navigate('/dashboard');
  };

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage onSelect={handleSelectBuilding} />} />
        <Route path="search" element={<BuildingSearchPage onSelect={handleSelectBuilding} />} />
        <Route path="platform" element={<PlatformPage />} />
        <Route path="features" element={<FeaturesPage />} />
        <Route path="contractors" element={<ContractorsPage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route 
          path="dashboard" 
          element={
            selectedBuilding ? (
              <Dashboard building={selectedBuilding} onBack={() => {
                setSelectedBuilding(null);
                navigate('/search');
              }} />
            ) : (
              <div className="min-h-screen flex items-center justify-center bg-bg">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-primary mb-4">No building selected</h2>
                  <button 
                    onClick={() => navigate('/search')}
                    className="bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-full font-medium transition-colors shadow-sm"
                  >
                    Go back to search
                  </button>
                </div>
              </div>
            )
          } 
        />
        <Route path="profile" element={<ProfilePage onSelect={handleSelectBuilding} />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="methodology" element={<MethodologyPage />} />
        <Route path="data-sources" element={<DataSourcesPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="careers" element={<CareersPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="accuracy" element={<AccuracyPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/payment" element={<PaymentPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}
