import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'sm';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANT_STYLE: Record<ButtonVariant, { background: string; color: string; border: string }> = {
  primary: { background: 'var(--sg-navy-900)', color: '#fff', border: 'none' },
  secondary: { background: '#fff', color: 'var(--sg-navy-900)', border: '1px solid var(--sg-border-strong)' },
  ghost: { background: 'none', color: 'var(--sg-slate-400)', border: 'none' },
  danger: { background: 'var(--sg-danger)', color: '#fff', border: 'none' },
};

/**
 * Bouton du design system Signa (primaire, secondaire, discret, dangereux).
 * Cible tactile min. 44 px en taille par défaut (règle AGENTS.md §6).
 */
export default function Button({ variant = 'secondary', size = 'md', style, disabled, ...rest }: ButtonProps) {
  const v = VARIANT_STYLE[variant];
  return (
    <button
      {...rest}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        minHeight: size === 'sm' ? 36 : 44,
        padding: size === 'sm' ? '8px 14px' : '11px 18px',
        borderRadius: 10,
        fontSize: size === 'sm' ? 13 : 14,
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        background: v.background,
        color: v.color,
        border: v.border,
        ...style,
      }}
    />
  );
}
