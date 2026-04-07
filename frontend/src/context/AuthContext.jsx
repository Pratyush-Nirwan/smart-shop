/* eslint react-refresh/only-export-components: off */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  authenticateWithGoogle,
  login as loginRequest,
  register as registerRequest,
  requestPhoneOtp as requestPhoneOtpRequest,
  verifyPhoneOtp as verifyPhoneOtpRequest,
} from '../services/authService'

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

function buildAuth(payload) {
  const user = payload?.user

  if (!payload?.token || !user) {
    throw new Error('Authentication payload is incomplete.')
  }

  return {
    token: payload.token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email ?? '',
      phone: user.phone ?? '',
      role: user.role ?? 'customer',
      createdAt: user.createdAt,
      profile: {
        phone: user.profile?.phone ?? user.phone ?? '',
        addressLine1: user.profile?.addressLine1 ?? '',
        city: user.profile?.city ?? '',
        postalCode: user.profile?.postalCode ?? '',
      },
    },
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => loadAuth() ?? { token: null, user: null })

  const user = auth.user
  const token = auth.token

  // 🔐 REAL LOGIN (CONNECTED TO BACKEND)
  const commitAuth = useCallback((payload) => {
    const nextAuth = buildAuth(payload)
    setAuth(nextAuth)
    persistAuth(nextAuth)
    return nextAuth
  }, [])

  const login = useCallback(
    async ({ email, password }) => {
      const response = await loginRequest({ email, password })
      return commitAuth(response)
    },
    [commitAuth]
  )

  // 🔐 REGISTER (CONNECTED TO BACKEND)
  const register = useCallback(
    async ({ name, email, password, phone }) => {
      const response = await registerRequest({ name, email, password, phone })
      return commitAuth(response)
    },
    [commitAuth]
  )

  const requestPhoneOtp = useCallback(async ({ name, phone, mode }) => {
    return requestPhoneOtpRequest({ name, phone, mode })
  }, [])

  const verifyPhoneOtp = useCallback(
    async ({ name, phone, otp, mode }) => {
      const response = await verifyPhoneOtpRequest({ name, phone, otp, mode })
      return commitAuth(response)
    },
    [commitAuth]
  )

  const loginWithGoogle = useCallback(
    async ({ credential }) => {
      const response = await authenticateWithGoogle({ credential })
      return commitAuth(response)
    },
    [commitAuth]
  )

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
          phone: patch.phone ?? prev.user.phone,
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
      requestPhoneOtp,
      verifyPhoneOtp,
      loginWithGoogle,
      logout,
      updateProfile,
    }),
    [
      token,
      user,
      login,
      register,
      requestPhoneOtp,
      verifyPhoneOtp,
      loginWithGoogle,
      logout,
      updateProfile,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
