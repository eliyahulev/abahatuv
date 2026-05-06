import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './useAuth'

// One doc per user at users/{uid}. Each field on that doc is addressable as a
// "key" through useUserField — the API mirrors useLocalStorage so call sites
// barely change.

const UserDataContext = createContext({ data: null, ready: false, setField: () => {} })

export function UserDataProvider({ children }) {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [ready, setReady] = useState(false)
  const dataRef = useRef(null)

  useEffect(() => {
    dataRef.current = data
  }, [data])

  useEffect(() => {
    if (!user) {
      setData(null)
      setReady(false)
      dataRef.current = null
      return
    }
    setReady(false)
    const ref = doc(db, 'users', user.uid)
    const unsub = onSnapshot(ref, (snap) => {
      const next = snap.exists() ? snap.data() : {}
      setData(next)
      dataRef.current = next
      setReady(true)
    })
    return unsub
  }, [user?.uid])

  // Mirror auth identity into the user doc so the admin view can render real
  // names/emails. Runs once per session per uid; merge: true keeps user-edited
  // fields (e.g. name) intact.
  useEffect(() => {
    if (!user) return
    setDoc(doc(db, 'users', user.uid), {
      email: user.email || null,
      authDisplayName: user.displayName || null,
      photoURL: user.photoURL || null,
      lastLoginAt: new Date().toISOString()
    }, { merge: true }).catch((e) => {
      console.error('Identity sync failed', e)
    })
  }, [user?.uid])

  const setField = useCallback((fieldName, newValue, fallback) => {
    if (!user) return
    const current = dataRef.current || {}
    const prev = current[fieldName] !== undefined ? current[fieldName] : fallback
    const resolved = typeof newValue === 'function' ? newValue(prev) : newValue
    const nextDoc = { ...current, [fieldName]: resolved }
    setData(nextDoc)
    dataRef.current = nextDoc
    // fire-and-forget; Firestore offline queue handles retries
    setDoc(doc(db, 'users', user.uid), { [fieldName]: resolved }, { merge: true }).catch((e) => {
      console.error('Firestore write failed for field', fieldName, e)
    })
  }, [user?.uid])

  const resetData = useCallback(async () => {
    if (!user) return
    setData({})
    dataRef.current = {}
    await deleteDoc(doc(db, 'users', user.uid))
  }, [user?.uid])

  return (
    <UserDataContext.Provider value={{ data, ready, setField, resetData }}>
      {children}
    </UserDataContext.Provider>
  )
}

export function useResetData() {
  return useContext(UserDataContext).resetData
}

export function useUserDataReady() {
  return useContext(UserDataContext).ready
}

export function useUserField(fieldName, defaultValue) {
  const { data, setField } = useContext(UserDataContext)
  const has = data && Object.prototype.hasOwnProperty.call(data, fieldName) && data[fieldName] !== undefined
  const value = has ? data[fieldName] : defaultValue
  const setValue = useCallback((nv) => setField(fieldName, nv, defaultValue), [fieldName, setField, defaultValue])
  return [value, setValue]
}

// For cases where a localStorage key was dynamic (e.g. `tasks:{date}`). Stores
// all entries inside a single map field, exposes one entry's [value, setValue].
export function useUserMapEntry(fieldName, subKey, defaultValue) {
  const [map, setMap] = useUserField(fieldName, {})
  const value = (map && map[subKey] !== undefined) ? map[subKey] : defaultValue
  const setValue = useCallback((nv) => {
    setMap((prev) => {
      const base = prev || {}
      const current = base[subKey] !== undefined ? base[subKey] : defaultValue
      const resolved = typeof nv === 'function' ? nv(current) : nv
      return { ...base, [subKey]: resolved }
    })
  }, [setMap, subKey, defaultValue])
  return [value, setValue]
}
