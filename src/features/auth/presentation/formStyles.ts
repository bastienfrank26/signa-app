import type { CSSProperties } from 'react';

export const labelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 5,
  fontSize: 12.5,
  fontWeight: 700,
};

export const fieldStyle: CSSProperties = {
  padding: '11px 13px',
  borderRadius: 10,
  border: '1px solid var(--sg-border-strong)',
  fontSize: 14,
  fontWeight: 500,
  color: 'var(--sg-navy-900)',
};

export const primaryButtonStyle: CSSProperties = {
  minHeight: 44,
  padding: '0 18px',
  borderRadius: 10,
  border: 'none',
  background: 'var(--sg-navy-900)',
  color: '#fff',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
};
