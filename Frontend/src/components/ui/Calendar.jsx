import { useState } from 'react'

const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function mondayIndex(dayOfWeek) {
  return (dayOfWeek + 6) % 7
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function Calendar({ value, onChange }) {
  const [cursor, setCursor] = useState(value ?? new Date())
  const year = cursor.getFullYear()
  const month = cursor.getMonth()

  const totalDays = daysInMonth(year, month)
  const firstDayOffset = mondayIndex(new Date(year, month, 1).getDay())
  const cells = [
    ...Array.from({ length: firstDayOffset }, () => null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]

  function changeMonth(delta) {
    setCursor(new Date(year, month + delta, 1))
  }

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--spacing-3)',
        width: 280,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2)' }}>
        <button type="button" onClick={() => changeMonth(-1)} style={navButtonStyle}>
          ‹
        </button>
        <strong style={{ fontSize: 14 }}>
          {cursor.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
        </strong>
        <button type="button" onClick={() => changeMonth(1)} style={navButtonStyle}>
          ›
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {WEEKDAYS.map((day) => (
          <div key={day} style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-text-muted)' }}>
            {day}
          </div>
        ))}

        {cells.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} />

          const date = new Date(year, month, day)
          const isSelected = value && isSameDay(date, value)

          return (
            <button
              key={day}
              type="button"
              onClick={() => onChange?.(date)}
              style={{
                background: isSelected ? 'var(--color-primary)' : 'transparent',
                color: isSelected ? '#fff' : 'var(--color-text)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 0',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const navButtonStyle = {
  background: 'var(--color-surface-alt)',
  border: '1px solid var(--color-border)',
  color: 'var(--color-text)',
  borderRadius: 'var(--radius-sm)',
  width: 28,
  height: 28,
  cursor: 'pointer',
}
