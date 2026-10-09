import React from 'react';

type Props = { children: React.ReactNode; resetKey?: string };
type State = { error: Error | null };

// Catches a crash in one page so the navbar stays usable instead of the whole
// app going blank. Navigating elsewhere (a new resetKey) clears the error.
// A failed lazy-load (e.g. a new deploy replaced the old files) offers a reload.
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Page crashed:', error, info.componentStack);
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const chunkFailed = /Loading chunk|dynamically imported module|Failed to fetch/i.test(error.message);
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16" role="alert">
        <div className="max-w-md text-center space-y-4">
          <div className="text-5xl" aria-hidden>🐶</div>
          <h1 className="text-2xl font-extrabold text-paw-dark dark:text-white">
            {chunkFailed ? 'PawPrint was updated' : 'Something went wrong on this page'}
          </h1>
          <p className="text-sm text-paw-secondary dark:text-paw-warm-sage">
            {chunkFailed
              ? 'A newer version is available. Reload to continue.'
              : 'Your records are safe. Try reloading, or head back to another page.'}
          </p>
          <button onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-full text-sm font-bold bg-paw-forest text-white hover:bg-paw-deep shadow-soft">
            Reload page
          </button>
        </div>
      </div>
    );
  }
}
