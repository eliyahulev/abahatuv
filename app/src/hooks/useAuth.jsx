import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'

const AuthContext = createContext({ user: null, status: 'loading' })

export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, status: 'loading' })

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setState({ user, status: user ? 'authed' : 'anon' })
    })
  }, [])

  const signInWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider)
  }, [])

  const signOut = useCallback(async () => {
    await fbSignOut(auth)
    window.location.reload()
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
