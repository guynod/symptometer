import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} from '@env';

interface EnvConfig {
  firebaseApiKey: string;
  firebaseAuthDomain: string;
  firebaseProjectId: string;
  firebaseStorageBucket: string;
  firebaseMessagingSenderId: string;
  firebaseAppId: string;
}

function validateEnv(): EnvConfig {
  const requiredEnvVars = {
    firebaseApiKey: FIREBASE_API_KEY,
    firebaseAuthDomain: FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: FIREBASE_PROJECT_ID,
    firebaseStorageBucket: FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: FIREBASE_APP_ID,
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  return requiredEnvVars;
}

export const env = validateEnv(); 