import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeFirebase } from './firebase';

interface FirebaseContextType {
  isInitialized: boolean;
  error: Error | null;
}

const FirebaseContext = createContext<FirebaseContextType>({
  isInitialized: false,
  error: null,
});

// Initialize Firebase immediately
const firebaseInitPromise = initializeFirebase().catch(err => {
  console.error('Firebase initialization failed:', err);
  return Promise.reject(err);
});

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    firebaseInitPromise
      .then(() => {
        setIsInitialized(true);
      })
      .catch(err => {
        setError(err instanceof Error ? err : new Error('Failed to initialize Firebase'));
      });
  }, []);

  return (
    <FirebaseContext.Provider value={{ isInitialized, error }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
} 