export function BarChart({ data, height = 160, color = 'var(--color-primary)' }) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--spacing-2)', height }}>
      {data.map((item) => (
        <div
          key={item.label}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 6 }}
        >
          <div
            title={String(item.value)}
            style={{
              width: '100%',
              height: `${(item.value / max) * (height - 24)}px`,
              background: color,
              borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
              minHeight: 2,
            }}
          />
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}
