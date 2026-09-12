import { money, initials, useAppActions, useAppState } from '../AppContext';
import { avatarStyle, chip, tag } from '../ui';
import { STAGES } from '../data/seed';
import type { Stage } from '../types';

export default function ProspectsScreen() {
  const { prospects, query, filter } = useAppState();
  const { setQuery, setFilter, resetFilters, openProspect, openNew, exportCsv } = useAppActions();

  const rows = prospects.filter((p) => {
    const q = query.trim().toLowerCase();
    const okQ = !q || (p.name + ' ' + p.company + ' ' + p.sub).toLowerCase().includes(q);
    const okF = filter === 'Tous' || p.stage === filter;
    return okQ && okF;
  });

  const filters: Array<Stage | 'Tous'> = ['Tous', ...STAGES.map((s) => s.key)];

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 2px', fontSize: 30, fontWeight: 800, letterSpacing: '-.03em' }}>Prospects</h1>
          <p style={{ margin: 0, fontSize: 14, color: '#5D6B7B' }}>
            {rows.length} prospect{rows.length > 1 ? 's' : ''} affiché{rows.length > 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={exportCsv}
            style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid var(--sg-border-strong)', background: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}
          >
            Exporter CSV
          </button>
          <button
            onClick={openNew}
            style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: 'var(--sg-accent)', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}
          >
            + Ajouter un prospect
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un prospect…"
          style={{ flex: 1, minWidth: 220, maxWidth: 340, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--sg-border-strong)', background: '#fff', fontSize: 13.5, color: '#0F1B2D' }}
        />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={chip(filter === f)}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ borderRadius: 14, background: '#fff', border: '1px solid var(--sg-border)', overflowX: 'auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(210px,2fr) minmax(150px,1.4fr) 130px 120px 110px',
            gap: 12,
            padding: '12px 18px',
            background: '#FAF8F4',
            borderBottom: '1px solid var(--sg-border)',
            fontSize: 11.5,
            fontWeight: 700,
            letterSpacing: '.06em',
            color: '#7A8899',
            minWidth: 760,
          }}
        >
          <div>PROSPECT</div>
          <div>BESOIN</div>
          <div>ÉTAPE</div>
          <div>VALEUR</div>
          <div>SOURCE</div>
        </div>
        {rows.map((r, i) => (
          <button
            key={r.id}
            onClick={() => openProspect(r.id)}
            style={{
              width: '100%',
              textAlign: 'left',
              display: 'grid',
              gridTemplateColumns: 'minmax(210px,2fr) minmax(150px,1.4fr) 130px 120px 110px',
              gap: 12,
              alignItems: 'center',
              padding: '13px 18px',
              border: 'none',
              borderBottom: '1px solid #F1EDE5',
              background: '#fff',
              cursor: 'pointer',
              minWidth: 760,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
              <span style={avatarStyle(r.id + i, 34)}>{initials(r.company === 'Particulier' ? r.name : r.company)}</span>
              <div style={{ minWidth: 0, lineHeight: 1.3 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{r.name}</div>
                <div style={{ fontSize: 12, color: '#7A8899' }}>{r.company}</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: '#5D6B7B', minWidth: 0 }}>{r.sub}</div>
            <div>
              <span style={tag(r.stage)}>{r.stage}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{money(r.value)}</div>
            <div style={{ fontSize: 12.5, color: '#7A8899' }}>{r.source}</div>
          </button>
        ))}
        {rows.length === 0 && (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Aucun prospect ne correspond</div>
            <p style={{ margin: '6px 0 14px', fontSize: 13, color: '#7A8899' }}>Essayez un autre mot-clé ou retirez le filtre d'étape.</p>
            <button
              onClick={resetFilters}
              style={{ padding: '9px 16px', borderRadius: 10, border: '1px solid var(--sg-border-strong)', background: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              Réinitialiser
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
