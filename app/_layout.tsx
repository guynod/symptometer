import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { LogBox, View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { ErrorBoundary } from 'react-error-boundary';
import { FirebaseProvider, useFirebase } from '../config/FirebaseContext';
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

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={{ marginTop: 10 }}>Initializing app...</Text>
    </View>
  );
}

function ErrorScreen({ error }: { error: Error }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, color: '#ff3b30', marginBottom: 10 }}>Error</Text>
      <Text style={{ textAlign: 'center' }}>{error.message}</Text>
    </View>
  );
}

function RootLayoutContent() {
  const { isInitialized, error } = useFirebase();

  useEffect(() => {
    if (isInitialized) {
      SplashScreen.hideAsync();
    }
  }, [isInitialized]);

  if (error) {
    return <ErrorScreen error={error} />;
  }

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return <Slot />;
}

export default function RootLayout() {
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
        <FirebaseProvider>
          <RootLayoutContent />
        </FirebaseProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
