import { useState } from 'react';
import { useAppActions } from '../AppContext';
import { useAuth } from '../features/auth/presentation/useAuth';
import { createSupabaseCrmRepository } from '../features/crm/infrastructure/supabase/SupabaseCrmRepository';
import { supabase } from '../infrastructure/supabase/client';

const repository = createSupabaseCrmRepository(supabase);

const inputStyle = {
  padding: '11px 13px',
  borderRadius: 10,
  border: '1px solid var(--sg-border-strong)',
  fontSize: 14,
  fontWeight: 500,
  color: '#0F1B2D',
} as const;

const labelStyle = { display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12.5, fontWeight: 700 } as const;

export default function NewTaskModal({ onClose }: { onClose: () => void }) {
  const { session } = useAuth();
  const { reload } = useAppActions();
  const organizationId = session?.memberships[0]?.organizationId ?? null;
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!label.trim() || !organizationId) {
      setError('Le titre de la tâche est requis.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await repository.createTask(organizationId, {
        label: label.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
        urgent,
      });
      await reload();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'La tâche n’a pas pu être créée.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,27,45,.42)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 50 }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(420px,100%)', background: '#fff', borderRadius: 16, padding: 24, animation: 'sgIn .18s ease both' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, letterSpacing: '-.02em' }}>Ajouter une tâche</h3>
        <p style={{ margin: '0 0 18px', fontSize: 13, color: '#7A8899' }}>Assignée à vous par défaut.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={labelStyle}>
            Titre
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Rappeler le client" style={inputStyle} />
          </label>
          <label style={labelStyle}>
            Description
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optionnel" style={inputStyle} />
          </label>
          <label style={labelStyle}>
            Échéance
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
            <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />
            Urgent
          </label>
          {error && <div style={{ fontSize: 12.5, color: '#C0392B', fontWeight: 600 }}>{error}</div>}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ minHeight: 44, padding: '0 16px', borderRadius: 10, border: '1px solid var(--sg-border-strong)', background: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}
          >
            Annuler
          </button>
          <button
            onClick={() => void submit()}
            disabled={submitting}
            style={{ minHeight: 44, padding: '0 18px', borderRadius: 10, border: 'none', background: 'var(--sg-accent)', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? 'Ajout…' : 'Ajouter la tâche'}
          </button>
        </div>
      </div>
    </div>
  );
}
