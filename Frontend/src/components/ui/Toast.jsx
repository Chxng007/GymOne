const VARIANT_COLORS = {
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
  neutral: 'var(--color-text-muted)',
}

export function ToastStack({ toasts }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'var(--spacing-4)',
        right: 'var(--spacing-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-2)',
        zIndex: 200,
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            background: 'var(--color-surface)',
            border: `1px solid ${VARIANT_COLORS[toast.variant] ?? VARIANT_COLORS.neutral}`,
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-3)',
            minWidth: 240,
            color: 'var(--color-text)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
