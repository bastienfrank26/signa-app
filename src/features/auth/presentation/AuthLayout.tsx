import type { PropsWithChildren } from 'react';

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--sg-cream-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: 'min(400px,100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'var(--sg-accent)',
              color: '#fff',
              fontWeight: 800,
              fontSize: 17,
            }}
          >
            S
          </span>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.02em' }}>Signa</span>
        </div>
        <div style={{ background: '#fff', border: '1px solid var(--sg-border)', borderRadius: 16, padding: 28 }}>{children}</div>
      </div>
    </div>
  );
}
