import { useState } from 'react';
import { fieldStyle, labelStyle, primaryButtonStyle } from '../../auth/presentation/formStyles';

export default function ReasonDialog({
  title,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  title: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: (reason: string) => Promise<void>;
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    if (!reason.trim()) {
      setError('Un motif est requis.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(reason.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action impossible.');
      setSubmitting(false);
    }
  }

  return (
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(15,27,45,.42)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(420px,100%)', background: '#fff', borderRadius: 16, padding: 24 }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 18, fontWeight: 800 }}>{title}</h3>
        <label style={labelStyle}>
          Motif (obligatoire, consigné à l'audit)
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} style={{ ...fieldStyle, minHeight: 70, resize: 'vertical' }} />
        </label>
        {error && <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--sg-danger)', fontWeight: 600 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ minHeight: 40, padding: '0 14px', borderRadius: 10, border: '1px solid var(--sg-border-strong)', background: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>
            Annuler
          </button>
          <button onClick={() => void handleConfirm()} disabled={submitting} style={primaryButtonStyle}>
            {submitting ? 'En cours…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
