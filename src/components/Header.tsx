export default function Header() {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: '14px 28px',
        background: '#FFFFFF',
        borderBottom: '1px solid var(--sg-border)',
      }}
    >
      <div
        style={{
          flex: 1,
          maxWidth: 460,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '9px 14px',
          borderRadius: 10,
          background: 'var(--sg-cream-50)',
          border: '1px solid var(--sg-border)',
          color: 'var(--sg-slate-400)',
          fontSize: 13,
        }}
      >
        <span style={{ fontSize: 13 }}>⌕</span> Rechercher un contact, une tâche, un fichier…
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ position: 'relative', fontSize: 16 }}>
          🔔
          <span
            style={{
              position: 'absolute',
              top: 0,
              right: -1,
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--sg-accent)',
            }}
          />
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#0F1B2D',
              color: '#F5F2EC',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            FR
          </span>
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Francis Roy</div>
            <div style={{ fontSize: 11, color: '#7A8899' }}>Propriétaire</div>
          </div>
        </div>
      </div>
    </header>
  );
}
