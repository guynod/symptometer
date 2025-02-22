import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Symptom } from '../../types/symptom';
import { getActiveSymptoms, deleteSymptom } from '../../services/symptoms';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getDb } from '../../config/firebase';
import { addDoc, collection, deleteDoc, doc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

export default function HomeScreen() {
  const router = useRouter();
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSymptoms();
  }, []);

  useEffect(() => {
    // Test Firebase connection
    const testConnection = async () => {
      try {
        const db = getDb();
        const testDoc = await addDoc(collection(db, 'symptoms'), {
          name: 'Test Symptom',
          bodyPart: 'general',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          isActive: true
        });
        console.log('Firebase connection successful, test document created:', testDoc.id);
        // Clean up test document
        await deleteDoc(doc(db, 'symptoms', testDoc.id));
      } catch (error) {
        console.error('Firebase connection test failed:', error);
      }
    };
    testConnection();
  }, []);

  const loadSymptoms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedSymptoms = await getActiveSymptoms();
      setSymptoms(fetchedSymptoms);
    } catch (err) {
      setError('Failed to load symptoms');
      console.error('Error loading symptoms:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (symptom: Symptom) => {
    Alert.alert(
      'Delete Symptom',
      `Are you sure you want to delete "${symptom.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSymptom(symptom.id);
              await loadSymptoms(); // Refresh the list
            } catch (err) {
              Alert.alert('Error', 'Failed to delete symptom');
            }
          },
        },
      ]
    );
  };

  const renderSymptom = ({ item }: { item: Symptom }) => (
    <View style={styles.symptomItem}>
      <View style={styles.symptomInfo}>
        <Text style={styles.symptomName}>{item.name}</Text>
        <Text style={styles.bodyPart}>{item.bodyPart}</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleDelete(item)}
        style={styles.deleteButton}
      >
        <MaterialCommunityIcons name="delete-outline" size={24} color="#ff3b30" />
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSymptoms}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {symptoms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No symptoms added yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the button below to add your first symptom
          </Text>
        </View>
      ) : (
        <FlatList
          data={symptoms}
          renderItem={renderSymptom}
          keyExtractor={item => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      )}
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('../add-symptom')}
      >
        <MaterialCommunityIcons name="plus" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add New Symptom</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  symptomInfo: {
    flex: 1,
  },
  symptomName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  bodyPart: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
