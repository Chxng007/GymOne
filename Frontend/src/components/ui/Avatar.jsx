function initialsOf(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function Avatar({ src, name, size = 40, gradient }) {
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
        background: gradient ?? 'linear-gradient(135deg, #38bdf8, #6366f1)',
        color: '#fff',
        fontSize: size * 0.38,
        fontWeight: 700,
      }}
    >
      {initialsOf(name)}
    </div>
  )
}
