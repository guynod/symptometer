import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Symptom } from '../types/symptom';

interface SymptomItemProps {
  symptom: Symptom;
  onDelete: () => void;
}

export function SymptomItem({ symptom, onDelete }: SymptomItemProps) {
  const handleDelete = () => {
    Alert.alert(
      'Delete Symptom',
      `Are you sure you want to delete "${symptom.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: onDelete,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.name}>{symptom.name}</Text>
        <Text style={styles.bodyPart}>{symptom.bodyPart}</Text>
        {symptom.notes && (
          <Text style={styles.notes} numberOfLines={2}>
            {symptom.notes}
          </Text>
        )}
      </View>
      <TouchableOpacity
        onPress={handleDelete}
        style={styles.deleteButton}
      >
        <MaterialCommunityIcons
          name="delete-outline"
          size={24}
          color="#ff3b30"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  bodyPart: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 8,
  },
}); 