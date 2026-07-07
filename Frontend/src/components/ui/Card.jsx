export function Card({ title, children, style, ...props }) {
  return (
    <div
      {...props}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-4)',
        ...style,
      }}
    >
      {title && (
        <h3 style={{ margin: '0 0 var(--spacing-3)', fontSize: 16 }}>{title}</h3>
      )}
      {children}
    </div>
  )
}
