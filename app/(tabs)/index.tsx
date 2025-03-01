import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Text } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SymptomItem } from '../../components/SymptomItem';
import { Symptom } from '../../types/symptom';
import { getAllSymptoms, deleteSymptom } from '../../services/symptoms';
import { useAuth } from '../../config/AuthContext';

export default function HomeScreen() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const loadSymptoms = async () => {
    if (!user) {
      console.log('No authenticated user, skipping symptom load');
      setSymptoms([]);
      setLoading(false);
      return;
    }

    try {
      console.log('Starting to load symptoms for user:', user.uid);
      setLoading(true);
      const activeSymptoms = await getAllSymptoms();
      console.log('Successfully fetched symptoms:', activeSymptoms.length);
      const filteredSymptoms = activeSymptoms.filter(s => s.isActive);
      console.log('Active symptoms:', filteredSymptoms.length);
      setSymptoms(filteredSymptoms);
    } catch (error) {
      console.error('Error loading symptoms:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSymptoms();
    }, [user])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSymptoms();
    setRefreshing(false);
  };

  const handleDelete = async (symptomId: string) => {
    if (!user) {
      console.error('Cannot delete symptom: User not authenticated');
      return;
    }

    try {
      await deleteSymptom(symptomId);
      await loadSymptoms();
    } catch (error) {
      console.error('Error deleting symptom:', error);
    }
  };

  // If not authenticated, show appropriate message
  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Please sign in to view your symptoms</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={symptoms}
        renderItem={({ item }) => (
          <SymptomItem
            symptom={item}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No symptoms added yet</Text>
            <Text style={styles.emptySubtext}>
              Chat with the AI assistant to discuss your health
            </Text>
          </View>
        }
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => router.push('/chat')}
        >
          <MaterialCommunityIcons name="chat-processing" size={24} color="#fff" />
          <Text style={styles.chatButtonText}>Chat with AI Assistant</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-symptom')}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
