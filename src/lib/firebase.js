import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'
import { getMessaging, isSupported as isMessagingSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

if (!firebaseConfig.apiKey) {
  throw new Error(
    'Firebase config missing. Copy .env.local.example to .env.local and fill in values from the Firebase console.'
  )
}

export const app = initializeApp(firebaseConfig)

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
})

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY

export async function getMessagingIfSupported() {
  try {
    if (await isMessagingSupported()) return getMessaging(app)
  } catch {
    // ignore — getMessaging throws on unsupported browsers (older Safari, etc.)
  }
  return null
}
