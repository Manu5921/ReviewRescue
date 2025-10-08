import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import './styles/popup.css';

// Main App Component
const App: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    // Check authentication status on mount
    chrome.runtime.sendMessage({ type: 'AUTH_CHECK' }, (response) => {
      if (response.success) {
        setIsAuthenticated(response.data.isAuthenticated);
      }
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Loading Review Rescue..." />;
  }

  return (
    <Router>
      <div className="h-full w-full flex flex-col bg-gray-50">
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <div className="p-4">
                  <h1>Review Rescue Dashboard</h1>
                  <p className="text-gray-600 mt-2">
                    Welcome to Review Rescue! Your reviews will appear here.
                  </p>
                  <p className="text-sm text-gray-500 mt-4">
                    (Review list, search, and insights will be implemented in Phase 3)
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="card max-w-md text-center space-y-4">
                    <h2 className="text-xl font-semibold">Welcome to Review Rescue</h2>
                    <p className="text-gray-600">
                      View, manage, and analyze your Google reviews in one place
                    </p>
                    <p className="text-sm text-gray-500">
                      (Login screen will be implemented in Phase 3)
                    </p>
                  </div>
                </div>
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

// Render app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}
