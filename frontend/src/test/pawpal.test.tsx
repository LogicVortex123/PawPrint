import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useChatStore } from '../lib/chat';
import { GuestRoute } from '../App';
import { ChatWidget } from '../components/chat/ChatWidget';

const future = { v7_startTransition: true, v7_relativeSplatPath: true };

describe('GuestRoute', () => {
  const renderAt = (path: string) => render(
    <MemoryRouter initialEntries={[path]} future={future}>
      <Routes>
        <Route path="/" element={<GuestRoute><p>Landing page</p></GuestRoute>} />
        <Route path="/login" element={<GuestRoute><p>Login form</p></GuestRoute>} />
        <Route path="/dashboard" element={<p>Dashboard</p>} />
        <Route path="/settings" element={<p>Settings page</p>} />
      </Routes>
    </MemoryRouter>,
  );

  it('shows the landing page to visitors', () => {
    useAppStore.setState({ isAuthenticated: false });
    renderAt('/');
    expect(screen.getByText('Landing page')).toBeInTheDocument();
  });

  it('sends a signed-in user straight to the dashboard', () => {
    useAppStore.setState({ isAuthenticated: true });
    renderAt('/');
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('honours a same-site ?redirect= but never an external one', () => {
    useAppStore.setState({ isAuthenticated: true });
    renderAt('/login?redirect=%2Fsettings');
    expect(screen.getByText('Settings page')).toBeInTheDocument();
    cleanup();
    renderAt('/login?redirect=%2F%2Fevil.example');
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});

describe('PawPal chat', () => {
  beforeEach(() => {
    useAppStore.setState({ isAuthenticated: true, token: 't0k3n', user: { id: 'u1', name: 'Riya Sharma', email: 'r@example.com', authProvider: 'local' }, selectedPetId: '' });
    useChatStore.setState({ open: false, messages: [], sending: false, suggestions: [] });
  });

  it('streams a reply, renders bullets and bold, and shows dashboard links', async () => {
    const lines = [
      { type: 'text', text: 'Here is **Bruno**:\n' },
      { type: 'text', text: '- Rabies is overdue' },
      { type: 'done', source: 'built-in', actions: [{ label: 'Open vaccinations', to: '/dashboard?tab=vaccinations' }] },
    ].map((l) => `${JSON.stringify(l)}\n`).join('');
    const fetchMock = vi.fn(async (url: string, _init?: RequestInit) => (String(url).endsWith('/assistant/status')
      ? new Response(JSON.stringify({ suggestions: ['What needs attention today?'] }))
      : new Response(lines, { headers: { 'Content-Type': 'application/x-ndjson' } })));
    vi.stubGlobal('fetch', fetchMock);

    render(<MemoryRouter future={future}><ChatWidget /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /Ask PawPal/ }));
    fireEvent.change(await screen.findByLabelText('Message PawPal'), { target: { value: 'Any vaccines due?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    await waitFor(() => expect(screen.getByText('Rabies is overdue')).toBeInTheDocument());
    expect(screen.getByText('Bruno').tagName).toBe('STRONG');
    expect(screen.getByRole('link', { name: /Open vaccinations/ })).toHaveAttribute('href', '/dashboard?tab=vaccinations');

    const init = fetchMock.mock.calls.find(([u]) => String(u).endsWith('/assistant/chat'))?.[1];
    expect(init?.headers).toMatchObject({ Authorization: 'Bearer t0k3n' });
    expect(JSON.parse(String(init?.body)).messages).toEqual([{ role: 'user', content: 'Any vaccines due?' }]);
    vi.unstubAllGlobals();
  });

  it('shows a friendly message when the server is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('Failed to fetch'); }));
    useChatStore.setState({ open: true });
    render(<MemoryRouter future={future}><ChatWidget /></MemoryRouter>);
    await useChatStore.getState().send('hello');
    expect(await screen.findByText(/can't reach PawPrint/)).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});
