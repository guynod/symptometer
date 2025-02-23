import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SymptomForm from '../../components/SymptomForm';
import { SymptomItem } from '../../components/SymptomItem';
import { Symptom } from '../../types/symptom';
import { getAllSymptoms, addSymptom, deleteSymptom } from '../../services/symptoms';
import { useAuth } from '../../config/AuthContext';

export default function HomeScreen() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  const loadSymptoms = async () => {
    // Only attempt to load symptoms if we have an authenticated user
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
    }, [user]) // Add user as a dependency
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSymptoms();
    setRefreshing(false);
  };

  const handleAddSymptom = async (symptomInput: { name: string; bodyPart: string }) => {
    if (!user) {
      console.error('Cannot add symptom: User not authenticated');
      return;
    }

    try {
      await addSymptom(symptomInput);
      await loadSymptoms();
      setShowForm(false);
    } catch (error) {
      console.error('Error adding symptom:', error);
    }
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
      {showForm ? (
        <SymptomForm
          onSubmit={handleAddSymptom}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <>
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
                  Tap the button below to add your first symptom
                </Text>
              </View>
            }
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowForm(true)}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Add New Symptom</Text>
          </TouchableOpacity>
        </>
      )}
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
