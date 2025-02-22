import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { getDb } from '../config/firebase';
import { Symptom, SymptomInput } from '../types/symptom';
import { validateSymptom } from '../utils/validation';

const COLLECTION_NAME = 'symptoms';

export async function addSymptom(input: SymptomInput): Promise<string> {
  try {
    const db = getDb();
    const symptomData = {
      ...input,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isActive: true,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), symptomData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding symptom:', error);
    throw new Error('Failed to add symptom');
  }
}

export async function getActiveSymptoms(): Promise<Symptom[]> {
  try {
    console.log('Getting active symptoms...');
    const db = getDb();
    console.log('Got Firestore instance');
    
    const q = query(
      collection(db, COLLECTION_NAME),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    console.log('Query created');

    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.docs.length} symptoms`);
    
    return querySnapshot.docs.map(doc => {
      const data = { id: doc.id, ...doc.data() };
      return validateSymptom(data);
    });
  } catch (error) {
    console.error('Error getting symptoms:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw new Error('Failed to fetch symptoms');
  }
}

export async function updateSymptom(id: string, input: Partial<SymptomInput>): Promise<void> {
  try {
    const db = getDb();
    const symptomRef = doc(db, COLLECTION_NAME, id);
    
    await updateDoc(symptomRef, {
      ...input,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating symptom:', error);
    throw new Error('Failed to update symptom');
  }
}

export async function deleteSymptom(id: string): Promise<void> {
  try {
    const db = getDb();
    const symptomRef = doc(db, COLLECTION_NAME, id);
    
    // Soft delete
    await updateDoc(symptomRef, {
      isActive: false,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error deleting symptom:', error);
    throw new Error('Failed to delete symptom');
  }
} 