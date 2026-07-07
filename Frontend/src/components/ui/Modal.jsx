export function Modal({ open, onClose, title, children }) {
  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-4)',
          minWidth: 320,
          maxWidth: '90vw',
        }}
      >
        {title && (
          <h2 style={{ margin: '0 0 var(--spacing-3)', fontSize: 18 }}>{title}</h2>
        )}
        {children}
      </div>
    </div>
  )
}
