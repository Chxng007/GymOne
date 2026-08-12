import { motion } from 'framer-motion'

const PULSE = ['0 0 16px rgba(56,189,248,0.45)', '0 0 28px rgba(56,189,248,0.7)', '0 0 16px rgba(56,189,248,0.45)']

export function LogoMark({ size = 34, animated = true, style }) {
  const Wrapper = animated ? motion.div : 'div'
  const animation = animated
    ? { animate: { boxShadow: PULSE }, transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }
    : {}

  return (
    <Wrapper
      {...animation}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.27,
        background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...style,
      }}
    >
      <div style={{ width: size * 0.35, height: size * 0.35, background: 'var(--color-bg)', borderRadius: 3, transform: 'rotate(45deg)' }} />
    </Wrapper>
  )
}
