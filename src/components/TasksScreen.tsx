import { useState } from 'react';
import { useAppActions, useAppState } from '../AppContext';
import { formatNextFollowUp } from '../features/crm/domain/format';
import { chip } from '../ui';
import NewTaskModal from './NewTaskModal';

type Filter = 'toutes' | 'a-faire' | 'terminees' | 'retard';

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate + 'T00:00:00') < today;
}

export default function TasksScreen() {
  const { tasks } = useAppState();
  const { toggleTask } = useAppActions();
  const [filter, setFilter] = useState<Filter>('a-faire');
  const [newOpen, setNewOpen] = useState(false);

  const rows = tasks.filter((t) => {
    if (filter === 'a-faire') return !t.done;
    if (filter === 'terminees') return t.done;
    if (filter === 'retard') return !t.done && isOverdue(t.dueDate);
    return true;
  });
  const leftCount = tasks.filter((t) => !t.done).length;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 2px', fontSize: 30, fontWeight: 800, letterSpacing: '-.03em' }}>Tâches</h1>
          <p style={{ margin: 0, fontSize: 14, color: '#5D6B7B' }}>{leftCount} à faire</p>
        </div>
        <button
          onClick={() => setNewOpen(true)}
          style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: 'var(--sg-accent)', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}
        >
          + Ajouter une tâche
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        <button onClick={() => setFilter('a-faire')} style={chip(filter === 'a-faire')}>
          À faire
        </button>
        <button onClick={() => setFilter('retard')} style={chip(filter === 'retard')}>
          En retard
        </button>
        <button onClick={() => setFilter('terminees')} style={chip(filter === 'terminees')}>
          Terminées
        </button>
        <button onClick={() => setFilter('toutes')} style={chip(filter === 'toutes')}>
          Toutes
        </button>
      </div>

      <div style={{ borderRadius: 14, background: '#fff', border: '1px solid var(--sg-border)' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {rows.map((t) => {
            const overdue = !t.done && isOverdue(t.dueDate);
            return (
              <div
                key={t.id}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid #F1EDE5' }}
              >
                <button
                  onClick={() => toggleTask(t.id)}
                  style={{
                    width: 24,
                    height: 24,
                    flex: 'none',
                    borderRadius: 7,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid ' + (t.done ? '#1F7A5C' : '#CFC8BB'),
                    background: t.done ? '#1F7A5C' : '#fff',
                    color: '#fff',
                  }}
                >
                  {t.done ? '✓' : ''}
                </button>
                <div style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#9AA6B2' : undefined }}>
                    {t.label}
                  </div>
                  {t.description && <div style={{ fontSize: 12.5, color: '#7A8899' }}>{t.description}</div>}
                </div>
                {t.urgent && !t.done && (
                  <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.05em', color: '#C0392B', background: '#C0392B18', padding: '4px 9px', borderRadius: 999 }}>
                    URGENT
                  </span>
                )}
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 999,
                    whiteSpace: 'nowrap',
                    color: overdue ? '#C0392B' : '#6B7888',
                    background: overdue ? '#C0392B18' : '#F1EDE5',
                  }}
                >
                  {formatNextFollowUp(t.dueDate)}
                </span>
              </div>
            );
          })}
          {rows.length === 0 && (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Aucune tâche ici</div>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: '#7A8899' }}>Changez de filtre ou ajoutez une tâche.</p>
            </div>
          )}
        </div>
      </div>

      {newOpen && <NewTaskModal onClose={() => setNewOpen(false)} />}
    </div>
  );
}
