import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CrmPrototype from './App';
import RequireOrganization from './RequireOrganization';
import { AuthProvider } from './features/auth/presentation/AuthProvider';
import { RequireAuth, RequireNoAuth } from './features/auth/presentation/guards';
import LoginPage from './features/auth/presentation/LoginPage';
import SignUpPage from './features/auth/presentation/SignUpPage';
import ForgotPasswordPage from './features/auth/presentation/ForgotPasswordPage';
import SecurityPage from './features/auth/presentation/SecurityPage';
import RequireStaff from './features/admin/presentation/RequireStaff';
import OrganizationsListPage from './features/admin/presentation/OrganizationsListPage';
import OrganizationDetailPage from './features/admin/presentation/OrganizationDetailPage';
import AuditLogPage from './features/admin/presentation/AuditLogPage';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<RequireNoAuth />}>
            <Route path="/connexion" element={<LoginPage />} />
            <Route path="/inscription" element={<SignUpPage />} />
            <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
          </Route>
          <Route element={<RequireAuth />}>
            <Route path="/parametres/securite" element={<SecurityPage />} />
            <Route element={<RequireStaff />}>
              <Route path="/admin/organisations" element={<OrganizationsListPage />} />
              <Route path="/admin/organisations/:organizationId" element={<OrganizationDetailPage />} />
              <Route path="/admin/audit" element={<AuditLogPage />} />
            </Route>
            <Route element={<RequireOrganization />}>
              <Route path="/*" element={<CrmPrototype />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
