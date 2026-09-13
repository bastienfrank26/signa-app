import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CrmPrototype from './App';
import RequireOrganization from './RequireOrganization';
import AcceptInvitationPage from './features/organizations/presentation/AcceptInvitationPage';
import { AuthProvider, RequireAuth, RequireNoAuth } from '@signa/sdk';
import { supabase } from './infrastructure/supabase/client';
import LoginPage from './features/auth/presentation/LoginPage';
import SignUpPage from './features/auth/presentation/SignUpPage';
import ForgotPasswordPage from './features/auth/presentation/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/presentation/ResetPasswordPage';
import SecurityPage from './features/auth/presentation/SecurityPage';
import PortalShell from './features/portal/presentation/PortalShell';
import PortalDashboardPage from './features/portal/presentation/PortalDashboardPage';
import AppLauncherPage from './features/launcher/presentation/AppLauncherPage';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider client={supabase}>
        <Routes>
          <Route path="/reinitialiser-mot-de-passe" element={<ResetPasswordPage />} />
          <Route element={<RequireNoAuth />}>
            <Route path="/connexion" element={<LoginPage />} />
            <Route path="/inscription" element={<SignUpPage />} />
            <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
          </Route>
          <Route element={<RequireAuth />}>
            <Route path="/parametres/securite" element={<SecurityPage />} />
            <Route path="/accepter-invitation" element={<AcceptInvitationPage />} />
            <Route element={<RequireOrganization />}>
              <Route path="/crm/*" element={<CrmPrototype />} />
              <Route element={<PortalShell />}>
                <Route path="/" element={<PortalDashboardPage />} />
                <Route path="/applications" element={<AppLauncherPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
