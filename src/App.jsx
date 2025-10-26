import React from 'react';
import HeroSection from './components/HeroSection';
import ModulesOverview from './components/ModulesOverview';
import AnalyzerTabs from './components/AnalyzerTabs';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <HeroSection />
      <main className="mx-auto max-w-7xl px-6 md:px-8">
        <ModulesOverview />
        <AnalyzerTabs />
      </main>
      <Footer />
    </div>
  );
}
