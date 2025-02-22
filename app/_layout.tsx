import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { ErrorBoundary } from 'react-error-boundary';
import { initializeFirebase } from '../config/firebase';
import { Slot } from 'expo-router';

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

export default function RootLayout() {
  useEffect(() => {
    async function initApp() {
      try {
        console.log('Starting Firebase initialization...');
        await initializeFirebase();
        console.log('Firebase initialized successfully');
        await SplashScreen.hideAsync();
        console.log('Splash screen hidden');
      } catch (error) {
        console.error('Error during app initialization:', error);
        if (error instanceof Error) {
          console.error('Error details:', error.message);
          console.error('Error stack:', error.stack);
        }
      }
    }
    
    initApp();
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
        <Slot />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
