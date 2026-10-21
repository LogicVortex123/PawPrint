import React, { useEffect, useState } from 'react';
import { MessageCircleHeart, Sparkles, ShieldCheck, ClipboardList, Stethoscope, ArrowRight } from 'lucide-react';
import { Reveal, IconTile, useInView } from '../ui';
import { PawPalLogo } from '../chat/PawPalLogo';
import { FloatingPaws } from '../common/Motion';
import { useChatStore } from '../../lib/chat';

// A sample conversation that plays itself, line by line, once it scrolls into view
const SCRIPT: { from: 'user' | 'pawpal'; text: React.ReactNode }[] = [
  { from: 'user', text: 'Is Luna due any vaccines?' },
  { from: 'pawpal', text: <>Luna's <b>FVRCP booster is due in 6 days</b> (28 Oct). Rabies is up to date until next June. 🎉</> },
  { from: 'user', text: 'Did she get her evening dose?' },
  { from: 'pawpal', text: <>Not yet — <b>1 of 2 doses</b> of Metacam is still to give today. Tick it off in Medications to keep her 12-day streak going.</> },
];

const POINTS = [
  { icon: ClipboardList, tone: 'sky' as const, title: 'Knows their records', text: 'Ask what\'s due, whether doses were given, weight trends or spending — answered from your pet\'s own data.' },
  { icon: Stethoscope, tone: 'rose' as const, title: 'Safe by design', text: 'General guidance only, never a diagnosis — and it tells you to call a vet straight away when it sounds urgent.' },
  { icon: ShieldCheck, tone: 'forest' as const, title: 'Private to you', text: 'PawPal only sees the pets on your own account, and you can clear the chat any time.' },
];

const PawPalDot: React.FC = () => <PawPalLogo className="w-8 h-8 drop-shadow-sm" />;

const DemoChat: React.FC = () => {
  const [ref, inView] = useInView<HTMLDivElement>();
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (!inView) return;
    // Loop: reveal each line (PawPal "types" first), pause at the end, start over
    if (shown >= SCRIPT.length) {
      const t = setTimeout(() => setShown(0), 4500);
      return () => clearTimeout(t);
    }
    const next = SCRIPT[shown];
    if (next.from === 'pawpal' && !typing) {
      const t = setTimeout(() => setTyping(true), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => { setTyping(false); setShown((n) => n + 1); }, next.from === 'pawpal' ? 1300 : shown === 0 ? 400 : 1100);
    return () => clearTimeout(t);
  }, [inView, shown, typing]);

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-emerald-200/60 via-paw-soft-sage to-paw-honey-soft dark:from-emerald-900/30 dark:via-paw-darkcard dark:to-amber-900/10 blur-2xl animate-blob" aria-hidden />
      <div className="relative card overflow-hidden shadow-soft-2xl">
        <div className="group relative overflow-hidden bg-gradient-to-br from-paw-forest via-[#1B5E49] to-paw-deep text-white px-5 py-4 flex items-center gap-3">
          <div className="absolute inset-0 bg-paw-pattern opacity-25" aria-hidden />
          <PawPalLogo className="relative w-11 h-11 drop-shadow-lg" animated outlined />
          <div className="relative">
            <div className="font-extrabold leading-tight flex items-center gap-1.5">PawPal <Sparkles className="w-3.5 h-3.5 text-paw-honey" /></div>
            <div className="text-xs text-emerald-100/85 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" /> Knows Luna's records</div>
          </div>
        </div>
        <div className="h-[22rem] px-5 py-5 space-y-3.5 bg-paw-cream dark:bg-paw-darkbg overflow-hidden" aria-hidden>
          {SCRIPT.slice(0, shown).map((line, i) => line.from === 'user' ? (
            <div key={i} className="flex justify-end animate-chat-in">
              <div className="max-w-[80%] px-4 py-2.5 rounded-3xl rounded-br-lg bg-paw-forest text-white text-sm shadow-soft">{line.text}</div>
            </div>
          ) : (
            <div key={i} className="flex items-end gap-2 animate-chat-in">
              <PawPalDot />
              <div className="max-w-[80%] px-4 py-2.5 rounded-3xl rounded-bl-lg bg-white dark:bg-paw-darkcard border border-paw-line dark:border-paw-darkborder text-sm text-paw-dark dark:text-white leading-relaxed [&_b]:font-bold">{line.text}</div>
            </div>
          ))}
          {typing && (
            <div className="flex items-end gap-2 animate-chat-in">
              <PawPalDot />
              <div className="px-4 py-3 rounded-3xl rounded-bl-lg bg-white dark:bg-paw-darkcard border border-paw-line dark:border-paw-darkborder inline-flex gap-1">
                {[0, 1, 2].map((d) => <span key={d} className="w-2 h-2 rounded-full bg-paw-sage animate-paw-bounce" style={{ animationDelay: `${d * 0.15}s` }} />)}
              </div>
            </div>
          )}
        </div>
        <div className="px-4 py-3 border-t border-paw-line dark:border-paw-darkborder bg-white dark:bg-paw-darksurface">
          <div className="flex items-center gap-2 rounded-full bg-paw-mist dark:bg-paw-darkcard border border-paw-line dark:border-paw-darkborder pl-4 pr-1.5 py-1.5 text-sm text-paw-secondary dark:text-paw-warm-sage">
            <span className="flex-1">Ask about Luna…</span>
            <span className="w-8 h-8 rounded-full bg-paw-forest text-white flex items-center justify-center"><ArrowRight className="w-4 h-4" /></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PawPalShowcase: React.FC = () => {
  const openChat = useChatStore((s) => s.openWith);
  return (
    <section id="pawpal" className="relative py-24 overflow-hidden bg-gradient-to-b from-transparent via-paw-light-sage/60 to-transparent dark:via-paw-darksurface/40">
      <FloatingPaws count={5} />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <Reveal>
            <span className="eyebrow text-paw-forest dark:text-paw-sage"><MessageCircleHeart className="w-4 h-4" /> New · Meet PawPal</span>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl font-semibold tracking-tight text-paw-dark dark:text-white">
              Just ask. <span className="text-gradient-flow">PawPal knows.</span>
            </h2>
            <p className="mt-4 text-lg text-paw-secondary dark:text-paw-warm-sage max-w-xl">
              A friendly care assistant that lives in every corner of PawPrint. Ask in plain words and get answers from your pet's own records — plus how-tos and everyday care tips.
            </p>
          </Reveal>
          <ul className="mt-8 space-y-4">
            {POINTS.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 110} from="left" className="flex gap-4">
                <IconTile icon={p.icon} tone={p.tone} />
                <div>
                  <p className="font-bold text-paw-dark dark:text-white">{p.title}</p>
                  <p className="text-sm text-paw-secondary dark:text-paw-warm-sage">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </ul>
          <Reveal delay={380}>
            <button type="button" onClick={() => openChat()} className="btn-primary btn-lg mt-9 group">
              <MessageCircleHeart className="w-5 h-5" /> Try PawPal now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Reveal>
        </div>
        <Reveal from="right"><DemoChat /></Reveal>
      </div>
    </section>
  );
};
