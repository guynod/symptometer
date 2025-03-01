import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { getDb } from '../config/firebase';
import { useAuth } from '../config/AuthContext';
import { COLLECTIONS } from '../config/firebase-schema';
import { Symptom } from '../types/symptom';

export function useSymptoms() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadSymptoms = async () => {
      if (!user) {
        setSymptoms([]);
        setIsLoading(false);
        return;
      }

      try {
        const symptomsRef = collection(getDb(), COLLECTIONS.SYMPTOMS);
        const q = query(
          symptomsRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const loadedSymptoms = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Symptom[];

        setSymptoms(loadedSymptoms);
        setError(null);
      } catch (err) {
        console.error('Error loading symptoms:', err);
        setError(err instanceof Error ? err : new Error('Failed to load symptoms'));
      } finally {
        setIsLoading(false);
      }
    };

    loadSymptoms();
  }, [user]);

  return { symptoms, isLoading, error };
} 