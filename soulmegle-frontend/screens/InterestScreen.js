import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import * as Speech from 'expo-speech';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://your-backend-url.com'; 

export default function InterestScreen({ navigation }) {
  const [interest, setInterest] = useState('');

  const startListening = async () => {
    try {
      Speech.speak('Please speak your interests', { language: 'en' });
      // Simulating speech-to-text (replace with real API call)
      setTimeout(() => {
        const extractedInterest = 'I love dogs and coding';
        setInterest(extractedInterest);
        Alert.alert('Detected Interest', extractedInterest);
      }, 3000);
    } catch (error) {
      console.error('Speech recognition error:', error);
    }
  };

  const saveInterest = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.post(`${API_URL}/save-interest`, { interest_vector: interest }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', response.data.message);
      navigation.navigate('Chat');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save interest');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24 }}>Soul will extract - Traits</Text>
      <TouchableOpacity onPress={startListening} style={styles.button}>
        <Text style={{ color: 'white' }}>Speak Interest</Text>
      </TouchableOpacity>
      {interest ? (
        <TouchableOpacity onPress={saveInterest} style={styles.button}>
          <Text style={{ color: 'white' }}>Save Interest</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = {
  button: { backgroundColor: 'blue', padding: 10, borderRadius: 5, marginTop: 10 },
};
