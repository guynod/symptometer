import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import SymptomForm from '../components/SymptomForm';
import { SymptomInput } from '../types/symptom';
import { addSymptom } from '../services/symptoms';

export default function AddSymptomScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (symptomInput: SymptomInput) => {
    try {
      console.log('Starting symptom submission:', symptomInput);
      setIsLoading(true);
      const symptomId = await addSymptom(symptomInput);
      console.log('Symptom added successfully with ID:', symptomId);
      router.back(); // Return to previous screen after successful addition
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      Alert.alert('Error', 'Failed to add symptom. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SymptomForm onSubmit={handleSubmit} isLoading={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
}); 