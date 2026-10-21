// PawPal chat: conversation state and the streaming call to POST /assistant/chat.
// The backend answers in newline-delimited JSON — { type: 'text', text } chunks,
// then { type: 'done', actions } or { type: 'error', message }.

import { create } from 'zustand';
import { API_BASE_URL } from './api';
import { StorageKeys, readJson, writeJson } from './storage';
import { todayKey } from './dates';
import { useAppStore } from '../store/useAppStore';

export interface ChatAction { label: string; to: string }
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: ChatAction[];
  error?: boolean;
}

interface ChatState {
  open: boolean;
  messages: ChatMessage[];
  sending: boolean;
  suggestions: string[];
  setOpen: (open: boolean) => void;
  /** Opens the chat, optionally asking a question straight away */
  openWith: (question?: string) => void;
  send: (text: string) => Promise<void>;
  stop: () => void;
  reset: () => void;
  loadSuggestions: () => Promise<void>;
}

const KEEP = 40; // messages remembered between visits
const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
let controller: AbortController | null = null;

const authHeader = (): Record<string, string> => {
  const token = useAppStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const saved = readJson<ChatMessage[]>(StorageKeys.chat, []);

export const useChatStore = create<ChatState>((set, get) => {
  const persist = () => {
    // Only signed-in conversations are kept, and only finished messages
    if (useAppStore.getState().isAuthenticated) writeJson(StorageKeys.chat, get().messages.filter((m) => m.content).slice(-KEEP));
  };

  const patchLast = (patch: (m: ChatMessage) => ChatMessage) =>
    set((s) => ({ messages: s.messages.map((m, i) => (i === s.messages.length - 1 ? patch(m) : m)) }));

  return {
    open: false,
    messages: Array.isArray(saved) ? saved : [],
    sending: false,
    suggestions: [],

    setOpen: (open) => set({ open }),

    openWith: (question) => {
      set({ open: true });
      if (question && !get().sending) void get().send(question);
    },

    stop: () => controller?.abort(),

    reset: () => {
      controller?.abort();
      set({ messages: [], sending: false });
      persist();
    },

    loadSuggestions: async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/assistant/status`, { headers: authHeader() });
        if (res.ok) set({ suggestions: (await res.json()).suggestions ?? [] });
      } catch {
        // Offline — the chat still opens; suggestions are optional
      }
    },

    send: async (text) => {
      const question = text.trim();
      if (!question || get().sending) return;

      const history = [...get().messages.filter((m) => !m.error && m.content), { id: newId(), role: 'user' as const, content: question }];
      set({ messages: [...history, { id: newId(), role: 'assistant', content: '' }], sending: true });

      controller = new AbortController();
      const { selectedPetId } = useAppStore.getState();
      try {
        const res = await fetch(`${API_BASE_URL}/assistant/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeader() },
          body: JSON.stringify({
            messages: history.slice(-20).map(({ role, content }) => ({ role, content })),
            petId: selectedPetId || undefined,
            date: todayKey(),
          }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => undefined);
          throw new Error(data?.error?.message || 'PawPal couldn\'t answer just now. Please try again.');
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.trim()) continue;
            const event = JSON.parse(line) as { type: string; text?: string; actions?: ChatAction[]; message?: string };
            if (event.type === 'text') patchLast((m) => ({ ...m, content: m.content + (event.text ?? '') }));
            else if (event.type === 'done') patchLast((m) => ({ ...m, actions: event.actions ?? [] }));
            else if (event.type === 'error') patchLast((m) => ({ ...m, content: `${m.content}${m.content ? '\n\n' : ''}${event.message}`, error: !m.content }));
          }
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          patchLast((m) => ({ ...m, content: m.content || 'Stopped.', error: !m.content }));
        } else {
          const offline = err instanceof TypeError;
          patchLast((m) => ({
            ...m,
            error: true,
            content: offline ? 'I can\'t reach PawPrint right now. Check your connection and try again.' : (err as Error).message,
          }));
        }
      } finally {
        controller = null;
        set({ sending: false });
        persist();
      }
    },
  };
});

// A different account (or signing out) starts a fresh conversation
useAppStore.subscribe((state, prev) => {
  if (state.user?.id !== prev.user?.id) {
    controller?.abort();
    useChatStore.setState({ messages: state.user ? readJson<ChatMessage[]>(StorageKeys.chat, []) : [], suggestions: [] });
  }
});
