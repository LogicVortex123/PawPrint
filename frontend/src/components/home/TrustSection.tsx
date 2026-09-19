import React from 'react';
import { Leaf, Shield, Smartphone, Cloud } from 'lucide-react';
import { PawIcon } from '../common/OrganicDeco';

export const TrustSection: React.FC = () => {
  const items = [
    { title: 'Pet Safety & Privacy', subtitle: 'Your data stays yours.', icon: Leaf },
    { title: 'JWT + Bcrypt Secured', subtitle: 'Modern, encrypted authentication.', icon: Shield },
    { title: 'iOS & Android', subtitle: 'One account, every device.', icon: Smartphone },
    { title: 'Built to Last', subtitle: 'Fast, reliable, always improving.', icon: Cloud },
  ];

  return (
    // Deliberately dark, full-bleed — the one section on the page that isn't
    // cream/white, so it reads as a distinct beat in the page's rhythm rather
    // than a fourth identical light section back to back.
    <section className="relative bg-[#183F34] dark:bg-[#0F241E] py-16 lg:py-20 overflow-hidden transition-colors duration-200">
      <div className="absolute top-1/2 -translate-y-1/2 -left-16 w-72 h-72 rounded-full bg-white/[0.03] pointer-events-none" />
      <div className="absolute top-1/2 -translate-y-1/2 -right-16 w-72 h-72 rounded-full bg-white/[0.03] pointer-events-none" />
      <div className="absolute top-8 right-1/4 opacity-[0.06] pointer-events-none"><PawIcon className="w-16 h-16 text-white" /></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6 lg:divide-x lg:divide-white/10">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className={`flex items-start gap-4 ${idx > 0 ? 'lg:pl-6' : ''}`}>
                <div className="w-11 h-11 rounded-xl bg-white/10 text-[#A8C5B3] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-[#A8C5B3] mt-0.5">{item.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
