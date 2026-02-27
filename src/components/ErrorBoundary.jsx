import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo);
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Optionally reload the page
    // window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-neutral-900/95 backdrop-blur-xl
                          border border-neutral-800 rounded-2xl p-8 shadow-2xl">
            
            {/* Icon + Title */}
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <AlertTriangle size={32} className="text-red-400" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-2">
                  Something went wrong
                </h1>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  The application encountered an unexpected error. Your data has been saved automatically.
                  You can try reloading or continue working.
                </p>
              </div>
            </div>

            {/* Error details (collapsible in production) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-neutral-950/80 rounded-xl border border-neutral-800">
                <div className="text-xs font-mono text-red-400 mb-2 font-bold">
                  {this.state.error.toString()}
                </div>
                {this.state.errorInfo && (
                  <details className="text-xs font-mono text-neutral-500">
                    <summary className="cursor-pointer hover:text-neutral-300 mb-2">
                      Stack trace
                    </summary>
                    <pre className="overflow-x-auto whitespace-pre-wrap break-all">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-6 py-3
                           bg-emerald-600 hover:bg-emerald-500
                           text-white font-semibold rounded-xl
                           transition-all active:scale-95"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-6 py-3
                           bg-neutral-800 hover:bg-neutral-700
                           text-neutral-300 font-semibold rounded-xl
                           transition-all active:scale-95"
              >
                Reload Page
              </button>

              {process.env.NODE_ENV === 'production' && (
                <a
                  href="https://github.com/bibidhSubedi0/DevNotes/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-sm text-neutral-500 hover:text-neutral-300
                             transition-colors underline"
                >
                  Report Issue
                </a>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Smaller error boundary for individual components
export class ComponentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`Error in ${this.props.name}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertTriangle size={16} />
            <span className="font-semibold">{this.props.name} failed to load</span>
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 text-xs text-red-300 hover:text-red-200 underline"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}