import React from 'react';
import { Syringe, Pill, Bell } from 'lucide-react';
import { Brand } from './Navbar';

// Photo panel shown beside the login / sign-up forms on large screens
export const AuthVisual: React.FC<{ image: string; title: string; text: string }> = ({ image, title, text }) => (
  <div className="hidden lg:block relative overflow-hidden">
    <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover animate-[scaleIn_1.2s_ease-out_both]" />
    <div className="absolute inset-0 bg-gradient-to-t from-paw-deep via-paw-deep/40 to-paw-deep/10" />
    <div className="absolute top-8 left-8 rounded-2xl bg-white/90 px-3 py-2 shadow-soft"><Brand /></div>
    <div className="absolute right-8 top-1/3 space-y-3">
      {[[Syringe, 'Rabies booster due in 5 days', 'bg-sky-100 text-sky-700'], [Pill, 'Evening dose given ✓', 'bg-violet-100 text-violet-700'], [Bell, '2 reminders this week', 'bg-orange-100 text-orange-700']].map(([Icon, label, cls], i) => {
        const I = Icon as typeof Syringe;
        return (
          <div key={label as string} className="glass-card rounded-2xl pl-2 pr-4 py-2 flex items-center gap-2.5 shadow-soft-lg animate-float-slow" style={{ animationDelay: `${-i * 1.5}s` }}>
            <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${cls}`}><I className="w-4 h-4" /></span>
            <span className="text-xs font-bold text-paw-dark">{label as string}</span>
          </div>
        );
      })}
    </div>
    <div className="absolute bottom-10 left-8 right-8 text-white">
      <h2 className="font-display text-4xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-white/85 max-w-md">{text}</p>
    </div>
  </div>
);
