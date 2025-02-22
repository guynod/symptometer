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
    console.log('Starting to add symptom:', input);
    const db = getDb();
    console.log('Got Firestore instance');
    
    const symptomData = {
      ...input,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isActive: true,
    };
    console.log('Prepared symptom data:', symptomData);

    const docRef = await addDoc(collection(db, COLLECTION_NAME), symptomData);
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
    
    // Temporarily remove the isActive filter to see all symptoms
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );
    console.log('Query created for all symptoms');

    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.docs.length} total symptoms in database`);
    
    // Log all symptoms and their isActive status
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log('Document data:', {
        id: doc.id,
        name: data.name,
        isActive: data.isActive,
        isActiveType: typeof data.isActive,
        hasIsActiveField: 'isActive' in data,
        allFields: Object.keys(data)
      });
    });

    // Now filter for active symptoms
    const symptoms = querySnapshot.docs
      .filter(doc => doc.data().isActive === true)
      .map(doc => {
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
    
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.docs.length} total symptoms`);
    
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
    console.log('Starting to delete symptom with ID:', id);
    const db = getDb();
    console.log('Got Firestore instance');
    
    const symptomRef = doc(db, COLLECTION_NAME, id);
    console.log('Created document reference');
    
    // Hard delete
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
    
    const symptomRef = doc(db, COLLECTION_NAME, id);
    
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