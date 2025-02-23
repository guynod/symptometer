import { Timestamp } from 'firebase/firestore';

export interface FrequentlyUsedBodyPartDoc {
  name: string;
  count: number;
  lastUsed: Timestamp;
}

export interface FrequentlyUsedSymptomDoc {
  name: string;
  count: number;
  lastUsed: Timestamp;
}

// Collection names
export const COLLECTIONS = {
  FREQUENTLY_USED_BODY_PARTS: 'frequently-used-body-parts',
  FREQUENTLY_USED_SYMPTOMS: 'frequently-used-symptoms',
} as const; 