import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('guardia_user')); }
    catch { return null; }
  });

  const handleLogin = (userData) => {
    localStorage.setItem('guardia_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('guardia_token');
    localStorage.removeItem('guardia_user');
    setUser(null);
  };

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={handleLogin} />}
          />
          <Route
            path="/dashboard"
            element={user ? <DashboardPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
          />
          <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
