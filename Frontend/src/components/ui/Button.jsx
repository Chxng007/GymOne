export function Button({ children, variant = 'primary', className, ref, ...props }) {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))',
      color: '#0A0A0A',
      border: 'none',
      fontWeight: 700,
      boxShadow: '0 0 16px rgba(57, 255, 20, 0.25)',
    },
    secondary: {
      background: 'var(--color-surface-alt)',
      color: 'var(--color-text)',
      border: '1px solid var(--color-border-input)',
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
        padding: '10px 16px',
        cursor: 'pointer',
        fontSize: 14,
        fontFamily: 'inherit',
        ...props.style,
      }}
    >
      {children}
    </button>
  )
}
