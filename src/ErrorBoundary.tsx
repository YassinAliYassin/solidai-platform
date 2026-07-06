import { ReactNode, useState, useEffect } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

export default function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setHasError(true);
      setError(new Error(event.message));
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      setHasError(true);
      setError(new Error(event.reason?.message || 'Unknown error'));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
          <p className="text-slate-400 mb-4">
            {error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => {
              setHasError(false);
              setError(null);
            }}
            className="px-6 py-3 bg-charcoal text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}