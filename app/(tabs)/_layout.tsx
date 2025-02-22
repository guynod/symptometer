import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Symptoms',
          headerTitle: 'My Symptoms',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="format-list-bulleted" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inactive-symptoms"
        options={{
          title: 'Inactive',
          headerTitle: 'Inactive Symptoms',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="archive" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
