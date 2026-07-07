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
        background: 'var(--color-surface-alt)',
        border: `1px solid ${color}`,
        borderRadius: 999,
        padding: '2px 10px',
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  )
}
