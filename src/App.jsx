import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import Dashboard from './pages/dashboard/Dashboard';
import Buckets from './pages/buckets/Buckets';
import BucketFileExplorer from './pages/buckets/BucketFileExplorer';
import AppManagement from './pages/apps/AppManagement';
import ReplicationManager from './pages/rules/ReplicationRules';

const BASE_URL = import.meta.env.VITE_AUTH_LOGIN;

const AuthProvider = ({ children }) => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // 1. Check if token comes in URL
    const tokenFromUrl = searchParams.get('token');
    
    if (tokenFromUrl) {
      localStorage.setItem('hc_token', tokenFromUrl);
      // 2. Remove token from URL immediately to prevent re-processing
      window.history.replaceState({}, document.title, window.location.pathname);
      return; // Stop here and let the next render handle it
    }

    // 3. Check if we have a token at all
    const savedToken = localStorage.getItem('hc_token');
    console.log("Saved Token:", savedToken);
    if (!savedToken) {
      // 4. If no token, redirect to login
      const currentUrl = window.location.origin + window.location.pathname;
      window.location.href = `${BASE_URL}?redirect=${encodeURIComponent(currentUrl)}`;
    }
  }, [searchParams]);

  // Optionally: Don't render children if there's no token to avoid flickering
  const hasToken = !!localStorage.getItem('hc_token') || !!searchParams.get('token');
  return hasToken ? children : <div className="flex h-screen items-center justify-center">Authenticating...</div>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/buckets" element={<Buckets />} />
            <Route path="/buckets/:bucketId/files" element={<BucketFileExplorer />} />
            <Route path="/apps" element={<AppManagement />} />
            <Route path="/replication" element={<ReplicationManager />} />
          </Routes>
        </MainLayout>
      </AuthProvider>
    </Router>
  );
}

export default App;