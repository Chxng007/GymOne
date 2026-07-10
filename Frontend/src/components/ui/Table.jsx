export function Table({ columns, data, emptyMessage = 'Sin datos' }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              style={{
                textAlign: 'left',
                padding: 'var(--spacing-2) var(--spacing-3)',
                borderBottom: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
                fontSize: 11.5,
                fontWeight: 700,
                fontFamily: 'var(--font-display)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length}
              style={{
                padding: 'var(--spacing-4)',
                textAlign: 'center',
                color: 'var(--color-text-muted)',
              }}
            >
              {emptyMessage}
            </td>
          </tr>
        ) : (
          data.map((row, rowIndex) => (
            <tr key={row.id ?? rowIndex} className="ui-table-row">
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: 'var(--spacing-2) var(--spacing-3)',
                    borderBottom: '1px solid var(--color-border-subtle)',
                  }}
                >
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}
