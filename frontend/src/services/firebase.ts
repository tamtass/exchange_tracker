import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { getMessaging, getToken } from 'firebase/messaging'

// Config from environment (populate .env.local or environment variables)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)
export const messaging = getMessaging(app)

/**
 * Get user profile from Firestore (may be undefined fields)
 */
export async function getUserProfile(uid: string) {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : null
}

/**
 * Merge/save user profile fields to Firestore
 */
export async function saveUserProfile(uid: string, data: Record<string, any>) {
  const ref = doc(db, 'users', uid)
  await setDoc(ref, data, { merge: true })
}

/**
 * Register the browser for push notifications, store the FCM token under users/{uid}.fcmTokens
 * Returns the token if granted, otherwise null.
 */
export async function registerForPush(uid: string): Promise<string | null> {
  if (!messaging) return null
  try {
    // VAPID key must be set in env as VITE_FIREBASE_VAPID_KEY
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined
    const currentToken = await getToken(messaging, { vapidKey })
    if (!currentToken) return null

    const ref = doc(db, 'users', uid)
    try {
      await updateDoc(ref, { fcmTokens: arrayUnion(currentToken) })
    } catch (err) {
      // if update fails (e.g., doc doesn't exist), set with merge
      await setDoc(ref, { fcmTokens: [currentToken] }, { merge: true })
    }

    return currentToken
  } catch (err) {
    console.warn('Push registration failed', err)
    return null
  }
}

export default app
