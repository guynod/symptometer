import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  enableIndexedDbPersistence,
  disableNetwork,
  enableNetwork,
  terminate,
  waitForPendingWrites,
  Firestore,
} from 'firebase/firestore';
import {
  Auth,
  getAuth,
  initializeAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import firebaseApp from '@react-native-firebase/app';

// Debug logging for configuration
console.log('Firebase Config Check:', {
  hasApiKey: !!Constants.expoConfig?.extra?.firebaseApiKey,
  hasAuthDomain: !!Constants.expoConfig?.extra?.firebaseAuthDomain,
  hasProjectId: !!Constants.expoConfig?.extra?.firebaseProjectId,
  config: Constants.expoConfig?.extra
});

if (!Constants.expoConfig?.extra) {
  throw new Error('Missing Firebase configuration in app.config.js');
}

const {
  firebaseApiKey,
  firebaseAuthDomain,
  firebaseProjectId,
  firebaseStorageBucket,
  firebaseMessagingSenderId,
  firebaseAppId,
} = Constants.expoConfig.extra;

// Validate required environment variables
const requiredEnvVars = {
  apiKey: firebaseApiKey,
  authDomain: firebaseAuthDomain,
  projectId: firebaseProjectId,
  storageBucket: firebaseStorageBucket,
  messagingSenderId: firebaseMessagingSenderId,
  appId: firebaseAppId,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required Firebase configuration variables: ${missingVars.join(', ')}`
  );
}

// Firebase configuration object
const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: firebaseAuthDomain,
  projectId: firebaseProjectId,
  storageBucket: firebaseStorageBucket,
  messagingSenderId: firebaseMessagingSenderId,
  appId: firebaseAppId,
};

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 seconds

class FirebaseService {
  private static instance: FirebaseService;
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private auth: Auth | null = null;
  private initialized = false;
  private initializationPromise: Promise<void> | null = null;
  private networkEnabled: boolean = true;

  private constructor() {}

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  async initialize() {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      if (this.initialized) return;

      try {
        console.log('Initializing Firebase...');
        // Initialize Firebase app
        this.app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
        console.log('Firebase app initialized');

        // Initialize Auth
        this.auth = getAuth(this.app);
        if (Platform.OS === 'web') {
          await setPersistence(this.auth, browserLocalPersistence);
        }
        console.log('Firebase Auth initialized');

        // Initialize Firestore with optimized settings
        this.db = initializeFirestore(this.app, {
          experimentalForceLongPolling: Platform.OS === 'android',
          cacheSizeBytes: 50 * 1024 * 1024,
        });
        console.log('Firestore initialized');

        // Enable offline persistence with retry logic
        if (Platform.OS !== 'web') {
          await this.enablePersistenceWithRetry();
        }

        this.initialized = true;
        console.log('Firebase initialization complete');
      } catch (error) {
        console.error('Error initializing Firebase:', error);
        this.initializationPromise = null;
        throw new Error(`Firebase initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    })();

    return this.initializationPromise;
  }

  async waitForInitialization() {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initialize();
    }
    return this.initializationPromise;
  }

  private async enablePersistenceWithRetry(attempt: number = 1) {
    if (!this.db) return;
    
    try {
      await enableIndexedDbPersistence(this.db);
    } catch (error: any) {
      if (error.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (error.code === 'unimplemented') {
        console.warn('The current browser does not support persistence.');
      } else if (attempt < MAX_RETRY_ATTEMPTS) {
        console.warn(`Retrying persistence enablement. Attempt ${attempt} of ${MAX_RETRY_ATTEMPTS}`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        await this.enablePersistenceWithRetry(attempt + 1);
      } else {
        throw new Error(`Failed to enable persistence after ${MAX_RETRY_ATTEMPTS} attempts`);
      }
    }
  }

  async toggleNetwork(enable: boolean) {
    if (!this.initialized || !this.db) throw new Error('Firebase not initialized');
    if (this.networkEnabled === enable) return;

    try {
      if (enable) {
        await enableNetwork(this.db);
      } else {
        await disableNetwork(this.db);
      }
      this.networkEnabled = enable;
    } catch (error) {
      console.error(`Error ${enable ? 'enabling' : 'disabling'} network:`, error);
      throw error;
    }
  }

  async cleanup() {
    if (!this.initialized || !this.db) return;

    try {
      await waitForPendingWrites(this.db);
      await terminate(this.db);
      this.initialized = false;
    } catch (error) {
      console.error('Error during Firebase cleanup:', error);
      throw error;
    }
  }

  getDb(): Firestore {
    if (!this.initialized || !this.db) throw new Error('Firebase not initialized');
    return this.db;
  }

  getApp() {
    if (!this.initialized) throw new Error('Firebase not initialized');
    return this.app;
  }

  getAuth(): Auth {
    if (!this.initialized || !this.auth) throw new Error('Firebase not initialized');
    return this.auth;
  }

  getCurrentUser(): User | null {
    if (!this.initialized || !this.auth) throw new Error('Firebase not initialized');
    return this.auth.currentUser;
  }

  async signIn(email: string, password: string): Promise<UserCredential> {
    await this.waitForInitialization();
    if (!this.auth) throw new Error('Firebase not initialized');
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async signUp(email: string, password: string): Promise<UserCredential> {
    await this.waitForInitialization();
    if (!this.auth) throw new Error('Firebase not initialized');
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  async logOut(): Promise<void> {
    await this.waitForInitialization();
    if (!this.auth) throw new Error('Firebase not initialized');
    return signOut(this.auth);
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    if (!this.initialized || !this.auth) throw new Error('Firebase not initialized');
    return onAuthStateChanged(this.auth, callback);
  }
}

const firebaseService = FirebaseService.getInstance();

export { firebaseService as default };
export const initializeFirebase = () => firebaseService.initialize();
export const getDb = () => firebaseService.getDb();
export const getFirebaseAuth = () => firebaseService.getAuth();
export const getCurrentUser = () => firebaseService.getCurrentUser(); 