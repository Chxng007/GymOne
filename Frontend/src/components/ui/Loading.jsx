export function Loading({ size = 24 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: '3px solid var(--color-surface-alt)',
        borderTopColor: 'var(--color-primary)',
        borderRadius: '50%',
        animation: 'ui-spin 0.7s linear infinite',
      }}
    />
  )
}
