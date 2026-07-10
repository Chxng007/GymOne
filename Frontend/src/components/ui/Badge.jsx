const VARIANT_COLORS = {
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
  neutral: 'var(--color-text-muted)',
}

export function Badge({ children, variant = 'neutral' }) {
  const color = VARIANT_COLORS[variant] ?? VARIANT_COLORS.neutral

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        color,
        background: variant === 'neutral' ? 'var(--color-surface-alt)' : `color-mix(in srgb, ${color} 14%, transparent)`,
        border: `1px solid ${variant === 'neutral' ? 'var(--color-border-input)' : `color-mix(in srgb, ${color} 40%, transparent)`}`,
        borderRadius: 999,
        padding: '3px 11px',
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {children}
    </span>
  )
}
