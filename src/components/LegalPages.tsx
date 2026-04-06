import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PrivacyPage() {
  return (
    <div className="bg-bg text-primary min-h-screen py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="text-lg text-primary/70 leading-relaxed">
          At Civic Energy, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information.
        </p>
        <div className="space-y-6 text-primary/70 leading-relaxed">
          <h2 className="text-2xl font-semibold text-primary">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, search for a building, or contact us for support.</p>
          <h2 className="text-2xl font-semibold text-primary">2. How We Use Your Information</h2>
          <p>We use your information to provide and improve our services, communicate with you, and personalize your experience.</p>
          <h2 className="text-2xl font-semibold text-primary">3. Data Security</h2>
          <p>We implement industry-standard security measures to protect your information from unauthorized access, disclosure, or modification.</p>
        </div>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="bg-bg text-primary min-h-screen py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="text-lg text-primary/70 leading-relaxed">
          By using Civic Energy, you agree to these terms. Please read them carefully.
        </p>
        <div className="space-y-6 text-primary/70 leading-relaxed">
          <h2 className="text-2xl font-semibold text-primary">1. Use of Services</h2>
          <p>You agree to use our services only for lawful purposes and in accordance with these terms.</p>
          <h2 className="text-2xl font-semibold text-primary">2. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.</p>
          <h2 className="text-2xl font-semibold text-primary">3. Intellectual Property</h2>
          <p>All content and materials provided through our services are the property of Civic Energy or its licensors.</p>
        </div>
      </div>
    </div>
  );
}

export function AccuracyPage() {
  return (
    <div className="bg-bg text-primary min-h-screen py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl font-semibold tracking-tight">Accuracy Disclaimer</h1>
        <p className="text-lg text-primary/70 leading-relaxed">
          Civic Energy provides energy efficiency analysis based on public data and proprietary algorithms.
        </p>
        <div className="space-y-6 text-primary/70 leading-relaxed">
          <h2 className="text-2xl font-semibold text-primary">1. Data Sources</h2>
          <p>Our analysis relies on public benchmarking data, utility rate schedules, and weather records. While we strive for accuracy, we cannot guarantee the completeness or correctness of this data.</p>
          <h2 className="text-2xl font-semibold text-primary">2. Estimates and Projections</h2>
          <p>All financial estimates, savings projections, and ROI calculations are provided for informational purposes only and do not constitute financial or engineering advice.</p>
          <h2 className="text-2xl font-semibold text-primary">3. Verification Recommended</h2>
          <p>We strongly recommend verifying all analysis with actual utility bills and professional energy audits before making significant investment decisions.</p>
        </div>
      </div>
    </div>
  );
}
