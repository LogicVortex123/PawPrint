import React from 'react';
import { Leaf, Shield, Smartphone, Cloud } from 'lucide-react';

export const TrustSection: React.FC = () => {
  const items = [
    {
      title: 'Pet Safety & Privacy',
      subtitle: 'Your trust matters.',
      icon: Leaf,
    },
    {
      title: 'Secure Authentication',
      subtitle: 'JWT + Bcrypt protection.',
      icon: Shield,
    },
    {
      title: 'Cross-Platform',
      subtitle: 'Works on both iOS & Android.',
      icon: Smartphone,
    },
    {
      title: 'Modern Tech',
      subtitle: 'Fast, reliable, scalable.',
      icon: Cloud,
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#F9F9F4] dark:bg-paw-darkbg transition-colors duration-200 relative overflow-hidden">
      {/* Background Layer: Subtle Pale Sage Organic Shapes */}
      <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#E5EFE8]/70 dark:bg-paw-darksurface/30 blur-3xl -z-10 pointer-events-none" />
      <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#DCEBE2]/50 dark:bg-paw-darkcard/20 blur-2xl -z-10 pointer-events-none" />

      {/* Faint Paw Watermark in Background */}
      <div className="absolute top-10 right-1/4 opacity-10 pointer-events-none">
        <svg viewBox="0 0 40 40" className="w-16 h-16 text-[#245C4A]" fill="currentColor">
          <path d="M20 20 C16 20 13 23 13 27 C13 31 16 34 20 34 C24 34 27 31 27 27 C27 23 24 20 20 20 Z" />
          <ellipse cx="12" cy="15" rx="3.2" ry="4.2" transform="rotate(-20 12 15)" />
          <ellipse cx="17.5" cy="11.5" rx="3.2" ry="4.2" transform="rotate(-8 17.5 11.5)" />
          <ellipse cx="23" cy="11.5" rx="3.2" ry="4.2" transform="rotate(8 23 11.5)" />
          <ellipse cx="28" cy="15" rx="3.2" ry="4.2" transform="rotate(20 28 15)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Side: Handwritten "Built with Love & Care ♡" with Botanical Accent */}
          <div className="lg:col-span-3 text-center lg:text-left space-y-1 relative">
            
            {/* Small botanical sprout framing the heading */}
            <div className="absolute -top-7 left-0 opacity-40 hidden lg:block pointer-events-none">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M10 35 C15 20, 25 12, 35 5" stroke="#4E816E" strokeWidth="2" strokeLinecap="round" />
                <path d="M18 24 C10 20, 8 26, 12 30 C16 34, 20 28, 18 24 Z" fill="#6F9F89" />
                <path d="M24 16 C32 10, 36 16, 32 20 C28 24, 22 20, 24 16 Z" fill="#4E816E" />
              </svg>
            </div>

            <div className="font-script text-4xl sm:text-5xl lg:text-5xl font-bold text-[#245C4A] dark:text-paw-warm-sage leading-tight">
              Built with<br />
              Love & Care
            </div>
            <div className="font-script text-3xl sm:text-4xl text-[#245C4A] dark:text-paw-warm-sage font-bold">
              ♡
            </div>
            
            {/* Hand-drawn double underline curve */}
            <div className="pt-0.5">
              <svg className="w-40 h-4 text-[#245C4A] dark:text-paw-warm-sage mx-auto lg:mx-0" viewBox="0 0 170 14" fill="none">
                <path d="M4 7 C45 2, 100 3, 166 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M15 11 C55 8, 110 9, 150 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
              </svg>
            </div>
          </div>

          {/* Right Side: 4 Columns with subtle vertical dividers & botanical framing */}
          <div className="lg:col-span-9 relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x divide-[#DCEBE2]/80 dark:divide-paw-darkborder">
              {items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center text-center px-4 py-2 group"
                  >
                    {/* Pale green circular icon */}
                    <div className="w-16 h-16 rounded-full bg-[#E0EDE4] dark:bg-paw-darksurface text-[#245C4A] dark:text-paw-warm-sage flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform duration-200 shadow-2xs">
                      <Icon className="w-7 h-7 stroke-[1.8]" />
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-[#243638] dark:text-white mb-1 font-sans">
                      {item.title}
                    </h3>

                    <p className="text-xs text-[#526461] dark:text-paw-warm-sage/80 font-medium">
                      {item.subtitle}
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
