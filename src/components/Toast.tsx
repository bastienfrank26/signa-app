import { useAppState } from '../AppContext';

export default function Toast() {
  const { toast } = useAppState();
  if (!toast) return null;
  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 26,
        transform: 'translateX(-50%)',
        zIndex: 60,
        background: '#0F1B2D',
        color: '#F5F2EC',
        padding: '13px 20px',
        borderRadius: 12,
        fontSize: 13.5,
        fontWeight: 600,
        boxShadow: '0 12px 30px rgba(15,27,45,.28)',
        animation: 'sgIn .2s ease both',
      }}
    >
      {toast}
    </div>
  );
}
