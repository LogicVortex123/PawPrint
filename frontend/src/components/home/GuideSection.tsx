import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, Syringe, Pill, BellRing, Share2, ArrowRight, Check, Flame, Link2, Copy, Camera, PlayCircle, Pause, Play } from 'lucide-react';
import { Reveal, IconTile } from '../ui';
import { TONES, type Tone } from '../../lib/navigation';
import { FloatingPaws } from '../common/Motion';

const STEP_MS = 6000;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Types text out one character at a time
const TypeText: React.FC<{ text: string; delay?: number; speed?: number }> = ({ text, delay = 0, speed = 90 }) => {
  const [n, setN] = useState(prefersReducedMotion() ? text.length : 0);
  useEffect(() => {
    if (n >= text.length) return;
    const t = setTimeout(() => setN((x) => x + 1), n === 0 ? delay : speed);
    return () => clearTimeout(t);
  }, [n, text, delay, speed]);
  return <>{text.slice(0, n)}<span className={`inline-block w-0.5 h-[0.9em] -mb-0.5 ml-0.5 bg-current align-baseline ${n < text.length ? 'animate-pulse' : 'opacity-0'}`} aria-hidden /></>;
};

// Counts how many timed beats have passed since the scene appeared
function useBeats(times: number[]) {
  const [beat, setBeat] = useState(prefersReducedMotion() ? times.length : 0);
  useEffect(() => {
    if (beat >= times.length) return;
    const t = setTimeout(() => setBeat((b) => b + 1), times[beat] - (times[beat - 1] ?? 0));
    return () => clearTimeout(t);
  }, [beat, times]);
  return beat;
}

// ── The five mock screens ────────────────────────────────────────────────────

const ProfileScene: React.FC = () => (
  <div className="h-full flex flex-col items-center justify-center gap-5 px-6">
    <div className="relative animate-pop">
      <img src="/images/cat-tabby-blue.webp" alt="" className="w-28 h-28 rounded-[2rem] object-cover shadow-soft-xl ring-4 ring-white dark:ring-paw-darkcard" />
      <span className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-paw-forest text-white flex items-center justify-center shadow-soft animate-pop [animation-delay:0.5s]"><Camera className="w-4 h-4" /></span>
    </div>
    <div className="text-center">
      <div className="font-display text-4xl font-semibold text-paw-dark dark:text-white min-h-[2.75rem]"><TypeText text="Luna" delay={700} speed={140} /></div>
      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {['🐱 Cat', 'Indie', '3 yrs', 'Female'].map((t, i) => (
          <span key={t} className="px-3 py-1 rounded-full bg-paw-light-sage dark:bg-paw-darksurface text-xs font-bold text-paw-forest dark:text-paw-sage animate-slideUp" style={{ animationDelay: `${1.5 + i * 0.15}s` }}>{t}</span>
        ))}
      </div>
    </div>
    <div className="w-full max-w-xs grid grid-cols-2 gap-2">
      <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 animate-slideUp [animation-delay:2.3s]">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-300">Allergies</div>
        <div className="text-sm font-bold text-paw-dark dark:text-white">Chicken</div>
      </div>
      <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-500/10 animate-slideUp [animation-delay:2.5s]">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-300">Microchip</div>
        <div className="text-sm font-bold text-paw-dark dark:text-white">•••• 4521</div>
      </div>
    </div>
  </div>
);

const VaccineScene: React.FC = () => {
  const rows = [
    { name: 'Rabies', when: 'Valid until Jun 2027', pct: 100, cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300', tag: 'Up to date' },
    { name: 'FVRCP', when: 'Booster on 28 Oct', pct: 92, cls: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300', tag: 'Due in 6 days', pulse: true },
    { name: 'FeLV', when: 'Valid until Mar 2027', pct: 70, cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300', tag: 'Up to date' },
  ];
  return (
    <div className="h-full flex flex-col justify-center gap-3 px-6">
      <div className="flex items-center justify-between mb-1 animate-fadeIn">
        <span className="text-sm font-extrabold text-paw-dark dark:text-white">Luna's vaccines</span>
        <span className="text-xs font-bold text-sky-700 dark:text-sky-300">2 of 3 up to date</span>
      </div>
      {rows.map((r, i) => (
        <div key={r.name} className="p-4 rounded-2xl bg-white dark:bg-paw-darkcard border border-paw-line dark:border-paw-darkborder shadow-2xs animate-slideUp" style={{ animationDelay: `${0.2 + i * 0.25}s` }}>
          <div className="flex items-center gap-3">
            <IconTile icon={Syringe} tone="sky" size="sm" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-paw-dark dark:text-white">{r.name}</div>
              <div className="text-xs text-paw-secondary dark:text-paw-warm-sage">{r.when}</div>
            </div>
            <span className={`badge ${r.cls} ${r.pulse ? 'animate-pulse' : ''}`}>{r.tag}</span>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-paw-mist dark:bg-paw-darksurface overflow-hidden">
            <div className={`h-full rounded-full animate-grow-x ${r.pulse ? 'bg-amber-400' : 'bg-sky-500'}`} style={{ width: `${r.pct}%`, animationDelay: `${0.5 + i * 0.25}s` }} />
          </div>
        </div>
      ))}
    </div>
  );
};

const DOSE_BEATS = [900, 1900, 2600];
const DoseScene: React.FC = () => {
  const beat = useBeats(DOSE_BEATS);
  const doses = ['Morning', 'Evening'];
  const streak = beat >= 3 ? 13 : 12;
  return (
    <div className="h-full flex flex-col justify-center gap-4 px-6">
      <div className="p-5 rounded-3xl bg-white dark:bg-paw-darkcard border border-paw-line dark:border-paw-darkborder shadow-soft animate-scaleIn">
        <div className="flex items-center gap-3">
          <IconTile icon={Pill} tone="violet" />
          <div className="flex-1">
            <div className="font-extrabold text-paw-dark dark:text-white">Metacam · 0.5 ml</div>
            <div className="text-xs text-paw-secondary dark:text-paw-warm-sage">Twice a day · with food</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {doses.map((d, i) => {
            const done = beat > i;
            return (
              <div key={d} className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl border text-sm font-bold transition-all duration-500 ${done
                ? 'bg-violet-600 border-violet-600 text-white shadow-soft scale-[1.02]'
                : 'border-paw-line dark:border-paw-darkborder text-paw-dark dark:text-white'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center ${done ? 'bg-white text-violet-600' : 'border-2 border-paw-line dark:border-paw-darkborder'}`}>
                  {done && <Check className="w-3.5 h-3.5 animate-pop" strokeWidth={3} />}
                </span>
                {d}
              </div>
            );
          })}
        </div>
      </div>
      <div className={`flex items-center gap-3 p-4 rounded-2xl transition-all duration-500 ${beat >= 3 ? 'bg-gradient-to-r from-orange-400 to-rose-500 text-white shadow-soft-lg scale-[1.03]' : 'bg-paw-mist dark:bg-paw-darksurface text-paw-dark dark:text-white'}`}>
        <Flame className={`w-7 h-7 ${beat >= 3 ? 'animate-wiggle' : 'text-orange-500'}`} />
        <div>
          <div key={streak} className="text-2xl font-extrabold leading-none animate-pop">{streak}-day streak</div>
          <div className="text-xs opacity-80">{beat >= 3 ? 'Every dose given — nice work!' : 'Tick off today’s doses to keep it going'}</div>
        </div>
      </div>
    </div>
  );
};

const ReminderScene: React.FC = () => {
  const notes = [
    { icon: Syringe, tone: 'sky' as Tone, title: 'FVRCP booster in 6 days', text: 'Book a visit before 28 Oct', when: 'now' },
    { icon: Pill, tone: 'violet' as Tone, title: 'Evening dose for Luna', text: 'Metacam · 0.5 ml with food', when: '8:00 PM' },
    { icon: BellRing, tone: 'orange' as Tone, title: 'Daily digest sent', text: '3 things this week · emailed at 8 AM', when: '8:00 AM' },
  ];
  return (
    <div className="h-full flex flex-col justify-center gap-3 px-6">
      <div className="flex justify-center mb-2">
        <span className="relative w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-300 flex items-center justify-center animate-pop">
          <BellRing className="w-8 h-8 animate-wiggle [animation-iteration-count:3]" />
          <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white dark:ring-paw-darkcard animate-pop [animation-delay:0.4s]">3</span>
        </span>
      </div>
      {notes.map((n, i) => (
        <div key={n.title} className="flex items-center gap-3 p-3.5 rounded-2xl glass-card border border-paw-line dark:border-paw-darkborder shadow-soft animate-drop-in" style={{ animationDelay: `${0.6 + i * 0.45}s` }}>
          <IconTile icon={n.icon} tone={n.tone} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-paw-dark dark:text-white truncate">{n.title}</div>
            <div className="text-xs text-paw-secondary dark:text-paw-warm-sage truncate">{n.text}</div>
          </div>
          <span className="text-[10px] font-bold text-paw-secondary dark:text-paw-warm-sage">{n.when}</span>
        </div>
      ))}
    </div>
  );
};

// A fixed, QR-looking pattern (decorative — not a real code)
const QR = Array.from({ length: 121 }, (_, i) => {
  const x = i % 11;
  const y = Math.floor(i / 11);
  const finder = (cx: number, cy: number) => x >= cx && x < cx + 3 && y >= cy && y < cy + 3;
  if (finder(0, 0) || finder(8, 0) || finder(0, 8)) return true;
  return ((x * 7 + y * 13 + x * y) % 5) < 2;
});

const ShareScene: React.FC = () => (
  <div className="h-full flex flex-col items-center justify-center gap-5 px-6">
    <div className="p-4 rounded-3xl bg-white shadow-soft-xl animate-scaleIn">
      <div className="grid grid-cols-11 gap-[3px] w-40 h-40">
        {QR.map((on, i) => (
          <span key={i} className={`rounded-[2px] ${on ? 'bg-paw-dark animate-pop' : ''}`} style={on ? { animationDelay: `${0.2 + ((i * 37) % 121) * 0.008}s` } : undefined} />
        ))}
      </div>
    </div>
    <div className="w-full max-w-xs flex items-center gap-2 p-2 pl-3 rounded-full bg-white dark:bg-paw-darkcard border border-paw-line dark:border-paw-darkborder shadow-soft animate-slideUp [animation-delay:1.3s]">
      <Link2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
      <span className="flex-1 text-xs font-semibold text-paw-dark dark:text-white truncate">pawprint.app/share/luna-7d…</span>
      <span className="px-3 py-1.5 rounded-full bg-teal-600 text-white text-[11px] font-bold inline-flex items-center gap-1 animate-pop [animation-delay:2s]"><Copy className="w-3 h-3" /> Copied</span>
    </div>
    <p className="text-xs font-semibold text-paw-secondary dark:text-paw-warm-sage animate-fadeIn [animation-delay:2.2s]">Read-only for Dr. Patel · expires in 7 days</p>
  </div>
);

const STEPS: { icon: typeof PawPrint; tone: Tone; title: string; text: string; scene: React.FC }[] = [
  { icon: PawPrint, tone: 'forest', title: 'Add your pet', text: 'A name, a photo and a few details. Allergies and microchip if you have them handy.', scene: ProfileScene },
  { icon: Syringe, tone: 'sky', title: 'Log their vaccines', text: 'PawPrint fills in the usual booster date and keeps an eye on what’s coming up.', scene: VaccineScene },
  { icon: Pill, tone: 'violet', title: 'Tick off daily doses', text: 'A simple checklist for every medication, with streaks so nothing gets missed.', scene: DoseScene },
  { icon: BellRing, tone: 'orange', title: 'Get reminded early', text: 'Boosters, doses and visits show up before they’re due — in the app, by email or as alerts.', scene: ReminderScene },
  { icon: Share2, tone: 'teal', title: 'Share with your vet', text: 'A read-only link or QR code that expires on its own. No accounts needed on their side.', scene: ShareScene },
];

export const GuideSection: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [paused, setPaused] = useState(false);
  const [round, setRound] = useState(0); // restarts the progress bar when a step is picked by hand
  const reduced = prefersReducedMotion();
  const auto = inView && !hovering && !paused;

  // Only play while the guide is on screen
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const step = STEPS[active];
  const Scene = step.scene;

  // Move on when the active step's progress bar fills up
  const next = () => setActive((a) => (a + 1) % STEPS.length);
  const pick = (i: number) => { setActive(i); setRound((r) => r + 1); };

  return (
    <section ref={ref} id="guide" className="relative py-20 sm:py-24 bg-white/70 dark:bg-paw-darksurface/40 scroll-mt-20 overflow-hidden"
      onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
      <div className="absolute inset-0 bg-paw-pattern opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" aria-hidden />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto">
          <span className="eyebrow text-paw-forest dark:text-paw-sage"><PlayCircle className="w-4 h-4" /> Quick guide · 30 seconds</span>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl font-semibold tracking-tight text-paw-dark dark:text-white">See how PawPrint works</h2>
          <p className="mt-4 text-paw-secondary dark:text-paw-warm-sage">Your first week in five small steps. It plays by itself — or tap any step.</p>
        </Reveal>

        <div className="mt-14 grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-14 items-center">
          {/* Steps */}
          <Reveal from="left">
            <ol className="space-y-2.5" aria-label="Guide steps">
              {STEPS.map((s, i) => {
                const on = i === active;
                return (
                  <li key={s.title}>
                    <button type="button" onClick={() => pick(i)} aria-current={on ? 'step' : undefined}
                      className={`group w-full text-left rounded-3xl p-4 sm:p-5 border transition-all duration-500 ${on
                        ? 'bg-white dark:bg-paw-darkcard border-paw-line dark:border-paw-darkborder shadow-soft-lg'
                        : 'border-transparent hover:bg-white/60 dark:hover:bg-paw-darkcard/50'}`}>
                      <div className="flex items-center gap-4">
                        <span className={`relative w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${on ? `${TONES[s.tone].solid} text-white scale-110 rotate-[-6deg] shadow-soft` : TONES[s.tone].tile}`}>
                          <s.icon className="w-5 h-5" />
                          {i < active && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-paw-darkcard"><Check className="w-2.5 h-2.5" strokeWidth={4} /></span>}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-extrabold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage">Step {i + 1}</div>
                          <div className={`font-extrabold transition-colors ${on ? 'text-paw-dark dark:text-white text-lg' : 'text-paw-secondary dark:text-paw-warm-sage group-hover:text-paw-dark dark:group-hover:text-white'}`}>{s.title}</div>
                        </div>
                      </div>
                      {/* The active step opens up with its description and a progress bar */}
                      <div className={`grid transition-all duration-500 ease-out ${on ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="overflow-hidden">
                          <p className="pt-3 pl-[3.75rem] text-sm text-paw-secondary dark:text-paw-warm-sage">{s.text}</p>
                          <div className="mt-4 ml-[3.75rem] h-1 rounded-full bg-paw-mist dark:bg-paw-darksurface overflow-hidden">
                            {on && reduced && <div className={`h-full w-full rounded-full ${TONES[s.tone].bar}`} />}
                            {on && !reduced && (
                              <div key={`${active}-${round}`} className={`h-full rounded-full ${TONES[s.tone].bar} origin-left`}
                                onAnimationEnd={next}
                                style={{ animation: `growX ${STEP_MS}ms linear both`, animationPlayState: auto ? 'running' : 'paused' }} />
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>
            <Link to="/signup" className="btn-primary btn-lg mt-8 group">
              Start free — it takes a minute <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Reveal>

          {/* Mock app window — above the steps on phones so a tap shows its result */}
          <Reveal from="right" className="order-first lg:order-none">
            <div className="relative mx-auto w-full max-w-lg">
              <div className={`absolute -inset-8 rounded-[3rem] blur-3xl opacity-70 transition-colors duration-700 ${TONES[step.tone].soft}`} aria-hidden />
              <FloatingPaws count={4} />
              <div className="relative card overflow-hidden shadow-soft-2xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-paw-line dark:border-paw-darkborder bg-paw-mist/70 dark:bg-paw-darksurface/70">
                  <span className="flex gap-1.5" aria-hidden>{['bg-rose-400', 'bg-amber-400', 'bg-emerald-400'].map((c) => <span key={c} className={`w-2.5 h-2.5 rounded-full ${c}`} />)}</span>
                  <span className="flex-1 mx-6 px-3 py-1 rounded-full bg-white dark:bg-paw-darkcard text-[11px] text-center font-semibold text-paw-secondary dark:text-paw-warm-sage truncate">pawprint.app · {step.title.toLowerCase()}</span>
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center ${TONES[step.tone].tile}`}><step.icon className="w-3.5 h-3.5" /></span>
                </div>
                <div className="relative h-[23rem] sm:h-[26rem] bg-paw-cream dark:bg-paw-darkbg" aria-hidden>
                  {/* Keyed by step so each scene plays from the start */}
                  <div key={active} className="absolute inset-0 animate-page-in"><Scene /></div>
                </div>
              </div>
              {/* Step dots and a play/pause control under the window */}
              <div className="mt-5 flex justify-center items-center gap-2">
                {!reduced && (
                  <button type="button" onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Play the guide' : 'Pause the guide'}
                    className="mr-2 w-8 h-8 rounded-full bg-white dark:bg-paw-darkcard border border-paw-line dark:border-paw-darkborder text-paw-forest dark:text-paw-sage flex items-center justify-center shadow-2xs hover:border-paw-forest transition-colors">
                    {paused ? <Play className="w-3.5 h-3.5 fill-current translate-x-px" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
                  </button>
                )}
                {STEPS.map((s, i) => (
                  <button key={s.title} type="button" onClick={() => pick(i)} aria-label={`Show step ${i + 1}: ${s.title}`}
                    className={`h-2 rounded-full transition-all duration-500 ${i === active ? `w-8 ${TONES[s.tone].bar}` : 'w-2 bg-paw-line dark:bg-paw-darkborder hover:bg-paw-sage'}`} />
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
