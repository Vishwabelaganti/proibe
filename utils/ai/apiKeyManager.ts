import { auth, db } from '../../lib/firebase';
import { doc, getDoc, setDoc, deleteField } from 'firebase/firestore';

const API_KEY_STORAGE_KEY = 'proibe_gemini_api_key';

export const getApiKey = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(API_KEY_STORAGE_KEY);
};

export const setApiKey = (key: string): void => {
  if (typeof window === 'undefined') return;
  const trimmed = key.trim();
  localStorage.setItem(API_KEY_STORAGE_KEY, trimmed);

  // Sync to authenticated user's private Firestore settings if signed in
  const user = auth?.currentUser;
  if (user?.uid) {
    setDoc(
      doc(db, 'users', user.uid, 'private', 'aiSettings'),
      { geminiApiKey: trimmed, updatedAt: new Date() },
      { merge: true }
    ).catch((err) => {
      console.warn('Could not sync API key to private profile:', err);
    });
  }
};

export const removeApiKey = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(API_KEY_STORAGE_KEY);

  const user = auth?.currentUser;
  if (user?.uid) {
    setDoc(
      doc(db, 'users', user.uid, 'private', 'aiSettings'),
      { geminiApiKey: deleteField(), updatedAt: new Date() },
      { merge: true }
    ).catch((err) => {
      console.warn('Could not remove API key from private profile:', err);
    });
  }
};

export const hasApiKey = (): boolean => {
  const key = getApiKey();
  return !!key && key.trim().length > 0;
};

/**
 * Resolves the active Gemini API key:
 * 1. Browser localStorage ('proibe_gemini_api_key')
 * 2. Signed-in user's private Firestore settings ('users/{uid}/private/aiSettings')
 * 3. Local dev environment fallback (process.env.NEXT_PUBLIC_GEMINI_API_KEY, never bundled in public export)
 */
export const resolveApiKey = async (): Promise<string | null> => {
  const localKey = getApiKey();
  if (localKey && localKey.trim().length > 0) {
    return localKey.trim();
  }

  // Check authenticated user's private Firestore document
  const user = auth?.currentUser;
  if (user?.uid) {
    try {
      const snap = await getDoc(doc(db, 'users', user.uid, 'private', 'aiSettings'));
      if (snap.exists()) {
        const cloudKey = snap.data()?.geminiApiKey;
        if (typeof cloudKey === 'string' && cloudKey.trim().length > 0) {
          const trimmed = cloudKey.trim();
          if (typeof window !== 'undefined') {
            localStorage.setItem(API_KEY_STORAGE_KEY, trimmed);
          }
          return trimmed;
        }
      }
    } catch (err) {
      console.warn('Could not read private API key from Firestore:', err);
    }
  }

  // Fallback to local development environment variable (only when not in static production export)
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_GEMINI_API_KEY) {
    return process.env.NEXT_PUBLIC_GEMINI_API_KEY.trim();
  }

  return null;
};
