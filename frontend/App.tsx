import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Quantum Security Services
import { QuantumSecurityProvider } from './src/services/QuantumSecurityService';
import { QuantumAnalyticsProvider } from './src/services/QuantumAnalyticsService';
import { QuantumStateProvider } from './src/services/QuantumStateService';

// Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import OwnerDashboardScreen from './src/screens/owner/OwnerDashboardScreen';
import SitterDashboardScreen from './src/screens/sitter/SitterDashboardScreen';
import BookingFormScreen from './src/screens/booking/BookingFormScreen';
import SessionViewerScreen from './src/screens/session/SessionViewerScreen';
import ChatScreen from './src/screens/chat/ChatScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import SearchScreen from './src/screens/search/SearchScreen';

// Quantum Components
import { QuantumSplashScreen } from './src/components/QuantumSplashScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for authenticated users
function TabNavigator({ userRole }: { userRole: 'owner' | 'sitter' }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#00D4AA',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#00D4AA',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={userRole === 'owner' ? OwnerDashboardScreen : SitterDashboardScreen}
        options={{ title: '🔒 Quantum Dashboard' }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{ title: '🔍 Find Sitters' }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={SessionViewerScreen}
        options={{ title: '📅 My Bookings' }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{ title: '💬 Messages' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: '👤 Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'owner' | 'sitter' | null>(null);

  useEffect(() => {
    // Quantum initialization
    initializeQuantumApp();
  }, [initializeQuantumApp]);

  const initializeQuantumApp = useCallback(async () => {
    try {
      // Simulate quantum security initialization
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check authentication status
      const authStatus = await checkAuthenticationStatus();
      setIsAuthenticated(authStatus.isAuthenticated);
      setUserRole(authStatus.userRole);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Quantum initialization error:', error);
      setIsLoading(false);
    }
  }, []);

  const checkAuthenticationStatus = async () => {
    // TODO: Implement quantum authentication check
    return {
      isAuthenticated: false,
      userRole: null,
    };
  };

  if (isLoading) {
    return <QuantumSplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <QuantumSecurityProvider>
        <QuantumAnalyticsProvider>
          <QuantumStateProvider>
            <NavigationContainer>
              <StatusBar style="light" backgroundColor="#00D4AA" />
              
              <Stack.Navigator
                screenOptions={{
                  headerShown: false,
                }}
              >
                {!isAuthenticated ? (
                  // Auth Stack
                  <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                  </>
                ) : (
                  // Main App Stack
                  <>
                    <Stack.Screen 
                      name="MainTabs" 
                      component={() => <TabNavigator userRole={userRole!} />}
                    />
                    <Stack.Screen 
                      name="BookingForm" 
                      component={BookingFormScreen}
                      options={{
                        headerShown: true,
                        title: '🔐 Quantum Booking',
                        headerStyle: { backgroundColor: '#00D4AA' },
                        headerTintColor: '#FFFFFF',
                      }}
                    />
                  </>
                )}
              </Stack.Navigator>
            </NavigationContainer>
          </QuantumStateProvider>
        </QuantumAnalyticsProvider>
      </QuantumSecurityProvider>
    </SafeAreaProvider>
  );
}
