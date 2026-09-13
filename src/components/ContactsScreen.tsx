import { useState } from 'react';
import { initials } from '../AppContext';
import { avatarStyle, tag } from '../ui';
import { useAuth } from '@signa/sdk';
import { useContacts } from '../features/crm/presentation/useContacts';
import NewContactModal from './NewContactModal';
import ContactDrawer from './ContactDrawer';

function useOrganizationId(): string | null {
  const { session } = useAuth();
  return session?.memberships[0]?.organizationId ?? null;
}

export default function ContactsScreen() {
  const organizationId = useOrganizationId();
  const { contacts, loading, error, reload } = useContacts(organizationId);
  const [query, setQuery] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = contacts.filter((c) => {
    const q = query.trim().toLowerCase();
    return !q || (c.name + ' ' + c.companyName + ' ' + c.email).toLowerCase().includes(q);
  });

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 2px', fontSize: 30, fontWeight: 800, letterSpacing: '-.03em' }}>Contacts</h1>
          <p style={{ margin: 0, fontSize: 14, color: '#5D6B7B' }}>
            {rows.length} contact{rows.length > 1 ? 's' : ''} affiché{rows.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setNewOpen(true)}
          style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: 'var(--sg-accent)', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}
        >
          + Ajouter un contact
        </button>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher un contact…"
        style={{ width: '100%', maxWidth: 340, marginBottom: 14, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--sg-border-strong)', background: '#fff', fontSize: 13.5, color: '#0F1B2D' }}
      />

      {loading && <div style={{ color: 'var(--sg-text-muted)' }}>Chargement…</div>}
      {error && <div style={{ color: 'var(--sg-danger)' }}>{error}</div>}

      {!loading && !error && (
        <div style={{ borderRadius: 14, background: '#fff', border: '1px solid var(--sg-border)', overflowX: 'auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(210px,2fr) minmax(150px,1.4fr) 140px',
              gap: 12,
              padding: '12px 18px',
              background: '#FAF8F4',
              borderBottom: '1px solid var(--sg-border)',
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: '.06em',
              color: '#7A8899',
              minWidth: 600,
            }}
          >
            <div>CONTACT</div><div>COURRIEL</div><div>SOURCE</div>
          </div>
          {rows.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                display: 'grid',
                gridTemplateColumns: 'minmax(210px,2fr) minmax(150px,1.4fr) 140px',
                gap: 12,
                alignItems: 'center',
                padding: '13px 18px',
                border: 'none',
                borderBottom: '1px solid #F1EDE5',
                background: '#fff',
                cursor: 'pointer',
                minWidth: 600,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                <span style={avatarStyle(i, 34)}>{initials(c.companyName || c.name)}</span>
                <div style={{ minWidth: 0, lineHeight: 1.3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{c.name}</div>
                    {c.lifecycleStatus === 'client' && <span style={tag('#1F7A5C')}>Client</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#7A8899' }}>{c.companyName || '—'}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#5D6B7B', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email || '—'}</div>
              <div style={{ fontSize: 12.5, color: '#7A8899' }}>{c.source || '—'}</div>
            </button>
          ))}
          {rows.length === 0 && (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Aucun contact ne correspond</div>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: '#7A8899' }}>Essayez un autre mot-clé ou ajoutez un contact.</p>
            </div>
          )}
        </div>
      )}

      {newOpen && <NewContactModal onClose={() => setNewOpen(false)} onCreated={reload} />}
      {selectedId && <ContactDrawer contactId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
