import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { Loading } from '../components/ui/Loading'
import { useAuth } from '../context/AuthContext'
import { Login } from '../pages/Login/Login'
import { PrivateRoute } from './PrivateRoute'

const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard').then((m) => ({ default: m.Dashboard })))
const Clientes = lazy(() => import('../pages/Clientes/Clientes').then((m) => ({ default: m.Clientes })))
const ClienteForm = lazy(() => import('../pages/Clientes/ClienteForm').then((m) => ({ default: m.ClienteForm })))
const Membresias = lazy(() => import('../pages/Membresias/Membresias').then((m) => ({ default: m.Membresias })))
const Pagos = lazy(() => import('../pages/Pagos/Pagos').then((m) => ({ default: m.Pagos })))
const Caja = lazy(() => import('../pages/Caja/Caja').then((m) => ({ default: m.Caja })))
const Asistencia = lazy(() => import('../pages/Asistencia/Asistencia').then((m) => ({ default: m.Asistencia })))
const Inventario = lazy(() => import('../pages/Inventario/Inventario').then((m) => ({ default: m.Inventario })))
const Ventas = lazy(() => import('../pages/Ventas/Ventas').then((m) => ({ default: m.Ventas })))
const Gastos = lazy(() => import('../pages/Gastos/Gastos').then((m) => ({ default: m.Gastos })))
const Entrenadores = lazy(() => import('../pages/Entrenadores/Entrenadores').then((m) => ({ default: m.Entrenadores })))
const Reportes = lazy(() => import('../pages/Reportes/Reportes').then((m) => ({ default: m.Reportes })))
const Configuracion = lazy(() => import('../pages/Configuracion/Configuracion').then((m) => ({ default: m.Configuracion })))

function HomeRedirect() {
  const { isAuthenticated } = useAuth()
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

function PageFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-5)' }}>
      <Loading size={32} />
    </div>
  )
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />

        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/clientes/nuevo" element={<ClienteForm />} />
            <Route path="/clientes/:id" element={<ClienteForm />} />
            <Route path="/membresias" element={<Membresias />} />
            <Route path="/pagos" element={<Pagos />} />
            <Route path="/caja" element={<Caja />} />
            <Route path="/asistencia" element={<Asistencia />} />
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/ventas" element={<Ventas />} />
            <Route path="/gastos" element={<Gastos />} />
            <Route path="/entrenadores" element={<Entrenadores />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/configuracion" element={<Configuracion />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
