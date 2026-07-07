import { useState } from 'react'

export function Tabs({ items, defaultActiveKey }) {
  const [activeKey, setActiveKey] = useState(defaultActiveKey ?? items[0]?.key)
  const active = items.find((item) => item.key === activeKey)

  return (
    <div>
      <div style={{ display: 'flex', gap: 'var(--spacing-2)', borderBottom: '1px solid var(--color-border)' }}>
        {items.map((item) => {
          const isActive = item.key === activeKey
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveKey(item.key)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
                padding: 'var(--spacing-2) var(--spacing-3)',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              {item.label}
            </button>
          )
        })}
      </div>
      <div style={{ paddingTop: 'var(--spacing-3)' }}>{active?.content}</div>
    </div>
  )
}
