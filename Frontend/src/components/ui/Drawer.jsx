export function Drawer({ open, onClose, title, children }) {
  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          height: '100%',
          width: 360,
          maxWidth: '90vw',
          background: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border)',
          padding: 'var(--spacing-4)',
          overflowY: 'auto',
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
