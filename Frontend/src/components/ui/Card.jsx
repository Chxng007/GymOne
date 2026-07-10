export function Card({ title, children, style, ...props }) {
  if (!title) {
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
        {children}
      </div>
    )
  }

  const { padding, display, flexDirection, ...restStyle } = style ?? {}
  const isFlex = display === 'flex'

  return (
    <div
      {...props}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        display: display ?? 'block',
        flexDirection,
        ...restStyle,
      }}
    >
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
        <h3 style={{ margin: 0, fontSize: 16.5, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-text)' }}>{title}</h3>
      </div>
      <div style={{ padding: padding ?? 'var(--spacing-4)', display: isFlex ? 'flex' : undefined, flexDirection: isFlex ? flexDirection : undefined, flex: isFlex ? 1 : undefined }}>
        {children}
      </div>
    </div>
  )
}
