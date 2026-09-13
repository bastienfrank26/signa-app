import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CrmPrototype from './App';
import RequireOrganization from './RequireOrganization';
import AcceptInvitationPage from './features/organizations/presentation/AcceptInvitationPage';
import { AuthProvider } from './features/auth/presentation/AuthProvider';
import { RequireAuth, RequireNoAuth } from './features/auth/presentation/guards';
import LoginPage from './features/auth/presentation/LoginPage';
import SignUpPage from './features/auth/presentation/SignUpPage';
import ForgotPasswordPage from './features/auth/presentation/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/presentation/ResetPasswordPage';
import SecurityPage from './features/auth/presentation/SecurityPage';
import RequireStaff from './features/admin/presentation/RequireStaff';
import OrganizationsListPage from './features/admin/presentation/OrganizationsListPage';
import OrganizationDetailPage from './features/admin/presentation/OrganizationDetailPage';
import AuditLogPage from './features/admin/presentation/AuditLogPage';
import PilotMetricsPage from './features/admin/presentation/PilotMetricsPage';
import PortalShell from './features/portal/presentation/PortalShell';
import PortalDashboardPage from './features/portal/presentation/PortalDashboardPage';
import AppLauncherPage from './features/launcher/presentation/AppLauncherPage';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
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
            <Route element={<RequireStaff />}>
              <Route path="/admin/organisations" element={<OrganizationsListPage />} />
              <Route path="/admin/organisations/:organizationId" element={<OrganizationDetailPage />} />
              <Route path="/admin/audit" element={<AuditLogPage />} />
              <Route path="/admin/indicateurs" element={<PilotMetricsPage />} />
            </Route>
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
