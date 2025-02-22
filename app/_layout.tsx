import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { ErrorBoundary } from 'react-error-boundary';
import firebaseService, { initializeFirebase } from '../config/firebase';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Ignore Firebase timer warnings
LogBox.ignoreLogs([
  'Setting a timer',
  'AsyncStorage has been extracted from react-native core',
]);

export default function RootLayout() {
  useEffect(() => {
    initializeFirebase().then(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => (
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <Stack>
            <Stack.Screen
              name="error"
              options={{ title: 'Error' }}
              initialParams={{ message: error.message }}
            />
          </Stack>
        </SafeAreaProvider>
      )}
    >
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="add-symptom"
            options={{
              presentation: 'modal',
              title: 'Add New Symptom',
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
