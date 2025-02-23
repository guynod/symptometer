import { Timestamp } from 'firebase/firestore';

export interface Symptom {
  id: string;
  name: string;
  bodyPart: string;
  notes?: string;  // Optional notes field
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId?: string; // For future auth implementation
  isActive: boolean; // For soft delete functionality
}

export interface SymptomOccurrence {
  id: string;
  symptomId: string;
  dateTime: Timestamp;
  possibleTriggers: string[];
  notes?: string;
  intensity?: number; // 1-10 scale
  duration?: number; // in minutes
  userId?: string; // For future auth implementation
}

export type SymptomInput = Omit<Symptom, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>;
export type SymptomOccurrenceInput = Omit<SymptomOccurrence, 'id' | 'dateTime' | 'userId'>; 