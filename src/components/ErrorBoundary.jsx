import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Caught:', error, errorInfo);
    this.setState({ info: errorInfo });
    fetch('/JARVIS_CRASH_REPORT/' + encodeURIComponent(error.message + ' | ' + errorInfo.componentStack.split('\n')[1]));
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '50px', color: '#ff5d00', zIndex: 9999, position: 'relative', background: '#000', height: '100vh', fontFamily: 'monospace' }}>
          <h2>React Crashed!</h2>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: 20 }}>
            {this.state.error?.toString()}
          </pre>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: 20, color: '#aaa' }}>
            {this.state.info?.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
