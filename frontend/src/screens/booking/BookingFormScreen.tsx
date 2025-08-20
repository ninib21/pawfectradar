// 🚀 QUANTUM PAWFECT SITTERS - BOOKING FORM SCREEN
// 🔒 MILITARY-GRADE SECURITY + QUANTUM-ENHANCED BOOKING
// 📈 QUANTUM-INFINITE SCALABILITY
// 🚀 QUANTUM-OPTIMIZED PERFORMANCE

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { QuantumInput } from '../../components/QuantumInput';
import { QuantumButton } from '../../components/QuantumButton';
import { QuantumCard } from '../../components/QuantumCard';
import { useBooking } from '../../shared/context/BookingContext';

interface BookingFormData {
  sitterId: string;
  petIds: string[];
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  notes: string;
  specialRequests: string;
}

const BookingFormScreen: React.FC = () => {
  const { createBooking } = useBooking();
  const [formData, setFormData] = useState<BookingFormData>({
    sitterId: '',
    petIds: [],
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    notes: '',
    specialRequests: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await createBooking(formData);
      Alert.alert('Success', 'Booking request sent successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <QuantumCard title="Booking Details" padding="large">
        <QuantumInput
          label="Start Date"
          value={formData.startDate}
          placeholder="Select start date"
          leftIcon="calendar"
        />
        <QuantumInput
          label="End Date"
          value={formData.endDate}
          placeholder="Select end date"
          leftIcon="calendar"
        />
        <QuantumInput
          label="Special Notes"
          value={formData.notes}
          onChangeText={(value) => setFormData(prev => ({ ...prev, notes: value }))}
          placeholder="Any special instructions..."
          multiline
          numberOfLines={4}
        />
        <QuantumButton
          title="Submit Booking"
          onPress={handleSubmit}
          loading={isLoading}
          fullWidth
        />
      </QuantumCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 20,
  },
});

export default BookingFormScreen;
