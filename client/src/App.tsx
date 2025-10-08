import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import EmailVerification from './pages/Auth/EmailVerification';
import Ads from './pages/Ads/Ads';
import AdDetail from './pages/Ads/AdDetail';
import CreateAd from './pages/Ads/CreateAd';
import Profile from './pages/Profile/Profile';
import Messages from './pages/Messages/Messages';
import Favorites from './pages/Favorites/Favorites';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/Toast/ToastContainer';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <ToastContainer />
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify/:token" element={<EmailVerification />} />
            <Route path="/ads" element={<Layout><Ads /></Layout>} />
            <Route path="/ads/:id" element={<Layout><AdDetail /></Layout>} />
            
            {/* Protected Routes */}
            <Route path="/ads/create" element={
              <ProtectedRoute>
                <Layout><CreateAd /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout><Profile /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <Layout><Messages /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/favorites" element={
              <ProtectedRoute>
                <Layout><Favorites /></Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
    </ToastProvider>
  );
}

export default App;
