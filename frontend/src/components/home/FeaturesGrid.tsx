import React from 'react';
import { Link } from 'react-router-dom';
import {
  PawPrint, Shield, TrendingUp, Calendar, MapPin, FileText, Clock, Cloud,
  Syringe, ArrowRight, ArrowUpRight,
} from 'lucide-react';
import { PawIcon } from '../common/OrganicDeco';

// Two tiers of visual weight instead of one repeated tile shape: a handful of
// "headline" features get a bit more room, the rest sit as compact chips —
// so the section reads as a hierarchy, not a checklist.
const primaryFeatures = [
  { title: 'Pet Profiles', desc: 'Multiple pets, all in one place — breed, allergies, medications and more.', icon: PawPrint },
  { title: 'Vaccination Tracking', desc: 'Automatic Completed / Upcoming / Overdue status, never guessed.', icon: Shield },
];

const compactFeatures = [
  { title: 'Weight Tracking', desc: 'Spot trends early', icon: TrendingUp },
  { title: 'Vet Appointments', desc: 'Book & manage', icon: Calendar },
  { title: 'Nearby Clinics', desc: 'Ranked by distance', icon: MapPin },
  { title: 'Medical Documents', desc: 'Stored, always on hand', icon: FileText },
  { title: 'Offline-First', desc: 'Your data, with you', icon: Cloud },
];

export const FeaturesGrid: React.FC = () => {
  return (
    <section className="py-20 lg:py-28 bg-[#F9F9F4] dark:bg-paw-darkbg transition-colors duration-200 relative overflow-hidden">
      <div className="absolute top-10 left-5 w-96 h-96 bg-[#E5EFE8]/60 dark:bg-paw-darksurface/30 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-10 right-5 w-80 h-80 bg-[#DCEBE2]/45 dark:bg-paw-darkcard/20 rounded-full blur-2xl -z-10 pointer-events-none" />

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

        {/* Section intro */}
        <div className="max-w-2xl mb-14 relative">
          <div className="absolute -top-6 -left-4 opacity-10 pointer-events-none">
            <svg viewBox="0 0 40 40" className="w-28 h-28 text-[#245C4A]" fill="currentColor">
              <path d="M20 20 C16 20 13 23 13 27 C13 31 16 34 20 34 C24 34 27 31 27 27 C27 23 24 20 20 20 Z" />
              <ellipse cx="12" cy="15" rx="3.2" ry="4.2" transform="rotate(-20 12 15)" />
              <ellipse cx="17.5" cy="11.5" rx="3.2" ry="4.2" transform="rotate(-8 17.5 11.5)" />
              <ellipse cx="23" cy="11.5" rx="3.2" ry="4.2" transform="rotate(8 23 11.5)" />
              <ellipse cx="28" cy="15" rx="3.2" ry="4.2" transform="rotate(20 28 15)" />
            </svg>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-[#E0EDE4] dark:bg-paw-darksurface text-[#245C4A] dark:text-paw-sage flex items-center justify-center shadow-2xs mb-6 relative z-10">
            <PawIcon className="w-7 h-7" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#243638] dark:text-white tracking-tight leading-snug font-sans relative z-10">
            Everything They Need,<br />All in One Place
          </h2>
          <p className="text-sm sm:text-base text-[#526461] dark:text-paw-warm-sage/80 leading-relaxed font-normal max-w-md mt-4 relative z-10">
            From daily care to long-term health, PawPrint gives you the tools to be a more informed, prepared and loving pet parent.
          </p>
        </div>

        {/* Bento layout: a real timeline preview as the anchor tile, two headline
           features beside it, then compact chips for the rest — not one grid
           of identical boxes. */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">

          {/* Anchor tile — Health Timeline, shown as an actual mini product preview */}
          <div className="lg:col-span-3 lg:row-span-2 bg-white dark:bg-paw-darkcard rounded-[28px] border border-[#DCEBE2] dark:border-paw-darkborder shadow-soft p-6 sm:p-7 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E0EDE4] dark:bg-paw-darksurface text-[#245C4A] dark:text-paw-sage flex items-center justify-center">
                  <Clock className="w-[18px] h-[18px]" />
                </div>
                <span className="text-sm font-extrabold text-[#243638] dark:text-white">Health Timeline</span>
              </div>
              <Link to="/features" className="text-xs font-semibold text-[#245C4A] dark:text-paw-warm-sage hover:underline inline-flex items-center gap-1">
                View All <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-4 flex-1">
              {[
                { icon: Syringe, label: 'Vaccination', detail: 'Rabies booster administered', tag: 'Upcoming', tagCls: 'bg-[#FEF3C7] text-[#92400E]' },
                { icon: TrendingUp, label: 'Weight Record', detail: '28.5 kg logged', tag: 'Completed', tagCls: 'bg-[#DEF7EC] text-[#03543F]' },
                { icon: Calendar, label: 'Appointment', detail: 'Annual checkup booked', tag: 'Completed', tagCls: 'bg-[#DEF7EC] text-[#03543F]' },
                { icon: FileText, label: 'Document', detail: 'Prescription uploaded', tag: 'Stored', tagCls: 'bg-[#E0EDE4] text-[#245C4A]' },
              ].map((row, i) => {
                const RowIcon = row.icon;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F4F8F5] dark:bg-paw-darksurface text-[#245C4A] dark:text-paw-warm-sage flex items-center justify-center flex-shrink-0">
                      <RowIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-[#243638] dark:text-white">{row.label}</div>
                      <div className="text-[11px] text-[#526461] dark:text-paw-warm-sage/70 truncate">{row.detail}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold whitespace-nowrap ${row.tagCls}`}>{row.tag}</span>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-[#526461] dark:text-paw-warm-sage/60 mt-5 pt-4 border-t border-[#EEF6F0] dark:border-paw-darkborder">
              Every vaccination, weigh-in, appointment and document — merged into one chronological view.
            </p>
          </div>

          {/* Two headline features, stacked beside the anchor tile */}
          {primaryFeatures.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="lg:col-span-3 bg-white dark:bg-paw-darkcard rounded-[24px] border border-[#DCEBE2] dark:border-paw-darkborder shadow-soft p-6 flex items-start gap-4 group hover:shadow-soft-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-[#E0EDE4] dark:bg-paw-darksurface text-[#245C4A] dark:text-paw-sage flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#243638] dark:text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-[#526461] dark:text-paw-warm-sage/80 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}

          {/* Compact chips for the remaining features */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {compactFeatures.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-white dark:bg-paw-darkcard rounded-2xl border border-[#DCEBE2] dark:border-paw-darkborder p-4 flex flex-col gap-2.5 group hover:shadow-soft transition-shadow">
                  <div className="w-9 h-9 rounded-lg bg-[#E0EDE4] dark:bg-paw-darksurface text-[#245C4A] dark:text-paw-sage flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-[18px] h-[18px] stroke-[1.8]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#243638] dark:text-white">{item.title}</h3>
                    <p className="text-[11px] text-[#526461] dark:text-paw-warm-sage/70 leading-snug mt-0.5">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 flex items-center gap-3">
          <span className="font-script text-2xl text-[#245C4A] dark:text-paw-warm-sage font-bold">Simple. Smart. Complete.</span>
          <Link
            to="/features"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#245C4A] dark:text-paw-warm-sage hover:underline"
          >
            Explore All Features <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
