import { Timestamp } from 'firebase/firestore';

export interface Symptom {
  id: string;
  userId: string;
  name: string;
  description: string;
  severity: number;
  bodyPart: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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