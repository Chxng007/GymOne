export function Button({ children, variant = 'primary', className, ref, ...props }) {
  const variants = {
    primary: {
      background: 'var(--color-primary)',
      color: 'var(--color-primary-on)',
      border: 'none',
      fontWeight: 700,
    },
    secondary: {
      background: 'var(--color-surface)',
      color: 'var(--color-text-secondary)',
      border: '1px solid var(--color-border-input)',
      fontWeight: 600,
    },
    danger: {
      background: 'transparent',
      color: 'var(--color-danger)',
      border: '1px solid var(--color-danger)',
      fontWeight: 600,
    },
  }

  return (
    <button
      ref={ref}
      {...props}
      className={variant === 'primary' ? `ui-btn-primary ${className ?? ''}`.trim() : className}
      style={{
        ...variants[variant],
        borderRadius: 'var(--radius-sm)',
        padding: '11px 18px',
        cursor: 'pointer',
        fontSize: 14,
        fontFamily: 'inherit',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        ...props.style,
      }}
    >
      {children}
    </button>
  )
}
