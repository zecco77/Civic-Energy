import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      let parsedError = null;
      try {
        if (this.state.error?.message) {
          parsedError = JSON.parse(this.state.error.message);
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-bg p-4">
          <div className="bg-white p-8 rounded-2xl shadow-sm max-w-lg w-full border border-black/5">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-primary mb-2">Something went wrong</h1>
            <p className="text-primary/60 mb-6">
              We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </p>
            
            {parsedError ? (
              <div className="bg-rose-50 p-4 rounded-xl text-sm text-rose-800 mb-6 font-mono overflow-auto">
                <p className="font-bold mb-2">Firestore Error:</p>
                <p><strong>Operation:</strong> {parsedError.operationType}</p>
                <p><strong>Path:</strong> {parsedError.path}</p>
                <p><strong>Message:</strong> {parsedError.error}</p>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-800 mb-6 font-mono overflow-auto">
                {this.state.error?.toString()}
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary text-white px-4 py-3 rounded-full font-medium hover:bg-black transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
