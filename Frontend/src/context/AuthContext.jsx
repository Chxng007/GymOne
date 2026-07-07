import { createContext, useContext, useMemo, useState } from 'react'
import { login as loginRequest } from '../services/authService'

const AuthContext = createContext(null)

const TOKEN_KEY = 'gymone_token'
const USER_KEY = 'gymone_user'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? JSON.parse(stored) : null
  })

  async function login(correo, contrasena) {
    const data = await loginRequest(correo, contrasena)
    const loggedUser = { nombre: data.nombre, correo: data.correo, rol: data.rol }

    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(loggedUser))
    setToken(data.token)
    setUser(loggedUser)
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({ token, user, isAuthenticated: !!token, login, logout }),
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
