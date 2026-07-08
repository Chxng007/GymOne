export function Select({ label, options = [], className, ...props }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
      {label}
      <select
        {...props}
        className={`ui-field ${className ?? ''}`.trim()}
        style={{
          background: 'var(--color-surface-alt)',
          border: '1.5px solid var(--color-border-input)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-text)',
          padding: '10px 12px',
          fontSize: 14,
          fontFamily: 'inherit',
          ...props.style,
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
