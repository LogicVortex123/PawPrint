import React from 'react';
import { ROADMAP_PHASES } from '../data/mockData';
import { CheckCircle2, Clock, Sparkles, Rocket } from 'lucide-react';

export const Roadmap: React.FC = () => {
  return (
    <div className="pt-8 pb-24 lg:pb-28 transition-colors duration-200 relative overflow-hidden">
      {/* Background organic curves */}
      <div className="absolute top-12 left-10 w-96 h-96 bg-[#E5EFE8] dark:bg-paw-darksurface/30 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-16 right-10 w-80 h-80 bg-[#DCEBE2]/50 dark:bg-paw-darkcard/20 organic-blob-1 blur-2xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E2EDE6] dark:bg-paw-darksurface border border-[#D0E2D5] dark:border-paw-darkborder text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-warm-sage">
            <Rocket className="w-3.5 h-3.5" />
            <span>What’s here & what’s next</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl font-semibold text-paw-dark dark:text-white tracking-tight">
            The PawPrint{' '}
            <span className="text-gradient">
              Roadmap
            </span>
          </h1>

          <p className="text-base sm:text-lg text-paw-secondary dark:text-paw-warm-sage/80 pt-1 leading-relaxed">
            What you can do with PawPrint today, and what we’re building next.
          </p>
        </div>

        {/* Vertical Curved Timeline with Milestone Indicators */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Track Line */}
          <div className="absolute left-6 sm:left-1/2 top-4 bottom-4 -translate-x-1/2 w-1 bg-gradient-to-b from-paw-forest via-paw-sage to-paw-soft-sage/40 dark:from-paw-forest dark:to-paw-darkborder rounded-full" />

          <div className="space-y-12 sm:space-y-16">
            {ROADMAP_PHASES.map((phase, idx) => {
              const isEven = idx % 2 === 0;
              const isCompleted = phase.status === 'completed';
              const isInProgress = phase.status === 'in-progress';
              const isUpcoming = phase.status === 'upcoming';

              return (
                <div key={phase.phase} className="relative flex flex-col sm:flex-row items-start sm:items-center">
                  
                  {/* Central Milestone Indicator Node */}
                  <div className="absolute left-6 sm:left-1/2 top-0 sm:top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
                    <div
                      className={`w-12 h-12 rounded-full border-4 border-white dark:border-paw-darkbg shadow-soft-lg flex items-center justify-center transition-transform duration-300 hover:scale-110 ${
                        isCompleted
                          ? 'bg-paw-forest text-white'
                          : isInProgress
                          ? 'bg-amber-500 text-white animate-pulse'
                          : 'bg-paw-light-sage dark:bg-paw-darksurface text-paw-secondary dark:text-paw-warm-sage'
                      }`}
                    >
                      {isCompleted && <CheckCircle2 className="w-6 h-6" />}
                      {isInProgress && <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />}
                      {isUpcoming && <Sparkles className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Content Card (Alternating left and right on larger screens) */}
                  <div
                    className={`w-full sm:w-[calc(50%-2.5rem)] pl-16 sm:pl-0 ${
                      isEven ? 'sm:mr-auto sm:text-right' : 'sm:ml-auto sm:text-left'
                    }`}
                  >
                    <div className="card card-interactive p-6 sm:p-8 text-left animate-slideUp">
                      
                      {/* Phase Tag & Status Badge */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-paw-forest dark:text-paw-sage">
                          {phase.phase}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : isInProgress
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-paw-light-sage text-paw-secondary dark:bg-paw-darkcard dark:text-paw-warm-sage'
                          }`}
                        >
                          {phase.tag}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-paw-dark dark:text-white mb-2">
                        {phase.name}
                      </h3>

                      <p className="text-xs sm:text-sm text-paw-secondary dark:text-paw-warm-sage/80 mb-4 leading-relaxed">
                        {phase.description}
                      </p>

                      {/* Deliverables checklist */}
                      <div className="pt-3 border-t border-paw-soft-sage/30 dark:border-paw-darkborder/50 space-y-2">
                        <div className="text-[11px] font-bold text-paw-dark dark:text-white uppercase tracking-wider">
                          What’s included
                        </div>
                        <ul className="space-y-1.5 text-xs text-paw-secondary dark:text-paw-warm-sage">
                          {phase.deliverables.map((d, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span
                                className={`mt-0.5 font-bold ${
                                  isCompleted
                                    ? 'text-emerald-600'
                                    : isInProgress
                                    ? 'text-amber-600'
                                    : 'text-paw-secondary/60'
                                }`}
                              >
                                {isCompleted ? '✓' : '•'}
                              </span>
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
