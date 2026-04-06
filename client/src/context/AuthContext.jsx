import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext({})
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
const AUTH_SESSION_KEY = 'authSession'
const LEGACY_SESSION_KEY = 'supabaseSession'

const readStoredSession = () => {
  const current = sessionStorage.getItem(AUTH_SESSION_KEY)
  if (current) {
    try {
      return JSON.parse(current)
    } catch {
      return null
    }
  }

  const legacy = sessionStorage.getItem(LEGACY_SESSION_KEY)
  if (legacy) {
    try {
      return JSON.parse(legacy)
    } catch {
      return null
    }
  }

  return null
}

const persistSession = (session) => {
  const serialized = JSON.stringify(session)
  sessionStorage.setItem(AUTH_SESSION_KEY, serialized)
  // Temporary compatibility for older data-fetch code.
  sessionStorage.setItem(LEGACY_SESSION_KEY, serialized)
}

const clearStoredSession = () => {
  sessionStorage.removeItem(AUTH_SESSION_KEY)
  sessionStorage.removeItem(LEGACY_SESSION_KEY)
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    restoreSession()
  }, [])

  const restoreSession = async () => {
    const session = readStoredSession()

    if (!session?.access_token) {
      setUser(null)
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const payload = await response.json()
      if (!response.ok || payload.error) {
        throw new Error(payload.message || 'Session expired')
      }

      setUser(payload.data.user)
      setProfile(payload.data.profile)
      persistSession({ access_token: session.access_token })
    } catch (err) {
      clearStoredSession()
      setUser(null)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async ({ email, password, role, full_name, phone, address }) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        role,
        full_name,
        phone,
        address,
      }),
    })

    const payload = await response.json()
    if (!response.ok || payload.error) {
      throw new Error(payload.message || 'Signup failed')
    }

    return payload.data
  }

  const signIn = async ({ email, password }) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const payload = await response.json()
    if (!response.ok || payload.error) {
      throw new Error(payload.message || 'Login failed')
    }

    persistSession({ access_token: payload.data.access_token })
    setUser(payload.data.user)
    setProfile(payload.data.profile)

    return payload.data
  }

  const signOut = async () => {
    clearStoredSession()
    setUser(null)
    setProfile(null)
  }

  const updateProfile = (nextProfile) => {
    setProfile(nextProfile)
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      updateProfile,
      isProvider:  profile?.role === 'provider',
      isRecipient: profile?.role === 'recipient',
      isAdmin:     profile?.role === 'admin',
      isVerified:  profile?.is_verified === true,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
