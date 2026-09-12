import { AppProvider, useAppActions, useAppState } from './AppContext';
import { pillDark } from './ui';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HomeScreen from './components/HomeScreen';
import ProspectsScreen from './components/ProspectsScreen';
import PipelineScreen from './components/PipelineScreen';
import StubScreen from './components/StubScreen';
import ProjectDashboardPage from './features/portal/presentation/ProjectDashboardPage';
import MobileView from './components/MobileView';
import ProspectDrawer from './components/ProspectDrawer';
import NewProspectModal from './components/NewProspectModal';
import Toast from './components/Toast';

function DeviceToggle() {
  const { device } = useAppState();
  const { setDevice } = useAppActions();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '10px 20px',
        background: '#0F1B2D',
        color: '#F5F2EC',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, letterSpacing: '.02em' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 20,
            height: 20,
            borderRadius: 6,
            background: 'var(--sg-accent)',
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          S
        </span>
        Signa
        <span style={{ padding: '3px 8px', borderRadius: 999, background: '#1D2E42', color: '#8899AA', fontSize: 11, fontWeight: 600 }}>
          Données de démonstration
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1D2E42', padding: 4, borderRadius: 10 }}>
        <button onClick={() => setDevice('desktop')} style={pillDark(device === 'desktop')}>
          Bureau
        </button>
        <button onClick={() => setDevice('mobile')} style={pillDark(device === 'mobile')}>
          Mobile 320 px
        </button>
      </div>
    </div>
  );
}

function MainScreen() {
  const { screen } = useAppState();
  if (screen === 'accueil') return <HomeScreen />;
  if (screen === 'prospects') return <ProspectsScreen />;
  if (screen === 'pipeline') return <PipelineScreen />;
  if (screen === 'projet') return <ProjectDashboardPage />;
  return <StubScreen />;
}

function DesktopLayout() {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', minHeight: 'calc(100vh - 44px)' }}>
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div style={{ flex: 1, padding: '26px 28px 40px' }}>
          <MainScreen />
        </div>
      </main>
    </div>
  );
}

function Shell() {
  const { device, selectedId } = useAppState();
  return (
    <div style={{ minHeight: '100vh', background: 'var(--sg-cream-50)' }}>
      <DeviceToggle />
      {device === 'desktop' ? <DesktopLayout /> : <MobileView />}
      {selectedId != null && <ProspectDrawer />}
      <NewProspectModal />
      <Toast />
    </div>
  );
}

export default function CrmPrototype() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
