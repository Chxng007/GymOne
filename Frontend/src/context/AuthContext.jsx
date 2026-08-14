import { createContext, useContext, useMemo, useState } from 'react'
import { login as loginRequest, loginDemo as loginDemoRequest } from '../services/authService'

const AuthContext = createContext(null)

export const TOKEN_KEY = 'gymone_token'
export const USER_KEY = 'gymone_user'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY)
    return stored ? JSON.parse(stored) : null
  })

  function abrirSesion(data, remember) {
    const loggedUser = { nombre: data.nombre, correo: data.correo, rol: data.rol }
    const storage = remember ? localStorage : sessionStorage

    storage.setItem(TOKEN_KEY, data.token)
    storage.setItem(USER_KEY, JSON.stringify(loggedUser))
    setToken(data.token)
    setUser(loggedUser)
  }

  async function login(correo, contrasena, remember = true) {
    abrirSesion(await loginRequest(correo, contrasena), remember)
  }

  // La sesión de invitado no se recuerda: al cerrar la pestaña se va.
  async function loginDemo() {
    abrirSesion(await loginDemoRequest(), false)
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({ token, user, isAuthenticated: !!token, login, loginDemo, logout }),
    [token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
