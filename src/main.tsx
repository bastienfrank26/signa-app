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
            <Route element={<RequireOrganization />}>
              <Route path="/*" element={<CrmPrototype />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
