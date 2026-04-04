/* eslint react-refresh/only-export-components: off */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'smartshop_auth_v1'

function safeParse(json) {
  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}

function loadAuth() {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  return safeParse(raw)
}

function persistAuth(value) {
  if (typeof window === 'undefined') return
  if (!value) {
    window.localStorage.removeItem(STORAGE_KEY)
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => loadAuth() ?? { token: null, user: null })

  const user = auth.user
  const token = auth.token

  // 🔐 REAL LOGIN (CONNECTED TO BACKEND)
  const login = useCallback(async ({ email, password }) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Login failed')
      }

      const nextUser = {
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.email.toLowerCase().includes('admin') ? 'admin' : 'customer',
        createdAt: new Date().toISOString(),
        profile: {
          phone: '',
          addressLine1: '',
          city: '',
          postalCode: '',
        },
      }

      const nextAuth = {
        token: data.token,
        user: nextUser,
      }

      setAuth(nextAuth)
      persistAuth(nextAuth)

      return nextAuth
    } catch (error) {
      throw error
    }
  }, [])

  // 🔐 REGISTER (CONNECTED TO BACKEND)
  const register = useCallback(async ({ name, email, password }) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      const nextUser = {
        id: data._id,
        name: data.name,
        email: data.email,
        role: 'customer',
        createdAt: new Date().toISOString(),
        profile: {
          phone: '',
          addressLine1: '',
          city: '',
          postalCode: '',
        },
      }

      const nextAuth = {
        token: data.token,
        user: nextUser,
      }

      setAuth(nextAuth)
      persistAuth(nextAuth)

      return nextAuth
    } catch (error) {
      throw error
    }
  }, [])

  const logout = useCallback(() => {
    setAuth({ token: null, user: null })
    persistAuth(null)
  }, [])

  const updateProfile = useCallback((patch) => {
    setAuth((prev) => {
      if (!prev?.user) return prev
      const next = {
        ...prev,
        user: {
          ...prev.user,
          profile: { ...(prev.user.profile ?? {}), ...patch },
        },
      }
      persistAuth(next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      updateProfile,
    }),
    [token, user, login, register, logout, updateProfile]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}