import { createContext, useContext, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const TransitionContext = createContext(null)

export function TransitionProvider({ children }) {
  const [state, setState] = useState(null)
  const resolveCoverRef = useRef(null)
  const resolveRevealRef = useRef(null)

  function cover(origin, color) {
    return new Promise((resolve) => {
      resolveCoverRef.current = resolve
      setState({ origin, color: color ?? 'linear-gradient(135deg, #39FF14, #2FE010)', phase: 'covering' })
    })
  }

  function reveal() {
    return new Promise((resolve) => {
      resolveRevealRef.current = resolve
      setState((current) => (current ? { ...current, phase: 'revealing' } : current))
    })
  }

  function handleAnimationComplete() {
    if (!state) return
    if (state.phase === 'covering') {
      resolveCoverRef.current?.()
    } else {
      resolveRevealRef.current?.()
      setState(null)
    }
  }

  return (
    <TransitionContext.Provider value={{ cover, reveal }}>
      {children}
      {state && (
        <motion.div
          initial={{ clipPath: `circle(0px at ${state.origin.x}px ${state.origin.y}px)` }}
          animate={{
            clipPath:
              state.phase === 'covering'
                ? `circle(150% at ${state.origin.x}px ${state.origin.y}px)`
                : `circle(0px at ${state.origin.x}px ${state.origin.y}px)`,
          }}
          transition={{ duration: 0.65, ease: [0.65, 0, 0.35, 1] }}
          onAnimationComplete={handleAnimationComplete}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: state.color,
            pointerEvents: 'none',
          }}
        />
      )}
    </TransitionContext.Provider>
  )
}

export function useTransition() {
  const context = useContext(TransitionContext)
  if (!context) {
    throw new Error('useTransition debe usarse dentro de TransitionProvider')
  }
  return context
}
