import { getToken, onMessage } from 'firebase/messaging'
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db, getMessagingIfSupported, VAPID_KEY } from './firebase'

function isSecureContextOrLocalhost() {
  if (typeof window === 'undefined') return false
  if (window.isSecureContext) return true
  return ['localhost', '127.0.0.1'].includes(window.location.hostname)
}

export function pushSupportStatus() {
  if (typeof window === 'undefined') return 'unsupported'
  if (!('Notification' in window)) return 'unsupported'
  if (!('serviceWorker' in navigator)) return 'unsupported'
  if (!isSecureContextOrLocalhost()) return 'insecure'
  return Notification.permission
}

async function fetchToken(messaging) {
  if (!VAPID_KEY) {
    throw new Error('VITE_FIREBASE_VAPID_KEY is not set — generate one in Firebase console → Cloud Messaging → Web Push certificates.')
  }
  return getToken(messaging, { vapidKey: VAPID_KEY })
}

export async function enablePushNotifications(uid) {
  if (!uid) throw new Error('uid required')
  const messaging = await getMessagingIfSupported()
  if (!messaging) return { ok: false, reason: 'unsupported' }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return { ok: false, reason: permission }

  const token = await fetchToken(messaging)
  if (!token) return { ok: false, reason: 'no-token' }

  await updateDoc(doc(db, 'users', uid), {
    fcmTokens: arrayUnion(token),
    fcmTokenUpdatedAt: new Date().toISOString()
  })
  return { ok: true, token }
}

export async function refreshPushTokenSilently(uid) {
  if (!uid) return
  if (typeof window === 'undefined') return
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const messaging = await getMessagingIfSupported()
  if (!messaging) return

  try {
    const token = await fetchToken(messaging)
    if (!token) return
    await updateDoc(doc(db, 'users', uid), {
      fcmTokens: arrayUnion(token),
      fcmTokenUpdatedAt: new Date().toISOString()
    })
  } catch {
    // best-effort
  }
}

export async function disablePushNotifications(uid, token) {
  if (!uid || !token) return
  try {
    await updateDoc(doc(db, 'users', uid), { fcmTokens: arrayRemove(token) })
  } catch {
    // ignore
  }
}

export async function onForegroundMessage(handler) {
  const messaging = await getMessagingIfSupported()
  if (!messaging) return () => {}
  return onMessage(messaging, handler)
}
