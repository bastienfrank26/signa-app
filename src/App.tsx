import { AppProvider, useAppState } from './AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MobileNav from './components/MobileNav';
import HomeScreen from './components/HomeScreen';
import ProspectsScreen from './components/ProspectsScreen';
import PipelineScreen from './components/PipelineScreen';
import ContactsScreen from './components/ContactsScreen';
import StubScreen from './components/StubScreen';
import ProjectDashboardPage from './features/portal/presentation/ProjectDashboardPage';
import ProspectDrawer from './components/ProspectDrawer';
import NewProspectModal from './components/NewProspectModal';
import Toast from './components/Toast';

function MainScreen() {
  const { screen } = useAppState();
  if (screen === 'accueil') return <HomeScreen />;
  if (screen === 'prospects') return <ProspectsScreen />;
  if (screen === 'pipeline') return <PipelineScreen />;
  if (screen === 'contacts') return <ContactsScreen />;
  if (screen === 'projet') return <ProjectDashboardPage />;
  return <StubScreen />;
}

function Shell() {
  const { selectedId } = useAppState();
  return (
    <div style={{ minHeight: '100vh', background: 'var(--sg-cream-50)' }}>
      <div style={{ display: 'flex', alignItems: 'stretch', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Header />
          <div className="sg-main-content" style={{ flex: 1 }}>
            <MainScreen />
          </div>
        </main>
      </div>
      <MobileNav />
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
