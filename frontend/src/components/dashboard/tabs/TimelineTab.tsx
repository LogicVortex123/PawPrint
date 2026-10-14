import React, { useState } from 'react';
import { Clock, Syringe, Scale, Calendar, FileText } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { HealthTimelineEntry } from '../../../types';
import { EmptyState, IconTile, SectionHeader } from '../../ui';
import type { Tone } from '../../../lib/navigation';
import type { TabProps } from './types';

type Cat = HealthTimelineEntry['category'];
const META: Record<Cat, { label: string; icon: typeof Clock; tone: Tone; dot: string }> = {
  vaccination: { label: 'Vaccinations', icon: Syringe, tone: 'sky', dot: 'bg-sky-500' },
  weight: { label: 'Weight', icon: Scale, tone: 'amber', dot: 'bg-amber-500' },
  appointment: { label: 'Appointments', icon: Calendar, tone: 'teal', dot: 'bg-teal-500' },
  document: { label: 'Documents', icon: FileText, tone: 'indigo', dot: 'bg-indigo-500' },
};

export const TimelineTab: React.FC<TabProps> = ({ pet }) => {
  const { timeline } = useAppStore();
  const [filter, setFilter] = useState<'all' | Cat>('all');

  const petTimeline = timeline.filter((t) => t.petId === pet.id);
  const shown = filter === 'all' ? petTimeline : petTimeline.filter((t) => t.category === filter);

  // Group by month, newest first (the store keeps entries newest first)
  const groups: { label: string; items: HealthTimelineEntry[] }[] = [];
  for (const entry of shown) {
    const d = new Date(entry.sortDate);
    const label = Number.isNaN(d.getTime()) ? 'Undated' : d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(entry);
    else groups.push({ label, items: [entry] });
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionHeader icon={Clock} tone="slate" eyebrow="Health timeline" title={`${pet.name}'s story`}
        description="Every vaccination, weigh-in, vet visit and document, in the order it happened." />

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter('all')} className={`chip ${filter === 'all' ? 'chip-active' : ''}`}>All ({petTimeline.length})</button>
        {(Object.keys(META) as Cat[]).map((c) => {
          const Icon = META[c].icon;
          return (
            <button key={c} onClick={() => setFilter(c)} className={`chip ${filter === c ? 'chip-active' : ''}`}>
              <Icon className="w-3.5 h-3.5" />{META[c].label} ({petTimeline.filter((t) => t.category === c).length})
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <EmptyState icon={Clock} tone="slate" image={petTimeline.length === 0 ? '/images/dogs-running.webp' : undefined}
          title={petTimeline.length === 0 ? `No events yet for ${pet.name}` : 'No events of this type yet'}
          text="Every vaccination, weigh-in, appointment and document you add appears here automatically." />
      ) : (
        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g.label}>
              <div className="sticky top-16 z-10 -mx-1 px-1 py-2 bg-paw-mist/90 dark:bg-paw-darkbg/90 backdrop-blur">
                <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-paw-secondary dark:text-paw-warm-sage">{g.label}</h3>
              </div>
              <ol className="relative mt-2 ml-5 border-l-2 border-paw-line dark:border-paw-darkborder space-y-4 stagger">
                {g.items.map((entry) => {
                  const m = META[entry.category];
                  return (
                    <li key={entry.id} className="relative pl-8">
                      <span className={`absolute -left-[9px] top-5 w-4 h-4 rounded-full ring-4 ring-paw-mist dark:ring-paw-darkbg ${m.dot}`} />
                      <div className="card card-interactive p-4 flex items-start gap-3">
                        <IconTile icon={m.icon} tone={m.tone} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="text-sm font-extrabold text-paw-dark dark:text-white">{entry.title}</h4>
                            <span className="text-[11px] font-bold text-paw-secondary dark:text-paw-warm-sage">{entry.date}</span>
                          </div>
                          {entry.description && <p className="text-xs text-paw-secondary dark:text-paw-warm-sage mt-0.5">{entry.description}</p>}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
