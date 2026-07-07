export function Button({ children, variant = 'primary', ...props }) {
  const variants = {
    primary: { background: 'var(--color-primary)', color: '#fff', border: 'none' },
    secondary: {
      background: 'var(--color-surface-alt)',
      color: 'var(--color-text)',
      border: '1px solid var(--color-border)',
    },
  }

  return (
    <button
      {...props}
      style={{
        ...variants[variant],
        borderRadius: 'var(--radius-sm)',
        padding: '10px 16px',
        cursor: 'pointer',
        fontSize: 14,
        ...props.style,
      }}
    >
      {children}
    </button>
  )
}
