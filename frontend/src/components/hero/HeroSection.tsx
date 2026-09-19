import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneMockup } from './PhoneMockup';
import { ArrowRight, Wifi, WifiOff, Lock, RefreshCw } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-6 pb-28 sm:pb-36 lg:pt-8 lg:pb-40 overflow-hidden transition-colors duration-200 bg-[#F9F9F4] dark:bg-paw-darkbg">
      
      {/* Giant Soft-Sage Circular Backdrop centered behind the phone */}
      <div className="absolute right-[-6%] top-[2%] w-[640px] h-[640px] sm:w-[760px] sm:h-[760px] lg:w-[860px] lg:h-[860px] rounded-full bg-[#E3EFE7] dark:bg-paw-darksurface/40 -z-20 pointer-events-none" />

      {/* Layered Rolling Green Hills / Ground at the bottom of the hero */}
      <div className="absolute left-0 right-0 bottom-0 h-48 sm:h-64 lg:h-76 pointer-events-none -z-10 overflow-hidden">
        {/* Back soft sage hill ridge */}
        <svg
          viewBox="0 0 1440 280"
          fill="none"
          preserveAspectRatio="none"
          className="absolute bottom-0 w-full h-full opacity-60 dark:opacity-30 text-[#8AB29E] dark:text-paw-darksurface"
        >
          <path
            d="M0,200 C320,200 480,130 800,120 C1080,110 1280,150 1440,130 L1440,280 L0,280 Z"
            fill="currentColor"
          />
        </svg>

        {/* Front rolling deep forest green hill */}
        <svg
          viewBox="0 0 1440 280"
          fill="none"
          preserveAspectRatio="none"
          className="absolute bottom-0 w-full h-full text-[#386754] dark:text-[#183F34]"
        >
          <path
            d="M440,280 C580,200 720,140 960,130 C1200,120 1340,150 1440,165 L1440,280 L440,280 Z"
            fill="currentColor"
          />
        </svg>

        {/* Botanical leaf branches sprouting from the right slope of the green hill */}
        <div className="absolute right-6 sm:right-14 lg:right-24 bottom-16 sm:bottom-20 hidden sm:block opacity-95">
          <svg width="160" height="200" viewBox="0 0 160 200" fill="none">
            {/* Main stem */}
            <path d="M90 200 C90 145, 110 90, 150 35" stroke="#234D3C" strokeWidth="4" strokeLinecap="round" />
            {/* Leaves */}
            <path d="M100 155 C125 142, 138 152, 132 168 C125 178, 108 172, 100 155 Z" fill="#6F9F89" />
            <path d="M106 122 C134 108, 146 118, 140 134 C132 144, 115 138, 106 122 Z" fill="#4E816E" />
            <path d="M118 88 C145 74, 156 85, 151 102 C143 112, 126 104, 118 88 Z" fill="#6F9F89" />
            <path d="M132 56 C154 42, 162 53, 156 67 C149 76, 137 70, 132 56 Z" fill="#4E816E" />
            <path d="M145 32 C160 20, 166 28, 162 38 C155 45, 146 40, 145 32 Z" fill="#8AB29E" />
          </svg>
        </div>

        {/* Left side botanical sprout near center of hill */}
        <div className="absolute left-[42%] bottom-12 hidden lg:block opacity-85">
          <svg width="80" height="100" viewBox="0 0 80 100" fill="none">
            <path d="M40 100 C40 68, 52 44, 68 18" stroke="#234D3C" strokeWidth="3" strokeLinecap="round" />
            <path d="M43 72 C60 62, 70 67, 64 78 C58 85, 48 80, 43 72 Z" fill="#6F9F89" />
            <path d="M50 48 C66 38, 74 43, 68 54 C62 62, 53 57, 50 48 Z" fill="#4E816E" />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-4 items-center">
          
          {/* Left Column: Heading, Pill, Description, Buttons, Social Proof */}
          <div className="lg:col-span-6 space-y-6 text-left pt-4 relative">
            {/* Subtle organic warmth behind heading */}
            <div className="absolute -top-10 -left-10 w-96 h-96 bg-[#E8F2EC]/50 dark:bg-paw-darksurface/25 rounded-full blur-3xl -z-10 pointer-events-none" />
            
            {/* Pill badge with Wifi/signal */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E5EFE8] dark:bg-paw-darksurface border border-[#D0E2D5] dark:border-paw-darkborder text-xs font-bold text-[#245C4A] dark:text-paw-warm-sage shadow-2xs">
              <Wifi className="w-3.5 h-3.5 text-[#245C4A] dark:text-paw-sage stroke-[2.2]" />
              <span>Offline-First · Secure · Always With You</span>
            </div>

            {/* Large Heading */}
            <div className="space-y-1">
              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-[#243638] dark:text-white leading-[1.05] font-sans">
                Because
              </h1>
              <div className="flex items-center gap-3">
                <span className="font-script text-6xl sm:text-7xl xl:text-8xl font-bold text-[#245C4A] dark:text-paw-warm-sage inline-block py-1">
                  they’re family
                </span>
                <span className="font-script text-5xl sm:text-6xl text-[#245C4A] dark:text-paw-warm-sage inline-block -mt-1 font-bold">
                  ♡
                </span>
              </div>
            </div>

            {/* Supporting paragraph */}
            <p className="text-base sm:text-lg text-[#526461] dark:text-paw-warm-sage/90 max-w-lg leading-relaxed font-normal">
              PawPrint helps you keep track of your pet’s health, care and special moments — all in one place. Even when you’re offline.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold text-white bg-[#245C4A] hover:bg-[#183F34] shadow-soft hover:shadow-soft-lg transition-all duration-200"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>

              <Link
                to="/features"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-sm font-semibold text-[#243638] dark:text-paw-light-sage bg-white dark:bg-paw-darksurface border border-[#DCEBE2] dark:border-paw-darkborder hover:bg-[#EEF6F0] shadow-2xs transition-all duration-200"
              >
                Learn More
              </Link>
            </div>

            {/* Trust indicators — what the product actually does, not a made-up stat */}
            <div className="pt-3 flex flex-wrap items-center gap-x-6 gap-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#526461] dark:text-paw-warm-sage/80">
                <WifiOff className="w-4 h-4 text-[#245C4A] dark:text-paw-sage" />
                <span>Works Offline</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#526461] dark:text-paw-warm-sage/80">
                <Lock className="w-4 h-4 text-[#245C4A] dark:text-paw-sage" />
                <span>Secure &amp; Private</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#526461] dark:text-paw-warm-sage/80">
                <RefreshCw className="w-4 h-4 text-[#245C4A] dark:text-paw-sage" />
                <span>Auto Sync</span>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Composition with Tilted Phone & Sitting Cat */}
          <div className="lg:col-span-6 relative flex items-end justify-center pt-8 pb-2 min-h-[560px]">
            
            {/* LAYER 2A: Large Pale Sage-Green Circle behind the phone & cat */}
            <div className="absolute top-1/2 left-1/2 -translate-x-[52%] -translate-y-[50%] w-[440px] h-[440px] sm:w-[540px] sm:h-[540px] rounded-full bg-[#D5E5DB] dark:bg-paw-darksurface/60 -z-30 pointer-events-none" />

            {/* LAYER 2B: Second Overlapping Lighter Sage Organic Circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-[32%] -translate-y-[64%] w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] rounded-full bg-[#E5EFE8]/90 dark:bg-paw-darksurface/30 -z-40 pointer-events-none" />

            {/* LAYER 3: Darker Forest/Sage Organic Hill Shape extending behind phone & cat */}
            <div className="absolute left-[-8%] right-[-8%] bottom-0 h-44 sm:h-52 -z-20 pointer-events-none overflow-hidden">
              {/* Back soft sage hill ridge */}
              <svg viewBox="0 0 700 200" fill="none" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full text-[#7EA995]/60 dark:text-paw-darksurface">
                <path d="M0,150 C120,90 280,70 450,95 C560,110 640,80 700,90 L700,200 L0,200 Z" fill="currentColor" />
              </svg>
              {/* Front deep forest green hill */}
              <svg viewBox="0 0 700 200" fill="none" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full text-[#2D614E] dark:text-[#183F34]">
                <path d="M40,200 C140,110 280,60 440,65 C540,70 620,110 700,130 L700,200 L40,200 Z" fill="currentColor" />
              </svg>
            </div>

            {/* LAYER 4A: Botanical Leaf/Branch around the bottom-left of the phone */}
            <div className="absolute left-[2%] sm:left-[8%] bottom-14 -z-10 pointer-events-none select-none">
              <svg width="120" height="150" viewBox="0 0 120 150" fill="none">
                {/* Stem curling up towards the phone */}
                <path d="M70 145 C65 105, 45 75, 20 40" stroke="#234D3C" strokeWidth="3" strokeLinecap="round" />
                {/* Leaves */}
                <path d="M60 120 C36 112, 30 124, 38 135 C46 142, 58 132, 60 120 Z" fill="#588874" />
                <path d="M52 95 C74 84, 82 95, 76 106 C70 114, 58 106, 52 95 Z" fill="#7EA995" />
                <path d="M40 75 C18 68, 14 78, 20 88 C26 94, 38 86, 40 75 Z" fill="#588874" />
                <path d="M30 52 C48 42, 54 52, 48 60 C42 66, 34 60, 30 52 Z" fill="#7EA995" />
                <path d="M20 40 C14 26, 26 22, 32 30 C36 36, 28 42, 20 40 Z" fill="#588874" />
              </svg>
            </div>

            {/* LAYER 4B: Additional Leaves near the right side of the cat */}
            <div className="absolute right-[0%] sm:right-[4%] bottom-16 -z-10 pointer-events-none select-none">
              <svg width="130" height="170" viewBox="0 0 130 170" fill="none">
                {/* Main stem curving up right of cat */}
                <path d="M40 165 C55 125, 75 80, 110 30" stroke="#234D3C" strokeWidth="3.5" strokeLinecap="round" />
                {/* Paired leaves */}
                <path d="M50 135 C74 125, 84 135, 78 148 C72 156, 58 148, 50 135 Z" fill="#588874" />
                <path d="M58 108 C36 98, 30 110, 38 120 C46 128, 56 118, 58 108 Z" fill="#7EA995" />
                <path d="M72 85 C96 74, 106 84, 100 96 C94 104, 80 96, 72 85 Z" fill="#588874" />
                <path d="M82 62 C64 52, 58 64, 66 72 C72 80, 80 72, 82 62 Z" fill="#7EA995" />
                <path d="M100 40 C118 28, 126 36, 122 46 C116 54, 106 48, 100 40 Z" fill="#588874" />
                <path d="M110 30 C120 18, 128 24, 124 34 C118 40, 112 36, 110 30 Z" fill="#7EA995" />
              </svg>
            </div>

            {/* LAYER 7A: Subtle Paw Print Watermark on the Hill */}
            <div className="absolute right-[22%] bottom-6 z-10 opacity-20 pointer-events-none">
              <svg viewBox="0 0 40 40" className="w-9 h-9 text-[#A8C5B3]" fill="currentColor">
                <path d="M20 20 C16 20 13 23 13 27 C13 31 16 34 20 34 C24 34 27 31 27 27 C27 23 24 20 20 20 Z" />
                <ellipse cx="12" cy="15" rx="3.2" ry="4.2" transform="rotate(-20 12 15)" />
                <ellipse cx="17.5" cy="11.5" rx="3.2" ry="4.2" transform="rotate(-8 17.5 11.5)" />
                <ellipse cx="23" cy="11.5" rx="3.2" ry="4.2" transform="rotate(8 23 11.5)" />
                <ellipse cx="28" cy="15" rx="3.2" ry="4.2" transform="rotate(20 28 15)" />
              </svg>
            </div>

            {/* LAYER 7B: Handwritten Script note above/right of phone with radiating dash lines */}
            <div className="absolute -top-3 right-4 sm:right-12 z-20 text-center font-script text-[#245C4A] dark:text-paw-warm-sage pointer-events-none select-none">
              <div className="relative inline-block">
                {/* Radiating lines on the left */}
                <div className="absolute -left-6 top-1 flex flex-col items-center opacity-70">
                  <span className="text-xs transform -rotate-45 leading-none">―</span>
                  <span className="text-xs transform rotate-12 leading-none mt-1">―</span>
                </div>

                <div className="text-2xl sm:text-3xl font-bold leading-tight">
                  Healthy pets
                </div>
                <div className="text-xl sm:text-2xl font-bold -mt-1">
                  Happier lives
                </div>
                <div className="text-2xl -mt-0.5 font-bold">♡</div>
              </div>
            </div>

            {/* LAYER 7C: Floating Green Heart & Sparkle */}
            <div className="absolute top-20 right-0 sm:right-6 z-20 text-[#6F9F89] text-base font-script animate-float-slow pointer-events-none">
              ♥
            </div>
            <div className="absolute top-28 right-8 z-10 text-paw-honey text-xs font-script opacity-80 pointer-events-none">
              ✦
            </div>

            {/* LAYER 5: Smartphone Mockup with exact tilt matching reference */}
            <div className="relative z-20 transform -rotate-[5deg] sm:-rotate-[6.5deg] transition-transform duration-500 hover:rotate-0 drop-shadow-2xl">
              <PhoneMockup />
            </div>

            {/* LAYER 6: Domestic Tabby Cat sitting upright right next to the phone */}
            <div className="relative z-30 -ml-16 sm:-ml-20 mb-0 w-48 sm:w-56 md:w-64 flex-shrink-0 select-none pointer-events-none transform translate-y-2.5">
              <img
                src="/cat_sitting_clean.png"
                alt="Friendly pet cat sitting"
                className="w-full h-auto object-contain drop-shadow-xl"
              />
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
