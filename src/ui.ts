import type { CSSProperties } from 'react';

const AVATAR_COLORS = ['#0F1B2D', '#E8521A', '#2B6CB0', '#1F7A5C', '#6B46C1', '#B4740E'];

export function navStyle(active: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    width: '100%',
    textAlign: 'left',
    padding: '10px 12px',
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: active ? 700 : 500,
    background: active ? 'var(--sg-side-active)' : 'transparent',
    color: 'var(--sg-side-fg)',
    minHeight: 42,
  };
}

export function pill(active: boolean): CSSProperties {
  return {
    padding: '8px 14px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontSize: 12.5,
    fontWeight: 700,
    background: active ? '#0F1B2D' : 'transparent',
    color: active ? '#fff' : '#5D6B7B',
  };
}

export function chip(active: boolean, color?: string): CSSProperties {
  return {
    padding: '8px 13px',
    borderRadius: 999,
    cursor: 'pointer',
    fontSize: 12.5,
    fontWeight: 700,
    border: '1px solid ' + (active ? '#0F1B2D' : 'var(--sg-border-strong)'),
    background: active ? '#0F1B2D' : '#fff',
    color: active ? '#fff' : color || '#5D6B7B',
  };
}

export function tag(color: string): CSSProperties {
  const c = color;
  return {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: 999,
    fontSize: 11.5,
    fontWeight: 700,
    color: c,
    background: c + '1A',
  };
}

export function avatarStyle(idx: number, size = 34): CSSProperties {
  const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 'none',
    width: size,
    height: size,
    borderRadius: '50%',
    background: color,
    color: '#fff',
    fontSize: size < 30 ? 10 : 12,
    fontWeight: 700,
  };
}

export function chipTag(color: string): CSSProperties {
  return {
    alignSelf: 'flex-start',
    padding: '3px 9px',
    borderRadius: 999,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: '.07em',
    color,
    background: color + '1A',
  };
}
