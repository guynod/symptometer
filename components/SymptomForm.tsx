import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SymptomInput } from '../types/symptom';
import { isValidBodyPart, sanitizeString } from '../utils/validation';

interface SymptomFormProps {
  onSubmit: (symptom: SymptomInput) => Promise<void>;
  initialValues?: Partial<SymptomInput>;
  isLoading?: boolean;
}

const bodyParts = [
  'head', 'neck', 'shoulder', 'arm', 'elbow', 'wrist', 'hand',
  'chest', 'back', 'abdomen', 'hip', 'thigh', 'knee', 'leg',
  'ankle', 'foot', 'general'
];

export default function SymptomForm({ onSubmit, initialValues, isLoading }: SymptomFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [bodyPart, setBodyPart] = useState(initialValues?.bodyPart ?? 'general');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setError(null);
      
      // Validate inputs
      const sanitizedName = sanitizeString(name);
      if (!sanitizedName) {
        setError('Please enter a symptom name');
        return;
      }
      
      if (!isValidBodyPart(bodyPart)) {
        setError('Please select a valid body part');
        return;
      }

      // Create symptom input
      const symptomInput: SymptomInput = {
        name: sanitizedName,
        bodyPart: bodyPart.toLowerCase(),
      };

      await onSubmit(symptomInput);
      
      // Clear form on success
      setName('');
      setBodyPart('general');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <Text style={styles.label}>Symptom Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter symptom name"
            maxLength={50}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Body Part</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={bodyPart}
              onValueChange={setBodyPart}
              style={styles.picker}
            >
              {bodyParts.map((part) => (
                <Picker.Item
                  key={part}
                  label={part.charAt(0).toUpperCase() + part.slice(1)}
                  value={part}
                />
              ))}
            </Picker>
          </View>

          {error && (
            <Text style={styles.error}>{error}</Text>
          )}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Saving...' : 'Add Symptom'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  error: {
    color: '#ff3b30',
    marginBottom: 16,
    fontSize: 14,
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
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 