import React from 'react';
import { HeroSection } from '../components/hero/HeroSection';
import { FeaturesGrid } from '../components/home/FeaturesGrid';
import { FeatureMarquee, HowItWorks, FaqSection, CtaBanner } from '../components/home/HomeSections';

export const Home: React.FC = () => {
  return (
    <div>
      <HeroSection />
      <FeatureMarquee />
      <FeaturesGrid />
      <HowItWorks />
      <FaqSection />
      <CtaBanner />
    </div>
  );
};
