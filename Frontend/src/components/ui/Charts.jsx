import { motion } from 'framer-motion'

function buildPath(values, width, height, padding = 4) {
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = max - min || 1
  const stepX = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0

  return values.map((v, i) => {
    const x = padding + i * stepX
    const y = padding + (1 - (v - min) / range) * (height - padding * 2)
    return { x, y }
  })
}

export function Sparkline({ data, width = 96, height = 32, color = 'var(--color-primary)' }) {
  const points = buildPath(data, width, height, 2)
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <motion.path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </svg>
  )
}

export function AreaChart({ data, height = 200, color = 'var(--color-primary)', formatValue = (v) => v }) {
  const width = 640
  const padding = 28
  const values = data.map((d) => d.value)
  const points = buildPath(values, width, height, padding)
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = `${linePath} L${points[points.length - 1]?.x ?? 0},${height - padding} L${points[0]?.x ?? 0},${height - padding} Z`
  const gradientId = 'area-gradient'

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={padding}
          x2={width - padding}
          y1={padding + f * (height - padding * 2)}
          y2={padding + f * (height - padding * 2)}
          stroke="var(--color-border)"
          strokeDasharray="4 4"
        />
      ))}
      <motion.path
        d={areaPath}
        fill={`url(#${gradientId})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      />
      <motion.path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 6px ${color}90)` }}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
      />
      {points.map((p, i) => (
        <motion.g
          key={data[i].label}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 + i * 0.06, duration: 0.3 }}
        >
          <circle cx={p.x} cy={p.y} r={4} fill="var(--color-bg)" stroke={color} strokeWidth={2} />
          <text x={p.x} y={p.y - 12} textAnchor="middle" fill="var(--color-text)" fontSize="11" fontWeight="700" fontFamily="Inter, sans-serif">
            {formatValue(data[i].value)}
          </text>
          <text x={p.x} y={height - 6} textAnchor="middle" fill="var(--color-text-muted)" fontSize="10.5" fontFamily="Inter, sans-serif">
            {data[i].label}
          </text>
        </motion.g>
      ))}
    </svg>
  )
}

export function BarChart({ data, height = 160, color = 'var(--color-primary)' }) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--spacing-4)', height, padding: '0 var(--spacing-2)' }}>
      {data.map((item) => (
        <div
          key={item.label}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 10, height: '100%', justifyContent: 'flex-end' }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>
            ${Number(item.value).toLocaleString('es-CO')}
          </span>
          <div
            title={String(item.value)}
            style={{
              width: 44,
              height: `${(item.value / max) * (height - 48)}px`,
              background: `linear-gradient(180deg, ${item.gradientFrom ?? color}, ${item.gradientTo ?? color})`,
              borderRadius: '10px 10px 4px 4px',
              boxShadow: `0 0 18px ${item.glow ?? 'transparent'}`,
              minHeight: 2,
            }}
          />
          <span style={{ fontSize: 12.5, color: 'var(--color-text-muted)', fontWeight: 500 }}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

export function DonutChart({ data, size = 132, strokeWidth = 16 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const primaryValue = data[0]?.value ?? 0
  const primaryPct = Math.round((primaryValue / total) * 100)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={data[0]?.color ?? 'var(--color-primary)'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${(primaryValue / total) * circumference} ${circumference}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: 'drop-shadow(0 0 8px rgba(57,255,20,0.5))', transition: 'stroke-dasharray 400ms ease' }}
        />
        <text x={size / 2} y={size / 2 - 6} textAnchor="middle" fill="var(--color-text)" fontSize="24" fontWeight="800" fontFamily="Inter, sans-serif">
          {primaryPct}%
        </text>
        <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fill="var(--color-text-muted)" fontSize="11.5" fontFamily="Inter, sans-serif">
          {data[0]?.label ?? ''}
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {data.map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: item.color ?? 'var(--color-border-input)',
                boxShadow: item.color ? `0 0 6px ${item.color}99` : 'none',
              }}
            />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.2, color: 'var(--color-text)' }}>{item.value}</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{item.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
