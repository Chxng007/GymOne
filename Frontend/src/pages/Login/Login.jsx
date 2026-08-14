import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { LogoMark } from '../../components/ui/LogoMark'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useTransition } from '../../context/TransitionContext'
import { backendDespierto, esperarBackend } from '../../services/salud'
import gymHero from '../../assets/gym-hero.png'

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
  </svg>
)

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.7" />
  </svg>
)

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="m3.5 6 8.5 6.5L20.5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M7.5 10.5V7.5a4.5 4.5 0 0 1 9 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.55-5.17 3.55-8.8z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1C3.25 21.3 7.31 24 12 24z" />
    <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.61H1.27A11.97 11.97 0 0 0 0 12c0 1.93.46 3.76 1.27 5.39l4-3.1z" />
    <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.61l4 3.1C6.22 6.86 8.87 4.75 12 4.75z" />
  </svg>
)

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--color-text)">
    <path d="M16.365 1.43c0 1.14-.462 2.24-1.194 3.03-.796.86-2.118 1.52-3.185 1.43-.14-1.09.44-2.24 1.16-2.98.83-.86 2.24-1.5 3.22-1.48zM20.36 17.19c-.52 1.2-1.15 2.34-1.99 3.36-.98 1.2-2 2.4-3.44 2.42-1.4.03-1.86-.83-3.47-.83-1.62 0-2.13.8-3.46.86-1.4.05-2.47-1.3-3.46-2.49C2.5 18.13.9 14.13 2.19 11.4c.66-1.4 1.85-2.29 3.13-2.31 1.35-.03 2.63.9 3.46.9.82 0 2.38-1.12 4.01-.95.68.03 2.6.28 3.83 2.1-.1.06-2.29 1.34-2.27 3.99.02 3.16 2.77 4.21 2.81 4.23-.03.09-.44 1.5-1.45 2.87z" />
  </svg>
)

function useIsDesktop(breakpoint = 900) {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= breakpoint)

  useEffect(() => {
    function onResize() {
      setIsDesktop(window.innerWidth >= breakpoint)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [breakpoint])

  return isDesktop
}

function GlowOrb({ size, top, left, delay }) {
  return (
    <motion.div
      animate={{ x: [0, 30, -20, 0], y: [0, -25, 15, 0] }}
      transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay }}
      style={{
        position: 'absolute',
        top,
        left,
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56,189,248,0.22), transparent 70%)',
        filter: 'blur(10px)',
        pointerEvents: 'none',
      }}
    />
  )
}

function fieldStyle(hasIcon) {
  return {
    width: '100%',
    boxSizing: 'border-box',
    background: 'var(--color-surface-alt)',
    border: '1.5px solid var(--color-border-input)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-text)',
    padding: hasIcon ? '14px 16px 14px 44px' : '14px 16px',
    fontSize: 15,
    fontFamily: 'inherit',
    outline: 'none',
  }
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

export function Login() {
  const { login, loginDemo } = useAuth()
  const { showToast } = useToast()
  const { cover, reveal } = useTransition()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isDesktop = useIsDesktop()
  const buttonRef = useRef(null)
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(() =>
    searchParams.get('sesion') === 'expirada' ? 'Tu sesión expiró. Vuelve a iniciar sesión.' : '',
  )
  const [loading, setLoading] = useState(false)
  // 'listo' de entrada: mientras la sonda no diga lo contrario, no hay motivo
  // para entorpecer a quien llega con el servidor ya caliente.
  const [servidor, setServidor] = useState('listo')

  // El despliegue público corre en la capa gratuita de Render, que apaga la
  // instancia sin tráfico. Sin este aviso, el primer visitante del día se
  // encuentra un formulario que no responde y se va pensando que está roto.
  useEffect(() => {
    let vivo = true

    async function comprobar() {
      if (await backendDespierto()) return

      if (!vivo) return
      setServidor('despertando')

      const listo = await esperarBackend(() => vivo)
      if (vivo) setServidor(listo ? 'listo' : 'caido')
    }

    comprobar()
    return () => {
      vivo = false
    }
  }, [])

  async function entrar(abrirSesion, mensajeDeError) {
    setError('')
    setLoading(true)
    try {
      await abrirSesion()
      const rect = buttonRef.current?.getBoundingClientRect()
      const origin = rect
        ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
        : { x: window.innerWidth / 2, y: window.innerHeight / 2 }
      await cover(origin)
      navigate('/dashboard', { replace: true })
      await reveal()
    } catch (fallo) {
      // Sin `response` el backend nunca contestó: está arrancando o no hay red.
      // Culpar a las credenciales ahí sería señalar un error que no ocurrió.
      setError(fallo.response ? mensajeDeError : 'El servidor está arrancando. Probá de nuevo en un momento.')
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    // Los dos campos vacíos son la puerta de invitado: se entra sin credenciales.
    if (!correo.trim() && !contrasena) {
      await entrar(loginDemo, 'No se pudo abrir la sesión de invitado. Intentá de nuevo.')
      return
    }

    await entrar(() => login(correo, contrasena, remember), 'Correo o contraseña inválidos')
  }

  function handleOlvidasteContrasena(e) {
    e.preventDefault()
    showToast('Contactá al administrador del sistema para restablecer tu contraseña', 'neutral')
  }

  function handleOAuth(provider) {
    showToast(`Inicio de sesión con ${provider} próximamente disponible`, 'neutral')
  }

  function handleRegistrate(e) {
    e.preventDefault()
    showToast('GymOne administra un solo usuario. Contactá al equipo para crear accesos adicionales.', 'neutral')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: isDesktop ? 'row' : 'column',
        background: 'var(--color-bg)',
        position: 'relative',
      }}
    >
      {/* HERO */}
      <div
        style={{
          position: isDesktop ? 'relative' : 'fixed',
          inset: isDesktop ? 'auto' : 0,
          width: isDesktop ? '55%' : '100%',
          height: isDesktop ? '100vh' : '100%',
          overflow: 'hidden',
          flexShrink: 0,
          zIndex: 0,
        }}
      >
        <motion.img
          src={gymHero}
          alt="Gimnasio moderno con iluminación LED verde"
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 18, ease: 'easeOut' }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: isDesktop
              ? 'linear-gradient(0deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 42%, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0.35) 100%)'
              : 'linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.78) 55%, rgba(10,10,10,0.94) 100%)',
            zIndex: 1,
          }}
        />
        <GlowOrb size={220} top="10%" left="60%" delay={0} />
        <GlowOrb size={160} top="65%" left="10%" delay={4} />
        {isDesktop && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: 10, padding: 56 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <LogoMark />
              <span style={{ color: 'var(--color-text)', fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}>
                Gym<span style={{ color: 'var(--color-primary)' }}>One</span>
              </span>
            </div>
            <p style={{ color: 'var(--color-text)', fontSize: 17, fontWeight: 500, opacity: 0.85, maxWidth: 360, lineHeight: 1.5, margin: '8px 0 0' }}>
              Gestión total de tu gimnasio, en un solo lugar.
            </p>
          </motion.div>
        )}
      </div>

      {/* FORM */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: isDesktop ? '45%' : '100%',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDesktop ? 'var(--color-bg)' : 'transparent',
          padding: isDesktop ? 40 : 24,
          boxSizing: 'border-box',
        }}
      >
        <motion.form
          onSubmit={handleSubmit}
          variants={container}
          initial="hidden"
          animate="show"
          style={{
            width: '100%',
            maxWidth: 400,
            display: 'flex',
            flexDirection: 'column',
            background: isDesktop ? 'transparent' : 'rgba(18,18,18,0.72)',
            backdropFilter: isDesktop ? 'none' : 'blur(18px)',
            border: isDesktop ? 'none' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: isDesktop ? 0 : 16,
            padding: isDesktop ? 0 : '32px 24px',
            boxSizing: 'border-box',
          }}
        >
          {!isDesktop && (
            <motion.div variants={item} style={{ display: 'flex', alignItems: 'center', gap: 9, justifyContent: 'center', marginBottom: 8 }}>
              <LogoMark size={30} />
              <span style={{ color: 'var(--color-text)', fontWeight: 800, fontSize: 19, letterSpacing: '-0.02em' }}>
                Gym<span style={{ color: 'var(--color-primary)' }}>One</span>
              </span>
            </motion.div>
          )}

          <motion.div variants={item} style={{ textAlign: isDesktop ? 'left' : 'center' }}>
            <h1 style={{ color: '#FFFFFF', fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
              Bienvenido de nuevo
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 15, margin: '0 0 32px', fontWeight: 400 }}>
              Iniciá sesión para continuar en GymOne
            </p>
          </motion.div>

          <motion.label variants={item} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ color: 'var(--color-text)', fontSize: 13, fontWeight: 600, letterSpacing: '0.01em' }}>Correo o usuario</span>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: 15, display: 'flex', color: 'var(--color-text-muted)', pointerEvents: 'none' }}>
                <MailIcon />
              </span>
              <input
                type="email"
                placeholder="vos@gimnasio.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="ui-field"
                style={fieldStyle(true)}
              />
            </div>
          </motion.label>

          <motion.label variants={item} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 18 }}>
            <span style={{ color: 'var(--color-text)', fontSize: 13, fontWeight: 600, letterSpacing: '0.01em' }}>Contraseña</span>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: 15, display: 'flex', color: 'var(--color-text-muted)', pointerEvents: 'none' }}>
                <LockIcon />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                className="ui-field"
                style={{ ...fieldStyle(true), paddingRight: 46 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="ui-hover-accent"
                style={{
                  position: 'absolute',
                  right: 12,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  overflow: 'hidden',
                  color: 'var(--color-text-muted)',
                }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={showPassword ? 'off' : 'on'}
                    initial={{ opacity: 0, rotate: -20 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 20 }}
                    transition={{ duration: 0.15 }}
                    style={{ display: 'flex' }}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </motion.label>

          <motion.div variants={item} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: 13.5, fontWeight: 500 }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />
              Recordarme
            </label>
            <a
              href="#"
              onClick={handleOlvidasteContrasena}
              className="ui-link-underline"
              style={{ color: 'var(--color-accent)', fontSize: 13.5, fontWeight: 600, textDecoration: 'none' }}
            >
              ¿Olvidaste tu contraseña?
            </a>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 18 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                style={{
                  color: 'var(--color-danger)',
                  background: 'rgba(255,92,92,0.08)',
                  border: '1px solid rgba(255,92,92,0.25)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  fontSize: 13.5,
                  overflow: 'hidden',
                }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {servidor !== 'listo' && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 18 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  color: 'var(--color-text-secondary)',
                  background: 'rgba(250,204,21,0.07)',
                  border: '1px solid rgba(250,204,21,0.25)',
                  borderRadius: 8,
                  padding: '11px 13px',
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  overflow: 'hidden',
                }}
              >
                <motion.span
                  animate={servidor === 'despertando' ? { opacity: [1, 0.25, 1] } : { opacity: 1 }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: servidor === 'despertando' ? '#FACC15' : 'var(--color-danger)',
                    flexShrink: 0,
                    marginTop: 5,
                  }}
                />
                <span>
                  {servidor === 'despertando' ? (
                    <>
                      <strong style={{ color: 'var(--color-text)', fontWeight: 600 }}>Despertando el servidor…</strong>{' '}
                      La demo corre en un plan gratuito que se apaga cuando nadie la visita. Tarda cerca de un minuto en
                      volver; el formulario se habilita solo.
                    </>
                  ) : (
                    <>
                      <strong style={{ color: 'var(--color-text)', fontWeight: 600 }}>El servidor no responde.</strong>{' '}
                      Recargá la página en unos minutos.
                    </>
                  )}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={item} whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }} style={{ marginTop: 26 }}>
            <Button
              ref={buttonRef}
              type="submit"
              disabled={loading || servidor === 'despertando'}
              style={{ width: '100%', padding: '15px 20px', fontSize: 15.5, borderRadius: 'var(--radius-md)' }}
            >
              {servidor === 'despertando' ? 'Despertando el servidor...' : loading ? 'Ingresando...' : 'Iniciar sesión'}
            </Button>
          </motion.div>

          <motion.p
            variants={item}
            style={{
              margin: '14px 0 0',
              padding: '11px 13px',
              background: 'rgba(56,189,248,0.07)',
              border: '1px solid rgba(56,189,248,0.22)',
              borderRadius: 8,
              color: 'var(--color-text-secondary)',
              fontSize: 12.5,
              lineHeight: 1.5,
            }}
          >
            Podés ingresar sin credenciales: dejá los campos vacíos y tocá{' '}
            <strong style={{ color: 'var(--color-text)', fontWeight: 600 }}>Iniciar sesión</strong>. Es un acceso de
            invitado, solo para que puedas visualizar lo que hay dentro.
          </motion.p>

          <motion.div variants={item} style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '28px 0 22px' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border-subtle)' }} />
            <span style={{ color: 'var(--color-text-muted)', fontSize: 12.5, fontWeight: 500 }}>o continuá con</span>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border-subtle)' }} />
          </motion.div>

          <motion.div variants={item} style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={() => handleOAuth('Google')}
              className="ui-oauth-btn"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: 'var(--color-surface-alt)',
                border: '1.5px solid var(--color-border-input)',
                borderRadius: 'var(--radius-md)',
                padding: 12,
                color: 'var(--color-text)',
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              <GoogleIcon /> Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('Apple')}
              className="ui-oauth-btn"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: 'var(--color-surface-alt)',
                border: '1.5px solid var(--color-border-input)',
                borderRadius: 'var(--radius-md)',
                padding: 12,
                color: 'var(--color-text)',
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              <AppleIcon /> Apple
            </button>
          </motion.div>

          <motion.p variants={item} style={{ textAlign: 'center', margin: '28px 0 0', color: 'var(--color-text-muted)', fontSize: 14 }}>
            ¿No tenés cuenta?{' '}
            <a
              href="#"
              onClick={handleRegistrate}
              className="ui-link-underline"
              style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}
            >
              Registrate
            </a>
          </motion.p>
        </motion.form>
      </div>
    </div>
  )
}
