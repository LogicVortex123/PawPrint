import React from 'react';
import { HeroSection } from '../components/hero/HeroSection';
import { FeaturesGrid } from '../components/home/FeaturesGrid';
import { ValueSection } from '../components/home/ValueSection';
import { TrustSection } from '../components/home/TrustSection';

export const Home: React.FC = () => {
  return (
    <div className="space-y-0">
      <HeroSection />
      <FeaturesGrid />
      <ValueSection />
      <TrustSection />
    </div>
  );
};
