import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Quantum Services
import { useQuantumAnalytics } from '../../services/QuantumAnalyticsService';
import { useQuantumState } from '../../services/QuantumStateService';
import { useQuantumSecurity } from '../../services/QuantumSecurityService';

// Quantum Components
import { QuantumCard } from '../../components/QuantumCard';
import { QuantumButton } from '../../components/QuantumButton';

const { width, height } = Dimensions.get('window');

export default function OwnerDashboardScreen() {
  const navigation = useNavigation();
  const { trackScreen, trackUserAction } = useQuantumAnalytics();
  const { state } = useQuantumState();
  const { quantumToken } = useQuantumSecurity();

  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalPets: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    trackScreen('OwnerDashboardScreen');
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Calculate stats from state
    const totalPets = state.pets.length;
    const activeBookings = state.bookings.filter(b => 
      ['pending', 'confirmed', 'in-progress'].includes(b.status)
    ).length;
    const completedBookings = state.bookings.filter(b => 
      b.status === 'completed'
    ).length;
    const totalSpent = state.bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.totalPrice, 0);

    setStats({
      totalPets,
      activeBookings,
      completedBookings,
      totalSpent,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    trackUserAction('dashboard_refresh');
    
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    loadDashboardData();
    
    setRefreshing(false);
  };

  const handleAddPet = () => {
    trackUserAction('add_pet_clicked');
    // Navigate to add pet screen
    Alert.alert('Add Pet', 'Add pet feature coming soon!');
  };

  const handleFindSitter = () => {
    trackUserAction('find_sitter_clicked');
    navigation.navigate('Search' as never);
  };

  const handleViewBookings = () => {
    trackUserAction('view_bookings_clicked');
    navigation.navigate('Bookings' as never);
  };

  const handleViewMessages = () => {
    trackUserAction('view_messages_clicked');
    navigation.navigate('Chat' as never);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={['#00D4AA', '#00B894']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>
              Welcome back, {state.user?.firstName || 'User'}! 👋
            </Text>
            <Text style={styles.userRole}>
              🔒 Verified Pet Owner • Trust Score: {state.user?.trustScore || 0}%
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile' as never)}
          >
            <Ionicons name="person-circle" size={40} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Quantum Stats */}
      <View style={styles.statsContainer}>
        <QuantumCard title="📊 Quantum Statistics" secure={true}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="paw" size={24} color="#00D4AA" />
              <Text style={styles.statNumber}>{stats.totalPets}</Text>
              <Text style={styles.statLabel}>My Pets</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="calendar" size={24} color="#0EA5E9" />
              <Text style={styles.statNumber}>{stats.activeBookings}</Text>
              <Text style={styles.statLabel}>Active Bookings</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
              <Text style={styles.statNumber}>{stats.completedBookings}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="card" size={24} color="#F59E0B" />
              <Text style={styles.statNumber}>${stats.totalSpent}</Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
          </View>
        </QuantumCard>
      </View>

      {/* My Pets Section */}
      <View style={styles.section}>
        <QuantumCard title="🐕 My Pets" secure={true}>
          {state.pets.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {state.pets.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  style={styles.petCard}
                  onPress={() => trackUserAction('pet_card_clicked', { petId: pet.id })}
                >
                  <Ionicons 
                    name={pet.type === 'dog' ? 'paw' : 'fish'} 
                    size={32} 
                    color="#00D4AA" 
                  />
                  <Text style={styles.petName}>{pet.name}</Text>
                  <Text style={styles.petBreed}>{pet.breed}</Text>
                  <Text style={styles.petAge}>{pet.age} years old</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="paw-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>No pets added yet</Text>
              <Text style={styles.emptySubtext}>Add your first pet to get started</Text>
            </View>
          )}
          
          <QuantumButton
            title="➕ Add New Pet"
            onPress={handleAddPet}
            variant="success"
            size="md"
          />
        </QuantumCard>
      </View>

      {/* Recent Bookings */}
      <View style={styles.section}>
        <QuantumCard title="📅 Recent Bookings" secure={true}>
          {state.bookings.length > 0 ? (
            <View>
              {state.bookings.slice(0, 3).map((booking) => (
                <TouchableOpacity
                  key={booking.id}
                  style={styles.bookingItem}
                  onPress={() => trackUserAction('booking_clicked', { bookingId: booking.id })}
                >
                  <View style={styles.bookingInfo}>
                    <Text style={styles.bookingDate}>
                      {new Date(booking.startTime).toLocaleDateString()}
                    </Text>
                    <Text style={styles.bookingTime}>
                      {new Date(booking.startTime).toLocaleTimeString()} - {new Date(booking.endTime).toLocaleTimeString()}
                    </Text>
                    <Text style={styles.bookingStatus}>
                      Status: {booking.status}
                    </Text>
                  </View>
                  <View style={styles.bookingPrice}>
                    <Text style={styles.priceText}>${booking.totalPrice}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#64748B" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>No bookings yet</Text>
              <Text style={styles.emptySubtext}>Book your first pet sitting session</Text>
            </View>
          )}
          
          <QuantumButton
            title="📅 View All Bookings"
            onPress={handleViewBookings}
            variant="secondary"
            size="md"
          />
        </QuantumCard>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <QuantumCard title="⚡ Quick Actions" secure={true}>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleFindSitter}
            >
              <Ionicons name="search" size={24} color="#00D4AA" />
              <Text style={styles.actionText}>Find Sitter</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleViewMessages}
            >
              <Ionicons name="chatbubbles" size={24} color="#0EA5E9" />
              <Text style={styles.actionText}>Messages</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('BookingForm' as never)}
            >
              <Ionicons name="add-circle" size={24} color="#22C55E" />
              <Text style={styles.actionText}>New Booking</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Profile' as never)}
            >
              <Ionicons name="settings" size={24} color="#F59E0B" />
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </QuantumCard>
      </View>

      {/* Security Status */}
      {quantumToken && (
        <View style={styles.securityStatus}>
          <Text style={styles.securityText}>🔒 Quantum Security Active</Text>
          <Text style={styles.securitySubtext}>Military-Grade Protection Enabled</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  profileButton: {
    padding: 5,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: -20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  petCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    alignItems: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 8,
  },
  petBreed: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  petAge: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 5,
    textAlign: 'center',
  },
  bookingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  bookingInfo: {
    flex: 1,
  },
  bookingDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  bookingTime: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  bookingStatus: {
    fontSize: 12,
    color: '#00D4AA',
    marginTop: 2,
  },
  bookingPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 8,
  },
  securityStatus: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  securityText: {
    color: '#22C55E',
    fontSize: 16,
    fontWeight: '600',
  },
  securitySubtext: {
    color: '#16A34A',
    fontSize: 14,
    marginTop: 5,
  },
});
