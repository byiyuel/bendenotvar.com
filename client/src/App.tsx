import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { HelmetProvider } from 'react-helmet-async';
import { SocketProvider } from './contexts/SocketContext';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/Layout/Layout';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/Toast/ToastContainer';
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const EmailVerification = lazy(() => import('./pages/Auth/EmailVerification'));
const Ads = lazy(() => import('./pages/Ads/Ads'));
const AdDetail = lazy(() => import('./pages/Ads/AdDetail'));
const CreateAd = lazy(() => import('./pages/Ads/CreateAd'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const Messages = lazy(() => import('./pages/Messages/Messages'));
const Favorites = lazy(() => import('./pages/Favorites/Favorites'));
const MyAds = lazy(() => import('./pages/Ads/MyAds'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Contact = lazy(() => import('./pages/Contact'));
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'));
const AdminUsers = lazy(() => import('./pages/Admin/Users'));
const AdminAds = lazy(() => import('./pages/Admin/Ads'));
const AdminCategories = lazy(() => import('./pages/Admin/Categories'));
const AdminModeration = lazy(() => import('./pages/Admin/Moderation'));

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <SocketProvider>
          <ThemeProvider>
            <HelmetProvider>
            <Router>
              <ToastContainer />
              <Suspense fallback={<div className="p-6 text-center"><span className="inline-block h-6 w-6 mr-2 align-middle animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></span>Yükleniyor…</div>}>
                <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify/:token" element={<EmailVerification />} />
            <Route path="/ads" element={<Layout><Ads /></Layout>} />
            <Route path="/ads/:id" element={<Layout><AdDetail /></Layout>} />
            <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
            <Route path="/terms" element={<Layout><Terms /></Layout>} />
            <Route path="/contact" element={<Layout><Contact /></Layout>} />
            
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
            <Route path="/my-ads" element={
              <ProtectedRoute>
                <Layout><MyAds /></Layout>
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <Layout><AdminDashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requireAdmin>
                <Layout><AdminUsers /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/ads" element={
              <ProtectedRoute requireAdmin>
                <Layout><AdminAds /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/moderation" element={
              <ProtectedRoute requireAdmin>
                <Layout><AdminModeration /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/categories" element={
              <ProtectedRoute requireAdmin>
                <Layout><AdminCategories /></Layout>
              </ProtectedRoute>
            } />
                </Routes>
              </Suspense>
            </Router>
            </HelmetProvider>
          </ThemeProvider>
        </SocketProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
