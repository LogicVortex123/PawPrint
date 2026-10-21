import React from 'react';
import { HeroSection } from '../components/hero/HeroSection';
import { FeaturesGrid } from '../components/home/FeaturesGrid';
import { PawPalShowcase } from '../components/home/PawPalShowcase';
import { FeatureMarquee, StatsBand, PeaceOfMind, FaqSection, CtaBanner } from '../components/home/HomeSections';
import { GuideSection } from '../components/home/GuideSection';

export const Home: React.FC = () => {
  return (
    <div>
      <HeroSection />
      <FeatureMarquee />
      {/* The animated guide comes first, so new visitors see how it works straight away */}
      <GuideSection />
      <StatsBand />
      <FeaturesGrid />
      <PeaceOfMind />
      <PawPalShowcase />
      <FaqSection />
      <CtaBanner />
    </div>
  );
};
