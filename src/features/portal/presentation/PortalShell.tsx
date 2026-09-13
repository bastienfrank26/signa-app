import { Outlet } from 'react-router-dom';
import PortalSidebar from './PortalSidebar';
import Header from '../../../components/Header';

export default function PortalShell() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--sg-cream-50)' }}>
      <div style={{ display: 'flex', alignItems: 'stretch', minHeight: '100vh' }}>
        <PortalSidebar />
        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Header />
          <div className="sg-main-content" style={{ flex: 1, padding: 24 }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
