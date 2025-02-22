import { Timestamp } from 'firebase/firestore';
import { Symptom, SymptomOccurrence } from '../types/symptom';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateSymptom(data: any): Symptom {
  try {
    if (!data) {
      console.error('Validation failed: Symptom data is required');
      throw new ValidationError('Symptom data is required');
    }
    
    if (typeof data.id !== 'string') {
      console.error('Validation failed: Invalid id type', { id: data.id, type: typeof data.id });
      throw new ValidationError('Symptom id must be a string');
    }
    if (typeof data.name !== 'string') {
      console.error('Validation failed: Invalid name type', { name: data.name, type: typeof data.name });
      throw new ValidationError('Symptom name must be a string');
    }
    if (typeof data.bodyPart !== 'string') {
      console.error('Validation failed: Invalid bodyPart type', { bodyPart: data.bodyPart, type: typeof data.bodyPart });
      throw new ValidationError('Body part must be a string');
    }
    if (typeof data.isActive !== 'boolean') {
      console.error('Validation failed: Invalid isActive type', { isActive: data.isActive, type: typeof data.isActive });
      throw new ValidationError('isActive must be a boolean');
    }
    
    if (!(data.createdAt instanceof Timestamp)) {
      console.error('Validation failed: Invalid createdAt', { createdAt: data.createdAt });
      throw new ValidationError('createdAt must be a Firestore Timestamp');
    }
    if (!(data.updatedAt instanceof Timestamp)) {
      console.error('Validation failed: Invalid updatedAt', { updatedAt: data.updatedAt });
      throw new ValidationError('updatedAt must be a Firestore Timestamp');
    }

    // Optional fields
    if (data.userId !== undefined && typeof data.userId !== 'string') {
      console.error('Validation failed: Invalid userId type', { userId: data.userId, type: typeof data.userId });
      throw new ValidationError('userId must be a string if provided');
    }

    console.log('Symptom validation passed:', { 
      id: data.id,
      name: data.name,
      isActive: data.isActive
    });

    return data as Symptom;
  } catch (error) {
    console.error('Symptom validation error:', error);
    throw error;
  }
}

export function validateSymptomOccurrence(data: any): SymptomOccurrence {
  if (!data) throw new ValidationError('Symptom occurrence data is required');
  
  if (typeof data.id !== 'string') throw new ValidationError('Occurrence id must be a string');
  if (typeof data.symptomId !== 'string') throw new ValidationError('symptomId must be a string');
  if (!(data.dateTime instanceof Timestamp)) {
    throw new ValidationError('dateTime must be a Firestore Timestamp');
  }
  if (!Array.isArray(data.possibleTriggers)) {
    throw new ValidationError('possibleTriggers must be an array');
  }
  if (!data.possibleTriggers.every((trigger: any) => typeof trigger === 'string')) {
    throw new ValidationError('All triggers must be strings');
  }

  // Optional fields
  if (data.notes !== undefined && typeof data.notes !== 'string') {
    throw new ValidationError('notes must be a string if provided');
  }
  if (data.intensity !== undefined && 
      (typeof data.intensity !== 'number' || data.intensity < 1 || data.intensity > 10)) {
    throw new ValidationError('intensity must be a number between 1 and 10 if provided');
  }
  if (data.duration !== undefined && 
      (typeof data.duration !== 'number' || data.duration < 0)) {
    throw new ValidationError('duration must be a positive number if provided');
  }
  if (data.userId !== undefined && typeof data.userId !== 'string') {
    throw new ValidationError('userId must be a string if provided');
  }

  return data as SymptomOccurrence;
}

export function isValidBodyPart(bodyPart: string): boolean {
  // Allow any non-empty string that's been sanitized
  return typeof bodyPart === 'string' && bodyPart.trim().length > 0;
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function validateIntensity(intensity: number): void {
  if (intensity < 1 || intensity > 10 || !Number.isInteger(intensity)) {
    throw new ValidationError('Intensity must be an integer between 1 and 10');
  }
}

export function validateDuration(duration: number): void {
  if (duration < 0 || !Number.isInteger(duration)) {
    throw new ValidationError('Duration must be a positive integer');
  }
} 