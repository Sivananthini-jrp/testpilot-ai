
import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error, info) {
    console.error('React application error:', error);
    console.error('Component stack:', info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f1115] text-white flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-[#1b1e26] rounded-xl p-8 border border-red-500/30">
            <h1 className="text-2xl font-bold text-red-400 mb-4">
              Application Error
            </h1>

            <p className="text-gray-300 mb-4">
              Something went wrong while loading TestPilot AI.
            </p>

            <pre className="text-sm text-red-300 whitespace-pre-wrap break-words mb-6">
              {this.state.error?.message}
            </pre>

            <button
              onClick={() => window.location.reload()}
              className="px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
