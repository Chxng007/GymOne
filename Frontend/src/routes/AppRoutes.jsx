import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { useAuth } from '../context/AuthContext'
import { ClienteForm } from '../pages/Clientes/ClienteForm'
import { Clientes } from '../pages/Clientes/Clientes'
import { Dashboard } from '../pages/Dashboard/Dashboard'
import { Login } from '../pages/Login/Login'
import { Asistencia } from '../pages/Asistencia/Asistencia'
import { Caja } from '../pages/Caja/Caja'
import { Configuracion } from '../pages/Configuracion/Configuracion'
import { Entrenadores } from '../pages/Entrenadores/Entrenadores'
import { Gastos } from '../pages/Gastos/Gastos'
import { Inventario } from '../pages/Inventario/Inventario'
import { Membresias } from '../pages/Membresias/Membresias'
import { Pagos } from '../pages/Pagos/Pagos'
import { Reportes } from '../pages/Reportes/Reportes'
import { Ventas } from '../pages/Ventas/Ventas'
import { PrivateRoute } from './PrivateRoute'

function HomeRedirect() {
  const { isAuthenticated } = useAuth()
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

export function AppRoutes() {
  return (
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
  )
}
