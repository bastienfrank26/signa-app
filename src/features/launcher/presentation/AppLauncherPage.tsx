import AppLauncher from './AppLauncher';

export default function AppLauncherPage() {
  return (
    <div>
      <h1 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 800, letterSpacing: '-.02em' }}>Applications</h1>
      <p style={{ margin: 0, fontSize: 13.5, color: 'var(--sg-text-muted)' }}>Vos applications Signa, incluses ou disponibles en ajout.</p>
      <AppLauncher />
    </div>
  );
}
