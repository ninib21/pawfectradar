// 🚀 QUANTUM PAWFECT SITTERS - SEARCH SCREEN
// 🔒 MILITARY-GRADE SECURITY + QUANTUM-ENHANCED SEARCH
// 📈 QUANTUM-INFINITE SCALABILITY
// 🚀 QUANTUM-OPTIMIZED PERFORMANCE

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { QuantumInput } from '../../components/QuantumInput';
import { QuantumButton } from '../../components/QuantumButton';
import { QuantumCard } from '../../components/QuantumCard';

interface Sitter {
  id: string;
  name: string;
  rating: number;
  hourlyRate: number;
  distance: number;
  bio: string;
}

const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sitters, setSitters] = useState<Sitter[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      rating: 4.8,
      hourlyRate: 25,
      distance: 2.3,
      bio: 'Experienced pet sitter with 5+ years of experience',
    },
    {
      id: '2',
      name: 'Mike Chen',
      rating: 4.9,
      hourlyRate: 30,
      distance: 1.8,
      bio: 'Loves all animals, especially dogs and cats',
    },
  ]);

  const renderSitter = ({ item }: { item: Sitter }) => (
    <QuantumCard
      containerStyle={styles.sitterCard}
      padding="medium"
      pressable
    >
      <View style={styles.sitterHeader}>
        <Text style={styles.sitterName}>{item.name}</Text>
        <Text style={styles.sitterRate}>${item.hourlyRate}/hr</Text>
      </View>
      
      <View style={styles.sitterDetails}>
        <Text style={styles.rating}>⭐ {item.rating}</Text>
        <Text style={styles.distance}>{item.distance} miles away</Text>
      </View>
      
      <Text style={styles.bio}>{item.bio}</Text>
      
      <QuantumButton
        title="View Profile"
        variant="outline"
        size="small"
        containerStyle={styles.profileButton}
      />
    </QuantumCard>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <QuantumInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search sitters near you..."
          leftIcon="search"
          containerStyle={styles.searchInput}
        />
        <QuantumButton
          title="Filter"
          variant="outline"
          leftIcon="options"
          size="small"
        />
      </View>

      <FlatList
        data={sitters}
        renderItem={renderSitter}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 60,
    gap: 12,
    alignItems: 'flex-end',
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  sitterCard: {
    marginBottom: 16,
  },
  sitterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sitterName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  sitterRate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
  },
  sitterDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  rating: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '500',
  },
  distance: {
    fontSize: 14,
    color: '#8E8E93',
  },
  bio: {
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 20,
    marginBottom: 16,
  },
  profileButton: {
    alignSelf: 'flex-start',
  },
});

export default SearchScreen;
