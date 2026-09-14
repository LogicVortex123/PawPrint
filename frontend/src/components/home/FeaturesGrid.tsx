import React from 'react';
import { PawPrint, Shield, TrendingUp, Calendar, MapPin, FileText, Clock, Cloud } from 'lucide-react';
import { PawIcon } from '../common/OrganicDeco';

export const FeaturesGrid: React.FC = () => {
  const featuresRow1 = [
    {
      title: 'Pet Profiles',
      desc: 'Multiple pets, all in one place',
      icon: PawPrint,
    },
    {
      title: 'Vaccination Tracking',
      desc: 'Never miss a due date',
      icon: Shield,
    },
    {
      title: 'Weight Tracking',
      desc: 'Track progress, spot changes',
      icon: TrendingUp,
    },
    {
      title: 'Vet Appointments',
      desc: 'Book & manage with ease',
      icon: Calendar,
    },
  ];

  const featuresRow2 = [
    {
      title: 'Nearby Clinics',
      desc: 'Find trusted clinics near you',
      icon: MapPin,
    },
    {
      title: 'Medical Documents',
      desc: 'Store & access offline',
      icon: FileText,
    },
    {
      title: 'Health Timeline',
      desc: 'See the bigger picture',
      icon: Clock,
    },
    {
      title: 'Offline-First',
      desc: 'Your data, always with you',
      icon: Cloud,
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#F9F9F4] dark:bg-paw-darkbg transition-colors duration-200 relative overflow-hidden">
      {/* Background Layer 1: Soft Organic Blobs at section edges */}
      <div className="absolute top-10 left-5 w-96 h-96 bg-[#E5EFE8]/60 dark:bg-paw-darksurface/30 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-10 right-5 w-80 h-80 bg-[#DCEBE2]/45 dark:bg-paw-darkcard/20 rounded-full blur-2xl -z-10 pointer-events-none" />

      {/* Subtle Botanical Sprig at far right edge */}
      <div className="absolute right-0 top-1/3 translate-x-4 opacity-35 dark:opacity-20 pointer-events-none hidden lg:block">
        <svg width="70" height="120" viewBox="0 0 70 120" fill="none">
          <path d="M60 115 C55 80, 45 45, 15 15" stroke="#4E816E" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M50 90 C32 82, 28 92, 34 100 C40 106, 48 98, 50 90 Z" fill="#6F9F89" />
          <path d="M42 65 C60 55, 68 64, 62 72 C56 78, 48 72, 42 65 Z" fill="#4E816E" />
          <path d="M30 45 C15 36, 12 46, 18 54 C24 60, 30 52, 30 45 Z" fill="#6F9F89" />
          <path d="M15 15 C22 6, 30 12, 26 20 C22 24, 16 20, 15 15 Z" fill="#4E816E" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* Left Side (~35%): Paw Icon + Heading + Description + Handwritten Accent */}
          <div className="lg:col-span-4 space-y-6 text-left relative">
            
            {/* Faint decorative paw watermark behind heading */}
            <div className="absolute -top-6 -left-4 opacity-10 pointer-events-none">
              <svg viewBox="0 0 40 40" className="w-28 h-28 text-[#245C4A]" fill="currentColor">
                <path d="M20 20 C16 20 13 23 13 27 C13 31 16 34 20 34 C24 34 27 31 27 27 C27 23 24 20 20 20 Z" />
                <ellipse cx="12" cy="15" rx="3.2" ry="4.2" transform="rotate(-20 12 15)" />
                <ellipse cx="17.5" cy="11.5" rx="3.2" ry="4.2" transform="rotate(-8 17.5 11.5)" />
                <ellipse cx="23" cy="11.5" rx="3.2" ry="4.2" transform="rotate(8 23 11.5)" />
                <ellipse cx="28" cy="15" rx="3.2" ry="4.2" transform="rotate(20 28 15)" />
              </svg>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-[#E0EDE4] dark:bg-paw-darksurface text-[#245C4A] dark:text-paw-sage flex items-center justify-center shadow-2xs">
              <PawIcon className="w-7 h-7" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#243638] dark:text-white tracking-tight leading-snug font-sans relative z-10">
              Everything They Need,<br />
              All in One Place
            </h2>

            <p className="text-sm sm:text-base text-[#526461] dark:text-paw-warm-sage/80 leading-relaxed font-normal max-w-sm relative z-10">
              From daily care to long-term health, PawPrint gives you the tools to be a more informed, prepared and loving pet parent.
            </p>

            {/* Handwritten Phrase with Underline */}
            <div className="pt-2 relative z-10">
              <div className="flex items-center gap-2">
                <span className="font-script text-3xl sm:text-4xl font-bold text-[#245C4A] dark:text-paw-warm-sage block">
                  Simple. Smart. Complete.
                </span>
                <span className="font-script text-2xl text-[#6F9F89] dark:text-paw-warm-sage font-bold">
                  ♡
                </span>
              </div>
              {/* Enhanced Hand-drawn underline SVG */}
              <svg className="w-52 h-3.5 text-[#245C4A] dark:text-paw-warm-sage -mt-1" viewBox="0 0 220 14" fill="none">
                <path d="M4 10 C55 3, 130 4, 214 9" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Right Side (~65%): Structured 4 x 2 Grid with thin dividers */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-0">
              
              {/* Row 1 */}
              {featuresRow1.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className={`flex flex-col items-center text-center px-4 py-8 group ${
                      idx < 3 ? 'sm:border-r border-[#DCEBE2]/80 dark:border-paw-darkborder' : ''
                    } border-b border-[#DCEBE2]/80 dark:border-paw-darkborder`}
                  >
                    {/* Pale Green Circular Icon Container */}
                    <div className="w-16 h-16 rounded-full bg-[#E0EDE4] dark:bg-paw-darksurface text-[#245C4A] dark:text-paw-warm-sage flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform duration-200 shadow-2xs">
                      <Icon className="w-7 h-7 stroke-[1.8]" />
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-[#243638] dark:text-white mb-1 font-sans">
                      {item.title}
                    </h3>

                    <p className="text-xs text-[#526461] dark:text-paw-warm-sage/80 leading-snug max-w-[130px] font-normal">
                      {item.desc}
                    </p>
                  </div>
                );
              })}

              {/* Row 2 */}
              {featuresRow2.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className={`flex flex-col items-center text-center px-4 py-8 group ${
                      idx < 3 ? 'sm:border-r border-[#DCEBE2]/80 dark:border-paw-darkborder' : ''
                    }`}
                  >
                    {/* Pale Green Circular Icon Container */}
                    <div className="w-16 h-16 rounded-full bg-[#E0EDE4] dark:bg-paw-darksurface text-[#245C4A] dark:text-paw-warm-sage flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform duration-200 shadow-2xs">
                      <Icon className="w-7 h-7 stroke-[1.8]" />
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-[#243638] dark:text-white mb-1 font-sans">
                      {item.title}
                    </h3>

                    <p className="text-xs text-[#526461] dark:text-paw-warm-sage/80 leading-snug max-w-[130px] font-normal">
                      {item.desc}
                    </p>
                  </div>
                );
              })}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
