"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error("Error caught by boundary:", error, errorInfo);

    // You could also log to an error reporting service here
    // Sentry.captureException(error);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3 text-red-600 mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h2 className="text-xl font-bold">Something went wrong</h2>
            </div>

            <p className="text-gray-600 mb-4">
              We&apos;re sorry, but something unexpected happened. Please try refreshing the page or
              contact support if the problem persists.
            </p>

            {this.state.error && (
              <div className="bg-gray-100 rounded p-3 mb-4 text-sm">
                <p className="font-semibold text-gray-700 mb-1">Error message:</p>
                <p className="text-red-600 font-mono">{this.state.error.toString()}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>

            {process.env.NODE_ENV === "development" && this.state.errorInfo && (
              <details className="mt-4 text-xs">
                <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                  Stack trace (development only)
                </summary>
                <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto max-h-40 text-gray-700">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
