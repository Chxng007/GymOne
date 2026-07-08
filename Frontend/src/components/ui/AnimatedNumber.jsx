import { useEffect, useRef } from 'react'
import { animate, useMotionValue, useTransform, motion } from 'framer-motion'

export function AnimatedNumber({ value, format = (n) => Math.round(n).toLocaleString('es-CO'), duration = 0.9 }) {
  const motionValue = useMotionValue(0)
  const rendered = useTransform(motionValue, (v) => format(v))
  const prevValue = useRef(0)

  useEffect(() => {
    const controls = animate(motionValue, Number(value) || 0, { duration, ease: [0.22, 1, 0.36, 1] })
    prevValue.current = Number(value) || 0
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <motion.span>{rendered}</motion.span>
}
