import { Timestamp } from 'firebase/firestore';

export interface UserDoc {
  id: string;
  email: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SymptomDoc {
  id: string;
  userId: string;
  name: string;
  bodyPart: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SymptomLogDoc {
  id: string;
  userId: string;
  symptomId: string;
  intensity: number;
  duration: number;
  notes: string;
  possibleTriggers: string[];
  createdAt: Timestamp;
}

export interface FrequentlyUsedBodyPartDoc {
  userId: string;
  name: string;
  count: number;
  lastUsed: Timestamp;
}

export interface FrequentlyUsedSymptomDoc {
  userId: string;
  name: string;
  count: number;
  lastUsed: Timestamp;
}

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  SYMPTOMS: 'symptoms',
  SYMPTOM_LOGS: 'symptom-logs',
  FREQUENTLY_USED_BODY_PARTS: 'frequently-used-body-parts',
  FREQUENTLY_USED_SYMPTOMS: 'frequently-used-symptoms',
} as const; 