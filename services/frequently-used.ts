import { collection, query, getDocs, orderBy, limit, doc, setDoc, getDoc, increment, serverTimestamp, Timestamp } from 'firebase/firestore';
import { getDb } from '../config/firebase';
import { COLLECTIONS, FrequentlyUsedBodyPartDoc, FrequentlyUsedSymptomDoc } from '../config/firebase-schema';

export interface FrequentlyUsedItem {
  name: string;
  count: number;
  lastUsed: Date;
}

async function ensureCollectionExists(collectionName: string) {
  try {
    const db = getDb();
    const colRef = collection(db, collectionName);
    // Try to get a single document to verify collection access
    const q = query(colRef, limit(1));
    await getDocs(q);
    return true;
  } catch (error) {
    console.warn(`Collection ${collectionName} may not exist or is not accessible:`, error);
    return false;
  }
}

export async function getFrequentlyUsedBodyParts(limitCount: number = 5): Promise<FrequentlyUsedItem[]> {
  try {
    console.log('Fetching frequently used body parts...');
    const db = getDb();

    // Ensure collection exists
    const collectionExists = await ensureCollectionExists(COLLECTIONS.FREQUENTLY_USED_BODY_PARTS);
    if (!collectionExists) {
      console.log('Body parts collection does not exist yet, returning empty array');
      return [];
    }

    const bodyPartsRef = collection(db, COLLECTIONS.FREQUENTLY_USED_BODY_PARTS);
    const q = query(bodyPartsRef, orderBy('count', 'desc'), limit(limitCount));
    
    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.docs.length} frequently used body parts`);
    
    if (querySnapshot.empty) {
      console.log('No frequently used body parts found, returning empty array');
      return [];
    }

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        name: data.name,
        count: data.count,
        lastUsed: data.lastUsed.toDate(),
      };
    });
  } catch (error) {
    console.error('Error fetching frequently used body parts:', error);
    return [];
  }
}

export async function getFrequentlyUsedSymptoms(limitCount: number = 5): Promise<FrequentlyUsedItem[]> {
  try {
    console.log('Fetching frequently used symptoms...');
    const db = getDb();

    // Ensure collection exists
    const collectionExists = await ensureCollectionExists(COLLECTIONS.FREQUENTLY_USED_SYMPTOMS);
    if (!collectionExists) {
      console.log('Symptoms collection does not exist yet, returning empty array');
      return [];
    }

    const symptomsRef = collection(db, COLLECTIONS.FREQUENTLY_USED_SYMPTOMS);
    const q = query(symptomsRef, orderBy('count', 'desc'), limit(limitCount));
    
    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.docs.length} frequently used symptoms`);
    
    if (querySnapshot.empty) {
      console.log('No frequently used symptoms found, returning empty array');
      return [];
    }

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        name: data.name,
        count: data.count,
        lastUsed: data.lastUsed.toDate(),
      };
    });
  } catch (error) {
    console.error('Error fetching frequently used symptoms:', error);
    return [];
  }
}

export async function incrementBodyPartUsage(bodyPart: string): Promise<void> {
  if (!bodyPart) {
    console.warn('Attempted to increment body part usage with empty value');
    return;
  }

  try {
    console.log('Incrementing body part usage:', bodyPart);
    const db = getDb();
    const docRef = doc(db, COLLECTIONS.FREQUENTLY_USED_BODY_PARTS, bodyPart.toLowerCase());
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log('Updating existing body part usage');
      await setDoc(docRef, {
        count: increment(1),
        lastUsed: serverTimestamp(),
      }, { merge: true });
    } else {
      console.log('Creating new body part usage record');
      const newDoc: Omit<FrequentlyUsedBodyPartDoc, 'lastUsed'> & { lastUsed: ReturnType<typeof serverTimestamp> } = {
        name: bodyPart,
        count: 1,
        lastUsed: serverTimestamp(),
      };
      await setDoc(docRef, newDoc);
    }
    console.log('Successfully updated body part usage');
  } catch (error) {
    console.error('Error incrementing body part usage:', error);
  }
}

export async function incrementSymptomUsage(symptom: string): Promise<void> {
  if (!symptom) {
    console.warn('Attempted to increment symptom usage with empty value');
    return;
  }

  try {
    console.log('Incrementing symptom usage:', symptom);
    const db = getDb();
    const docRef = doc(db, COLLECTIONS.FREQUENTLY_USED_SYMPTOMS, symptom.toLowerCase());
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log('Updating existing symptom usage');
      await setDoc(docRef, {
        count: increment(1),
        lastUsed: serverTimestamp(),
      }, { merge: true });
    } else {
      console.log('Creating new symptom usage record');
      const newDoc: Omit<FrequentlyUsedSymptomDoc, 'lastUsed'> & { lastUsed: ReturnType<typeof serverTimestamp> } = {
        name: symptom,
        count: 1,
        lastUsed: serverTimestamp(),
      };
      await setDoc(docRef, newDoc);
    }
    console.log('Successfully updated symptom usage');
  } catch (error) {
    console.error('Error incrementing symptom usage:', error);
  }
} 