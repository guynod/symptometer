import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Symptom } from '../../types/symptom';
import { getAllSymptoms, reactivateSymptom } from '../../services/symptoms';
import { useAuth } from '../../config/AuthContext';

export default function InactiveSymptomsScreen() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadSymptoms = async (showLoadingIndicator = true) => {
    if (!user) {
      setSymptoms([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      if (showLoadingIndicator) {
        setIsLoading(true);
      }
      setError(null);
      const allSymptoms = await getAllSymptoms();
      // Filter for inactive symptoms only
      const inactiveSymptoms = allSymptoms.filter(symptom => !symptom.isActive);
      setSymptoms(inactiveSymptoms);
    } catch (err) {
      console.error('Error loading inactive symptoms:', err);
      setError('Failed to load inactive symptoms');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadSymptoms();
  }, [user]); // Add user as dependency

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadSymptoms(false);
  };

  const handleReactivate = async (symptom: Symptom) => {
    if (!user) {
      console.error('Cannot reactivate symptom: User not authenticated');
      return;
    }

    Alert.alert(
      'Reactivate Symptom',
      `Are you sure you want to reactivate "${symptom.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reactivate',
          style: 'default',
          onPress: async () => {
            try {
              await reactivateSymptom(symptom.id);
              await loadSymptoms(false);
            } catch (err) {
              console.error('Error reactivating symptom:', err);
              Alert.alert('Error', 'Failed to reactivate symptom');
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
        onPress={() => handleReactivate(item)}
        style={styles.reactivateButton}
      >
        <MaterialCommunityIcons name="restore" size={24} color="#007AFF" />
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

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Please sign in to view inactive symptoms</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadSymptoms()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {symptoms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No inactive symptoms</Text>
          <Text style={styles.emptySubtext}>
            Deleted symptoms will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={symptoms}
          renderItem={renderSymptom}
          keyExtractor={item => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
        />
      )}
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
  reactivateButton: {
    padding: 8,
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