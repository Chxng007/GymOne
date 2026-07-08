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
        background: variant === 'neutral' ? 'var(--color-surface-alt)' : `color-mix(in srgb, ${color} 10%, transparent)`,
        border: `1px solid ${variant === 'neutral' ? 'var(--color-border-input)' : color}`,
        borderRadius: 999,
        padding: '3px 12px',
        fontSize: 12.5,
        fontWeight: 700,
      }}
    >
      {children}
    </span>
  )
}
