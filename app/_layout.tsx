import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { LogBox, View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { FirebaseProvider, useFirebase } from '../config/FirebaseContext';
import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../config/AuthContext';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Ignore Firebase timer warnings
LogBox.ignoreLogs([
  'Setting a timer',
  'AsyncStorage has been extracted from react-native core',
]);

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

function AuthStateListener() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      // Redirect to sign in if not authenticated
      router.replace('/auth/sign-in');
    } else if (user && inAuthGroup) {
      // Redirect to home if authenticated
      router.replace('/(tabs)');
    }
  }, [user, segments, isLoading]);

  return <Slot />;
}

function AppContent() {
  const { isInitialized, error } = useFirebase();

  useEffect(() => {
    if (error) {
      console.error('Firebase initialization error:', error);
    }
    // Hide splash screen once Firebase initialization is complete or has errored
    SplashScreen.hideAsync().catch(console.error);
  }, [error, isInitialized]);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error initializing app</Text>
        <Text>{error.message}</Text>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Only render AuthProvider after Firebase is initialized
  return (
    <AuthProvider>
      <AuthStateListener />
    </AuthProvider>
  );
}

function ErrorFallback({ error }: FallbackProps) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Something went wrong!</Text>
      <Text>{error.message}</Text>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <FirebaseProvider>
          <AppContent />
        </FirebaseProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
