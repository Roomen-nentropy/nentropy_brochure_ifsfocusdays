import { useState, useEffect } from 'react';
import {
  Route,
  BrowserRouter as Router,
  Routes,
  Navigate,
} from 'react-router-dom';
import type { BusinessType } from './components/BusinessTypeSelector/BusinessTypeSelector';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout/Layout';
import AnimatedRoutes from './components/AnimatedRoutes/AnimatedRoutes';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import PublicSurveyForm from './components/SurveyForm/PublicSurveyForm';
import PublicDDSSurveyForm from './pages/PublicDDSSurveyForm';
import WelcomeDialog from './components/Auth/WelcomeDialog';
import { SettingsProvider } from './contexts/SettingsContext';
import { useSettings } from './hooks/useSettings';
import Auth from './pages/Auth';
import BrochureLanding from './pages/BrochureLanding';
import PublicTrace from './pages/PublicTrace';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import { theme } from './theme';
import { IS_BROCHURE_ONLY } from './config/brochureSite';

import './i18n';

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

const queryClient = new QueryClient();

function AppContent() {
  const { settings, updateSettings, isLoading } = useSettings();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    const isPublicBrochure =
      path === '/brochure' ||
      path.startsWith('/survey') ||
      path.startsWith('/dds-survey') ||
      path.startsWith('/trace/');
    if (
      !isPublicBrochure &&
      !isLoading &&
      settings &&
      !settings.businessType
    ) {
      setShowWelcome(true);
    }
  }, [settings, isLoading]);

  const handleWelcomeComplete = async (businessType: BusinessType) => {
    await updateSettings({ businessType });
    setShowWelcome(false);
  };

  if (IS_BROCHURE_ONLY) {
    return (
      <Router basename={routerBasename}>
        <Routes>
          <Route path="/" element={<BrochureLanding />} />
          <Route path="/brochure" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <>
      <Router basename={routerBasename}>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/brochure" element={<BrochureLanding />} />
          <Route path="/survey/:token" element={<PublicSurveyForm />} />
          <Route path="/dds-survey/:token" element={<PublicDDSSurveyForm />} />
          <Route path="/trace/:token" element={<PublicTrace />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <AnimatedRoutes />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>

      <WelcomeDialog open={showWelcome} onComplete={handleWelcomeComplete} />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppContent />
        </ThemeProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
