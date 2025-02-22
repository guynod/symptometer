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
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SymptomInput } from '../types/symptom';
import { isValidBodyPart, sanitizeString } from '../utils/validation';

interface SymptomFormProps {
  onSubmit: (symptom: SymptomInput) => Promise<void>;
  initialValues?: Partial<SymptomInput>;
  isLoading?: boolean;
}

// Organized body parts by category
const bodyPartCategories = {
  head: {
    label: 'Head & Face',
    parts: [
      'forehead',
      'left eye',
      'right eye',
      'nose',
      'left ear',
      'right ear',
      'left cheek',
      'right cheek',
      'mouth',
      'jaw',
      'throat',
    ]
  },
  neck: {
    label: 'Neck & Shoulders',
    parts: [
      'front neck',
      'back neck',
      'left shoulder',
      'right shoulder',
    ]
  },
  arms: {
    label: 'Arms & Hands',
    parts: [
      'left upper arm',
      'right upper arm',
      'left elbow',
      'right elbow',
      'left forearm',
      'right forearm',
      'left wrist',
      'right wrist',
      'left hand',
      'right hand',
    ]
  },
  torso: {
    label: 'Torso',
    parts: [
      'chest',
      'upper back',
      'middle back',
      'lower back',
      'upper abdomen',
      'lower abdomen',
    ]
  },
  legs: {
    label: 'Legs & Feet',
    parts: [
      'left hip',
      'right hip',
      'left thigh',
      'right thigh',
      'left knee',
      'right knee',
      'left calf',
      'right calf',
      'left ankle',
      'right ankle',
      'left foot',
      'right foot',
    ]
  },
  other: {
    label: 'Other',
    parts: ['general', 'custom']
  }
};

export default function SymptomForm({ onSubmit, initialValues, isLoading }: SymptomFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [bodyPart, setBodyPart] = useState(initialValues?.bodyPart ?? 'general');
  const [customBodyPart, setCustomBodyPart] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
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
      
      const finalBodyPart = showCustomInput ? sanitizeString(customBodyPart) : bodyPart;
      
      if (showCustomInput && !finalBodyPart) {
        setError('Please enter a body part');
        return;
      }

      // Create symptom input
      const symptomInput: SymptomInput = {
        name: sanitizedName,
        bodyPart: finalBodyPart.toLowerCase(),
      };

      await onSubmit(symptomInput);
      
      // Clear form on success
      setName('');
      setBodyPart('general');
      setCustomBodyPart('');
      setShowCustomInput(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleBodyPartChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      setBodyPart(value);
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
              selectedValue={showCustomInput ? 'custom' : bodyPart}
              onValueChange={handleBodyPartChange}
              style={styles.picker}
              itemStyle={styles.pickerItem} // This will make items more visible on iOS
            >
              {Object.entries(bodyPartCategories).map(([category, { label, parts }]) => (
                <Picker.Item
                  key={category}
                  label={`── ${label} ──`}
                  value={`category_${category}`}
                  enabled={false}
                  style={styles.pickerHeader}
                />
              )).concat(
                Object.values(bodyPartCategories).flatMap(({ parts }) =>
                  parts.map(part => (
                    <Picker.Item
                      key={part}
                      label={part.charAt(0).toUpperCase() + part.slice(1)}
                      value={part}
                    />
                  ))
                )
              )}
            </Picker>
          </View>

          {showCustomInput && (
            <View style={styles.customInputContainer}>
              <Text style={styles.label}>Custom Body Part</Text>
              <TextInput
                style={styles.input}
                value={customBodyPart}
                onChangeText={setCustomBodyPart}
                placeholder="Enter specific body part (e.g., left thumb)"
                maxLength={100}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          )}

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
    height: Platform.OS === 'ios' ? 200 : 50,
  },
  pickerItem: {
    fontSize: 16,
    height: 120, // Makes items taller and more visible on iOS
  },
  pickerHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    backgroundColor: '#f5f5f5',
  },
  customInputContainer: {
    marginTop: 8,
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