import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Send, RotateCcw, Square, Sparkles, ArrowRight } from 'lucide-react';
import { useChatStore, type ChatMessage } from '../../lib/chat';
import { useAppStore } from '../../store/useAppStore';
import { PawPalLogo } from './PawPalLogo';

// ── Tiny, safe Markdown: paragraphs, "- " bullets and **bold** ───────────────

const inline = (text: string) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4
      ? <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>
      : <React.Fragment key={i}>{part}</React.Fragment>);

const RichText: React.FC<{ text: string }> = ({ text }) => {
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (!bullets.length) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="space-y-1 my-1.5">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-2">
            {/* Lines that start with their own emoji marker don't need a dot too */}
            {!/^\p{Extended_Pictographic}/u.test(b) && <span className="mt-[0.55em] w-1.5 h-1.5 rounded-full bg-current opacity-40 flex-shrink-0" aria-hidden />}
            <span>{inline(b)}</span>
          </li>
        ))}
      </ul>,
    );
    bullets = [];
  };
  for (const raw of text.split('\n')) {
    const line = raw.trimEnd();
    if (/^\s*[-•*]\s+/.test(line)) { bullets.push(line.replace(/^\s*[-•*]\s+/, '')); continue; }
    flush();
    if (line.trim()) blocks.push(<p key={`p-${blocks.length}`} className="my-1 first:mt-0 last:mb-0">{inline(line.trim())}</p>);
  }
  flush();
  return <>{blocks}</>;
};

// ── Pieces ───────────────────────────────────────────────────────────────────


const TypingDots: React.FC = () => (
  <span className="inline-flex items-center gap-1 py-1" aria-label="PawPal is typing">
    {[0, 1, 2].map((i) => (
      <span key={i} className="w-2 h-2 rounded-full bg-paw-sage animate-paw-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
    ))}
  </span>
);

const Bubble: React.FC<{ message: ChatMessage; typing: boolean; onAction: () => void }> = ({ message, typing, onAction }) => {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end animate-chat-in">
        <div className="max-w-[85%] px-4 py-2.5 rounded-3xl rounded-br-lg bg-paw-forest text-white text-sm leading-relaxed shadow-soft whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-end gap-2 animate-chat-in">
      <PawPalLogo className="w-8 h-8 drop-shadow-sm" />
      <div className="max-w-[85%] min-w-0">
        <div className={`px-4 py-2.5 rounded-3xl rounded-bl-lg text-sm leading-relaxed break-words ${message.error
          ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-500/20'
          : 'bg-white dark:bg-paw-darkcard text-paw-dark dark:text-white border border-paw-line dark:border-paw-darkborder shadow-2xs'}`}>
          {message.content ? <RichText text={message.content} /> : typing ? <TypingDots /> : null}
        </div>
        {!!message.actions?.length && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.actions.map((a) => (
              <Link key={a.to + a.label} to={a.to} onClick={onAction}
                className="group inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-paw-light-sage dark:bg-paw-darksurface text-paw-forest dark:text-paw-sage border border-paw-soft-sage dark:border-paw-darkborder hover:bg-paw-forest hover:text-white dark:hover:bg-paw-sage dark:hover:text-paw-darkbg transition-colors">
                {a.label} <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── The widget ───────────────────────────────────────────────────────────────

export const ChatWidget: React.FC = () => {
  const { open, setOpen, messages, sending, suggestions, send, stop, reset, loadSuggestions } = useChatStore();
  const { isAuthenticated, user, selectedPet } = useAppStore();
  const { pathname } = useLocation();
  const [draft, setDraft] = useState('');
  const [seen, setSeen] = useState(() => messages.length > 0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pet = selectedPet();
  // The app has a bottom tab bar on phones and tablets; sit above it
  const inApp = isAuthenticated && ['/dashboard', '/analytics', '/settings', '/emergency', '/pets/'].some((p) => pathname.startsWith(p));

  useEffect(() => { if (open) { setSeen(true); loadSuggestions(); } }, [open, isAuthenticated, loadSuggestions]);

  // Focus the box on open, and close with Escape
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { clearTimeout(t); window.removeEventListener('keydown', onKey); };
  }, [open, setOpen]);

  // Follow the conversation as it streams in
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (typeof el.scrollTo === 'function') el.scrollTo({ top: el.scrollHeight, behavior: messages.length > 1 ? 'smooth' : 'auto' });
    else el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  // Grow the text box with what's typed, up to a few lines
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [draft]);

  const submit = (text = draft) => {
    if (!text.trim() || sending) return;
    setDraft('');
    void send(text);
  };

  const firstName = user?.name.split(' ')[0];
  const subtitle = !isAuthenticated
    ? 'Pet-care help · sign in for your records'
    : pet ? `Knows ${pet.name}'s records` : 'Your pet-care assistant';

  return (
    <div className="print:hidden">
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close PawPal chat' : 'Ask PawPal, the pet-care assistant'}
        aria-expanded={open}
        className={`group fixed right-4 sm:right-6 z-[70] ${inApp ? 'bottom-24 lg:bottom-6' : 'bottom-6'} ${open ? 'max-sm:hidden' : ''}`}
      >
        {!seen && <span className="absolute inset-0 rounded-full bg-emerald-400/50 animate-ping [animation-duration:2.4s]" aria-hidden />}
        <span className={`relative flex items-center gap-2.5 h-16 rounded-full bg-white dark:bg-paw-darkcard text-paw-forest dark:text-white border border-paw-line dark:border-paw-darkborder shadow-soft-xl transition-all duration-500 ease-[cubic-bezier(0.34,1.4,0.64,1)] hover:-translate-y-1 hover:shadow-soft-2xl hover:border-paw-sage ${open || inApp ? 'w-16 justify-center' : 'pl-2.5 pr-5'}`}>
          <span className="relative w-11 h-11 flex items-center justify-center">
            <span className={`absolute inset-0 transition-all duration-300 ${open ? 'opacity-0 rotate-90 scale-50' : 'opacity-100'}`}>
              <PawPalLogo className="w-11 h-11 drop-shadow-md" animated />
            </span>
            <X className={`absolute w-6 h-6 transition-all duration-300 ${open ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90 scale-50'}`} />
          </span>
          {!open && !inApp && (
            <span className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-sm font-extrabold">Ask PawPal</span>
              <span className="text-[10.5px] font-semibold text-paw-secondary dark:text-paw-warm-sage">Your pet-care buddy</span>
            </span>
          )}
        </span>
      </button>

      {/* Panel */}
      {open && (
        <section
          role="dialog"
          aria-label="PawPal chat"
          className={`fixed z-[75] flex flex-col overflow-hidden bg-paw-cream dark:bg-paw-darkbg shadow-soft-2xl animate-chat-panel
            inset-0 sm:inset-auto sm:right-6 sm:w-[400px] sm:h-[min(640px,calc(100vh-7.5rem))] sm:rounded-[1.75rem] sm:border sm:border-paw-line dark:sm:border-paw-darkborder
            ${inApp ? 'sm:bottom-[10.5rem] lg:bottom-24' : 'sm:bottom-24'}`}
        >
          {/* Header */}
          <header className="group relative overflow-hidden bg-gradient-to-br from-paw-forest via-[#1B5E49] to-paw-deep text-white px-4 py-3.5 flex items-center gap-3">
            <div className="absolute inset-0 bg-paw-pattern opacity-25" aria-hidden />
            <div className="absolute -right-10 -top-12 w-40 h-40 rounded-full bg-emerald-300/20 blur-2xl animate-blob" aria-hidden />
            <span className="relative">
              <PawPalLogo className="w-11 h-11 drop-shadow-lg" animated outlined />
              <span className="absolute bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-300 ring-2 ring-paw-forest" aria-hidden />
            </span>
            <div className="relative flex-1 min-w-0">
              <div className="font-extrabold leading-tight flex items-center gap-1.5">PawPal <Sparkles className="w-3.5 h-3.5 text-paw-honey" /></div>
              <div className="text-xs text-emerald-100/85 truncate">{subtitle}</div>
            </div>
            {messages.length > 0 && (
              <button type="button" onClick={reset} className="relative w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-colors" title="Start a new chat" aria-label="Start a new chat">
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <button type="button" onClick={() => setOpen(false)} className="relative w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-colors" aria-label="Close chat">
              <X className="w-5 h-5" />
            </button>
          </header>

          {/* Conversation */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 overscroll-contain" aria-live="polite">
            {messages.length === 0 ? (
              <div className="group h-full flex flex-col items-center justify-center text-center px-2 animate-fadeIn">
                <div className="relative mb-4">
                  <div className="absolute -inset-3 rounded-full bg-emerald-200/50 dark:bg-emerald-500/10 blur-xl animate-pulse-subtle" aria-hidden />
                  <span className="relative block animate-float-slow"><PawPalLogo className="w-20 h-20 drop-shadow-xl" animated title="PawPal" /></span>
                </div>
                <h2 className="font-display text-2xl font-semibold text-paw-dark dark:text-white">
                  Hi{firstName ? ` ${firstName}` : ''}! I'm PawPal.
                </h2>
                <p className="mt-1.5 text-sm text-paw-secondary dark:text-paw-warm-sage max-w-[18rem]">
                  {isAuthenticated
                    ? `Ask me what's due, whether doses were given, weight trends, spending — or anything about caring for ${pet?.name ?? 'your pet'}.`
                    : 'Ask me how PawPrint works or for general pet-care tips. Sign in and I can answer from your own pet\'s records.'}
                </p>
                <div className="mt-5 w-full space-y-2 stagger">
                  {suggestions.map((s) => (
                    <button key={s} type="button" onClick={() => submit(s)}
                      className="group w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-2xl text-left text-sm font-semibold bg-white dark:bg-paw-darkcard border border-paw-line dark:border-paw-darkborder text-paw-dark dark:text-white hover:border-paw-forest dark:hover:border-paw-sage hover:-translate-y-0.5 hover:shadow-soft transition-all">
                      {s}
                      <ArrowRight className="w-4 h-4 text-paw-sage opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <Bubble key={m.id} message={m} typing={sending && i === messages.length - 1} onAction={() => { if (window.innerWidth < 640) setOpen(false); }} />
              ))
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => { e.preventDefault(); submit(); }}
            className="border-t border-paw-line dark:border-paw-darkborder bg-white/80 dark:bg-paw-darksurface/80 backdrop-blur px-3 pt-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]"
          >
            <div className="flex items-end gap-2 rounded-3xl bg-paw-mist dark:bg-paw-darkcard border border-paw-line dark:border-paw-darkborder focus-within:border-paw-forest dark:focus-within:border-paw-sage focus-within:shadow-glow transition-shadow pl-4 pr-1.5 py-1.5">
              <label htmlFor="pawpal-input" className="sr-only">Message PawPal</label>
              <textarea
                id="pawpal-input"
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, 2000))}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit(); } }}
                rows={1}
                placeholder={pet ? `Ask about ${pet.name}…` : 'Ask PawPal anything…'}
                className="flex-1 resize-none bg-transparent py-2 text-sm text-paw-dark dark:text-white placeholder:text-paw-secondary/70 dark:placeholder:text-paw-warm-sage/50 focus:outline-none max-h-[120px]"
              />
              {sending ? (
                <button type="button" onClick={stop} className="w-10 h-10 rounded-full bg-paw-dark dark:bg-white text-white dark:text-paw-dark flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform" aria-label="Stop answering">
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>
              ) : (
                <button type="submit" disabled={!draft.trim()} className="w-10 h-10 rounded-full bg-paw-forest text-white flex items-center justify-center flex-shrink-0 shadow-soft hover:bg-paw-deep hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 transition-all" aria-label="Send message">
                  <Send className="w-4 h-4 -translate-x-px translate-y-px" />
                </button>
              )}
            </div>
            <p className="mt-2 text-[10.5px] text-center text-paw-secondary dark:text-paw-warm-sage/70">
              PawPal isn't a vet. In an emergency, contact your vet straight away.
            </p>
          </form>
        </section>
      )}
    </div>
  );
};
