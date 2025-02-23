import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SymptomInput } from '../types/symptom';
import { isValidBodyPart, sanitizeString } from '../utils/validation';
import { FrequentlyUsedItem, getFrequentlyUsedSymptoms, incrementSymptomUsage, incrementBodyPartUsage } from '../services/frequently-used';
import BodyPartSelector from './BodyPartSelector';

interface SymptomFormProps {
  onSubmit: (symptom: SymptomInput) => void;
  onCancel: () => void;
  initialValues?: Partial<SymptomInput>;
  isLoading?: boolean;
}

const SymptomForm: React.FC<SymptomFormProps> = ({ onSubmit, onCancel, initialValues, isLoading }) => {
  const [symptomName, setSymptomName] = useState(initialValues?.name ?? '');
  const [bodyPart, setBodyPart] = useState(initialValues?.bodyPart ?? '');
  const [showBodyMap, setShowBodyMap] = useState(false);
  const [recentSymptoms, setRecentSymptoms] = useState<FrequentlyUsedItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecentSymptoms();
  }, []);

  const loadRecentSymptoms = async () => {
    try {
      const symptoms = await getFrequentlyUsedSymptoms();
      setRecentSymptoms(symptoms);
    } catch (error) {
      console.error('Error loading recent symptoms:', error);
    }
  };

  const handleSubmit = async () => {
    if (!symptomName.trim()) {
      setError('Please enter a symptom name');
      return;
    }
    if (!bodyPart.trim()) {
      setError('Please select a body part');
      return;
    }

    try {
      // Increment usage counts
      await Promise.all([
        incrementSymptomUsage(symptomName),
        incrementBodyPartUsage(bodyPart)
      ]);

      const sanitizedSymptomName = sanitizeString(symptomName);
      const sanitizedBodyPart = bodyPart.toLowerCase();

      onSubmit({
        name: sanitizedSymptomName,
        bodyPart: sanitizedBodyPart,
      });

      // Reset form
      setSymptomName('');
      setBodyPart('');
      setError(null);
      setShowBodyMap(false);
    } catch (error) {
      console.error('Error submitting symptom:', error);
      Alert.alert('Error', 'Failed to submit symptom. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          {/* Symptom Name Section */}
          <Text style={styles.label}>Symptom Name</Text>
          
          {/* Recent Symptoms */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.recentContainer}
          >
            {recentSymptoms.map((symptom, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.recentItem,
                  symptom.name === symptomName && styles.selectedItem
                ]}
                onPress={() => setSymptomName(symptom.name)}
              >
                <Text
                  style={[
                    styles.recentItemText,
                    symptom.name === symptomName && styles.selectedItemText
                  ]}
                >
                  {symptom.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Custom Symptom Input */}
          <TextInput
            style={styles.input}
            value={symptomName}
            onChangeText={setSymptomName}
            placeholder="Or enter a new symptom name"
            maxLength={50}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Body Part Section */}
          <View style={styles.bodyPartSection}>
            <Text style={styles.label}>Body Part</Text>
            <TouchableOpacity
              style={styles.mapToggle}
              onPress={() => setShowBodyMap(!showBodyMap)}
            >
              <MaterialCommunityIcons
                name={showBodyMap ? 'close' : 'human'}
                size={24}
                color="#007AFF"
              />
              <Text style={styles.mapToggleText}>
                {showBodyMap ? 'Hide Body Map' : 'Show Body Map'}
              </Text>
            </TouchableOpacity>
          </View>

          {showBodyMap ? (
            <BodyPartSelector
              onSelect={setBodyPart}
              selectedPart={bodyPart}
            />
          ) : (
            <TextInput
              style={styles.input}
              value={bodyPart}
              onChangeText={setBodyPart}
              placeholder="Enter body part"
              maxLength={100}
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}

          {error && (
            <Text style={styles.error}>{error}</Text>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={[styles.buttonText, styles.submitButtonText, isLoading && styles.buttonDisabledText]}>
                {isLoading ? 'Saving...' : 'Add Symptom'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  recentContainer: {
    marginBottom: 12,
  },
  recentItem: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedItem: {
    backgroundColor: '#007AFF',
  },
  recentItemText: {
    color: '#333',
  },
  selectedItemText: {
    color: '#fff',
  },
  bodyPartSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mapToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapToggleText: {
    marginLeft: 8,
    color: '#007AFF',
    fontSize: 16,
  },
  error: {
    color: '#ff3b30',
    marginBottom: 16,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonDisabledText: {
    color: '#fff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  submitButtonText: {
    color: 'white',
  },
});

export default SymptomForm; 