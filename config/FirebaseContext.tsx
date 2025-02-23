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

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initialize() {
      try {
        await initializeFirebase();
        setIsInitialized(true);
      } catch (err) {
        console.error('Firebase initialization error:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize Firebase'));
      }
    }
    initialize();
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