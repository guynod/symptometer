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
import { getCurrentUser } from '../config/firebase';
import { Symptom, SymptomInput } from '../types/symptom';
import { validateSymptom } from '../utils/validation';
import { COLLECTIONS } from '../config/firebase-schema';

export async function addSymptom(input: SymptomInput): Promise<string> {
  try {
    console.log('Starting to add symptom:', input);
    const db = getDb();
    const user = getCurrentUser();
    
    if (!user) {
      throw new Error('User must be authenticated to add symptoms');
    }
    
    const symptomData = {
      ...Object.fromEntries(
        Object.entries(input).filter(([_, value]) => value !== undefined)
      ),
      userId: user.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isActive: true,
    };
    console.log('Prepared symptom data:', symptomData);

    const docRef = await addDoc(collection(db, COLLECTIONS.SYMPTOMS), symptomData);
    console.log('Successfully added symptom with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding symptom:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw new Error('Failed to add symptom');
  }
}

export async function getActiveSymptoms(): Promise<Symptom[]> {
  try {
    console.log('Getting active symptoms...');
    const db = getDb();
    const user = getCurrentUser();
    
    if (!user) {
      throw new Error('User must be authenticated to get symptoms');
    }
    
    const q = query(
      collection(db, COLLECTIONS.SYMPTOMS),
      where('userId', '==', user.uid),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    console.log('Query created for active symptoms');

    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.docs.length} active symptoms for user`);
    
    const symptoms = querySnapshot.docs.map(doc => {
      const data = { id: doc.id, ...doc.data() } as Partial<Symptom>;
      console.log('Processing active symptom:', {
        id: doc.id,
        name: data.name || 'unnamed',
        isActive: data.isActive
      });
      return validateSymptom(data as any);
    });
    
    console.log(`Returning ${symptoms.length} validated active symptoms`);
    return symptoms;
  } catch (error) {
    console.error('Error getting symptoms:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw new Error('Failed to fetch symptoms');
  }
}

export async function getAllSymptoms(): Promise<Symptom[]> {
  try {
    console.log('Getting all symptoms...');
    const db = getDb();
    const user = getCurrentUser();
    
    if (!user) {
      throw new Error('User must be authenticated to get symptoms');
    }
    
    const q = query(
      collection(db, COLLECTIONS.SYMPTOMS),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.docs.length} total symptoms for user`);
    
    const symptoms = querySnapshot.docs.map(doc => {
      const data = { id: doc.id, ...doc.data() } as Partial<Symptom>;
      console.log('Processing symptom:', {
        id: doc.id,
        name: data.name || 'unnamed',
        isActive: data.isActive
      });
      return validateSymptom(data as any);
    });
    
    console.log(`Returning ${symptoms.length} total symptoms`);
    return symptoms;
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
    const user = getCurrentUser();
    
    if (!user) {
      throw new Error('User must be authenticated to update symptoms');
    }
    
    const symptomRef = doc(db, COLLECTIONS.SYMPTOMS, id);
    const symptomDoc = await getDocs(query(collection(db, COLLECTIONS.SYMPTOMS), where('userId', '==', user.uid)));
    
    if (!symptomDoc.docs.length) {
      throw new Error('Symptom not found or unauthorized');
    }
    
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
    console.log('Starting to delete symptom with ID:', id);
    const db = getDb();
    const user = getCurrentUser();
    
    if (!user) {
      throw new Error('User must be authenticated to delete symptoms');
    }
    
    const symptomRef = doc(db, COLLECTIONS.SYMPTOMS, id);
    const symptomDoc = await getDocs(query(collection(db, COLLECTIONS.SYMPTOMS), where('userId', '==', user.uid)));
    
    if (!symptomDoc.docs.length) {
      throw new Error('Symptom not found or unauthorized');
    }
    
    await deleteDoc(symptomRef);
    console.log('Successfully deleted symptom');
  } catch (error) {
    console.error('Error deleting symptom:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw new Error('Failed to delete symptom');
  }
}

export async function reactivateSymptom(id: string): Promise<void> {
  try {
    console.log('Starting to reactivate symptom with ID:', id);
    const db = getDb();
    const user = getCurrentUser();
    
    if (!user) {
      throw new Error('User must be authenticated to reactivate symptoms');
    }
    
    const symptomRef = doc(db, COLLECTIONS.SYMPTOMS, id);
    const symptomDoc = await getDocs(query(collection(db, COLLECTIONS.SYMPTOMS), where('userId', '==', user.uid)));
    
    if (!symptomDoc.docs.length) {
      throw new Error('Symptom not found or unauthorized');
    }
    
    await updateDoc(symptomRef, {
      isActive: true,
      updatedAt: Timestamp.now(),
    });
    console.log('Successfully reactivated symptom');
  } catch (error) {
    console.error('Error reactivating symptom:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw new Error('Failed to reactivate symptom');
  }
} 