export function Progress({ value, max = 100, variant = 'primary' }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100))
  const color = variant === 'primary' ? 'var(--color-primary)' : `var(--color-${variant})`

  return (
    <div
      style={{
        width: '100%',
        height: 8,
        borderRadius: 'var(--radius-sm)',
        background: 'var(--color-surface-alt)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${percent}%`,
          height: '100%',
          background: color,
          transition: 'width 0.2s ease',
        }}
      />
    </div>
  )
}
