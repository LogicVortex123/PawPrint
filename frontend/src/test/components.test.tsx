import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { NotFound } from '../pages/NotFound';
import { ForgotPassword } from '../pages/ForgotPassword';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { MedicationsTab } from '../components/dashboard/MedicationsTab';
import { todayKey } from '../lib/dates';
import { Medication, Pet } from '../types';

const withRouter = (ui: React.ReactElement, path = '/') => render(<MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>{ui}</MemoryRouter>);

const pet: Pet = {
  id: 'p1', name: 'Bruno', species: 'dog', breed: 'Labrador', gender: 'Male', dob: '', age: '3 yrs', weight: 28,
  targetWeightMinKg: null, targetWeightMaxKg: null, photo: '/dog.jpg', hasCustomPhoto: false, allergies: [], medications: [],
  microchipId: '', emergencyContact: { name: '', phone: '', relation: '' },
};

const medication = (given: number[]): Medication => ({
  id: 'm1', petId: 'p1', name: 'Apoquel', dosage: '1 tablet', frequency: 'twice_daily', startDate: '2026-01-01', endDate: null,
  instructions: 'With food', prescribedBy: '', doses: [],
  schedule: {
    active: true, frequencyLabel: 'Twice a day', dueToday: 2, givenToday: given, remainingToday: 2 - given.length,
    missedYesterday: 0, endsInDays: null, adherence7: 93, adherence30: 85, streak: 2,
    history: Array.from({ length: 14 }, (_, i) => ({ date: `2026-01-${String(i + 1).padStart(2, '0')}`, due: 2, given: 2 })),
  },
});

describe('NotFound', () => {
  it('shows the missing path and a way home', () => {
    withRouter(<NotFound />, '/no-such-page');
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
    expect(screen.getByText('/no-such-page')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Home/ })).toHaveAttribute('href', '/');
  });
});

describe('ErrorBoundary', () => {
  it('replaces a crashed page with a recovery message', () => {
    const Boom = () => { throw new Error('kaboom'); };
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<ErrorBoundary><Boom /></ErrorBoundary>);
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong on this page');
  });
});

describe('ForgotPassword', () => {
  it('sends the email and shows the confirmation', async () => {
    const forgotPassword = vi.fn().mockResolvedValue('If an account exists for that email, a reset link is on its way.');
    useAppStore.setState({ forgotPassword });
    withRouter(<ForgotPassword />);

    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'asha@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));

    await waitFor(() => expect(screen.getByText(/reset link is on its way/)).toBeInTheDocument());
    expect(forgotPassword).toHaveBeenCalledWith('asha@example.com');
  });
});

describe('MedicationsTab', () => {
  beforeEach(() => {
    useAppStore.setState({ medications: [medication([0])], medicationsLoading: false });
  });

  it("shows today's progress, adherence and streak", () => {
    render(<MedicationsTab pet={pet} />);
    expect(screen.getByText('1/2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Morning/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Evening/ })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('93%')).toBeInTheDocument();
    expect(screen.getByText('2-day streak')).toBeInTheDocument();
  });

  it('ticking a dose calls the store with today\'s slot', async () => {
    const setDoseGiven = vi.fn().mockResolvedValue(undefined);
    useAppStore.setState({ setDoseGiven });
    render(<MedicationsTab pet={pet} />);
    fireEvent.click(screen.getByRole('button', { name: /Evening/ }));
    await waitFor(() => expect(setDoseGiven).toHaveBeenCalledWith('m1', 1, true));
    expect(todayKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
