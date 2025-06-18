
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Exam from "./pages/Exam";
import Results from "./pages/Results";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Exams from "./pages/Exams";
import Statistics from "./pages/Statistics";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import BottomNav from "./components/BottomNav";
import ExamReviewPage from "./pages/ExamReviewPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

// Component to conditionally show BottomNav
const ConditionalBottomNav = () => {
  const location = useLocation();
  
  // Don't show BottomNav on certain pages
  const hideBottomNav = ['/auth', '/login', '/register', '/'].some(path => 
    location.pathname === path
  ) || location.pathname.includes('/exam/');
  
  if (hideBottomNav) {
    return null;
  }
  
  return <BottomNav />;
};

const AppContent = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 rtl">
      {!isOnline && (
        <div className="bg-yellow-500 text-white text-center py-2 px-4 text-sm">
          ⚠️ أنت غير متصل بالإنترنت. بعض الميزات قد لا تعمل بشكل صحيح.
        </div>
      )}

      <Routes>
        {/* صفحة البداية */}
        <Route path="/" element={<Home />} />
        
        {/* صفحة المصادقة */}
        <Route path="/auth" element={<Auth />} />
        
        {/* إعادة توجيه الصفحات القديمة */}
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/register" element={<Navigate to="/auth" replace />} />

        {/* الصفحات المحمية */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/results" element={
          <ProtectedRoute>
            <Layout>
              <Results />
            </Layout>
          </ProtectedRoute>
        } />

        {/* صفحات بدون Layout (استخدام BottomNav) */}
        <Route path="/exams" element={
          <ProtectedRoute>
            <Exams />
          </ProtectedRoute>
        } />

        <Route path="/statistics" element={
          <ProtectedRoute>
            <Statistics />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        {/* صفحات الامتحان (بدون أي layout) */}
        <Route path="/exam/:examId" element={
          <ProtectedRoute>
            <Exam />
          </ProtectedRoute>
        } />

        <Route path="/exam/:examId/review" element={
          <ProtectedRoute>
            <ExamReviewPage />
          </ProtectedRoute>
        } />

        {/* صفحة 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* إظهار BottomNav حسب الحاجة */}
      <ConditionalBottomNav />
      
      {/* Toaster components - moved inside AppContent for proper React context */}
      <Toaster />
      <Sonner />
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
