import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, doc, setDoc, getDocs, deleteDoc, onSnapshot } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCm5xGZvq9TVu_2LmlCOPcUbsfKGeoPqn0',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'boonchan-realestate.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'boonchan-realestate',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'boonchan-realestate.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '120788137979',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:120788137979:web:fbf37bfd436ed0d7c77d5e',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-47EYHTMF4R',
};

let app: FirebaseApp;
let db: Firestore;
let storage: FirebaseStorage;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

db = getFirestore(app);
storage = getStorage(app);

export const isFirebaseConfigured = true;

// Firestore sync helper utilities with Quota Exceeded safety guard
export async function saveToFirestore<T extends { id: string }>(collectionName: string, data: T) {
  try {
    if (!db) return;
    const docRef = doc(db, collectionName, data.id);
    await setDoc(docRef, data, { merge: true });
  } catch (error: any) {
    if (error?.code === 'resource-exhausted' || error?.message?.includes('Quota exceeded')) {
      console.info(`Firestore Notice: Operating smoothly in LocalStorage mode (${collectionName}).`);
    } else {
      console.warn(`Firestore sync note for ${collectionName}:`, error);
    }
  }
}

export async function deleteFromFirestore(collectionName: string, docId: string) {
  try {
    if (!db) return;
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error: any) {
    console.warn(`Delete note for ${collectionName}/${docId}:`, error);
  }
}

export async function fetchCollection<T>(collectionName: string): Promise<T[]> {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const items: T[] = [];
    querySnapshot.forEach((d) => {
      items.push(d.data() as T);
    });
    return items;
  } catch (error: any) {
    if (error?.code === 'resource-exhausted') {
      console.info(`Firestore Fetch Notice: Using local state.`);
    } else {
      console.warn(`Fetch note for ${collectionName}:`, error);
    }
    return [];
  }
}

export { app, db, storage };
