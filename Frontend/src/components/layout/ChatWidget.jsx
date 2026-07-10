import { useEffect, useRef, useState } from 'react'
import { preguntarAsistente } from '../../services/asistenteService'

const SUGERENCIAS = [
  '¿Cuánto falta para la meta de ingresos del mes?',
  '¿Cuántos clientes entraron hoy?',
  '¿Cuántos clientes están vencidos?',
]

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [mensajes, setMensajes] = useState([])
  const [pregunta, setPregunta] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [mensajes, loading])

  async function enviar(texto) {
    const contenido = texto ?? pregunta
    if (!contenido.trim() || loading) return

    setMensajes((current) => [...current, { role: 'user', texto: contenido }])
    setPregunta('')
    setLoading(true)
    try {
      const data = await preguntarAsistente(contenido)
      setMensajes((current) => [...current, { role: 'assistant', texto: data.respuesta }])
    } catch (err) {
      const msg = err.response?.data?.error ?? 'No se pudo consultar al asistente. Intenta de nuevo.'
      setMensajes((current) => [...current, { role: 'assistant', texto: msg }])
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    enviar()
  }

  return (
    <>
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 92,
            right: 24,
            width: 360,
            maxWidth: 'calc(100vw - 48px)',
            height: 480,
            maxHeight: 'calc(100vh - 140px)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
            zIndex: 300,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 9,
                background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00243a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>Asistente GymOne</div>
            <div style={{ flex: 1 }} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 4 }}
            >
              ×
            </button>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mensajes.length === 0 && (
              <div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 13, margin: '0 0 12px' }}>
                  Pregúntame sobre ingresos, clientes, asistencia o cualquier dato registrado en la plataforma.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {SUGERENCIAS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => enviar(s)}
                      style={{
                        textAlign: 'left',
                        background: 'var(--color-surface-alt)',
                        border: '1px solid var(--color-border-input)',
                        borderRadius: 10,
                        padding: '10px 12px',
                        color: 'var(--color-text-secondary)',
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mensajes.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: m.role === 'user' ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                  color: m.role === 'user' ? 'var(--color-primary-on)' : 'var(--color-text)',
                  borderRadius: 12,
                  padding: '10px 13px',
                  fontSize: 13.5,
                  lineHeight: 1.45,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.texto}
              </div>
            ))}

            {loading && (
              <div style={{ alignSelf: 'flex-start', color: 'var(--color-text-muted)', fontSize: 13 }}>Pensando...</div>
            )}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, padding: 14, borderTop: '1px solid var(--color-border)' }}>
            <input
              value={pregunta}
              onChange={(e) => setPregunta(e.target.value)}
              placeholder="Escribe tu pregunta..."
              style={{
                flex: 1,
                background: 'var(--color-input-bg)',
                border: '1.5px solid var(--color-border-input)',
                borderRadius: 10,
                color: 'var(--color-text)',
                padding: '10px 12px',
                fontSize: 13.5,
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={loading || !pregunta.trim()}
              style={{
                background: 'var(--color-primary)',
                color: 'var(--color-primary-on)',
                border: 'none',
                borderRadius: 10,
                width: 38,
                height: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                opacity: loading || !pregunta.trim() ? 0.6 : 1,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Asistente"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
          border: 'none',
          boxShadow: '0 8px 20px rgba(56,189,248,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 300,
        }}
      >
        {open ? (
          <span style={{ color: '#00243a', fontSize: 24, lineHeight: 1 }}>×</span>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00243a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        )}
      </button>
    </>
  )
}
