function initialsOf(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function Avatar({ src, name, size = 40 }) {
  const dimension = { width: size, height: size, borderRadius: '50%' }

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ ...dimension, objectFit: 'cover' }}
      />
    )
  }

  return (
    <div
      style={{
        ...dimension,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-surface-alt)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
        fontSize: size * 0.4,
        fontWeight: 600,
      }}
    >
      {initialsOf(name)}
    </div>
  )
}
