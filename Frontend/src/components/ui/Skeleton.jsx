export function Skeleton({ width = '100%', height = 16 }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 'var(--radius-sm)',
        background: 'var(--color-surface-alt)',
        animation: 'ui-pulse 1.2s ease-in-out infinite',
      }}
    />
  )
}
