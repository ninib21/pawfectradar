import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// 🔐 QUANTUM PROVIDERS
import { AuthProvider, useAuth } from './shared/context/AuthContext';
import { BookingProvider } from './shared/context/BookingContext';
import { QuantumAnalyticsProvider } from './services/QuantumAnalyticsService';

// 🌐 QUANTUM SERVICES
import { quantumWebSocket } from './shared/api/websocketService';
import { quantumAPI } from './shared/api/apiClient';

// 📱 QUANTUM SCREENS
import LoginScreen from './screens/auth/LoginScreen';
import OwnerDashboardScreen from './screens/owner/OwnerDashboardScreen';

// 🔧 QUANTUM UTILITIES
import { useQuantumAnalytics } from './services/QuantumAnalyticsService';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 🔐 QUANTUM AUTHENTICATION WRAPPER
const AuthWrapper: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { trackScreen } = useQuantumAnalytics();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize WebSocket connection
      quantumWebSocket.connect();
      
      // Track user session
      trackScreen('app_launch');
    } else {
      // Disconnect WebSocket when not authenticated
      quantumWebSocket.disconnect();
    }
  }, [isAuthenticated, user]);

  if (isLoading) {
    // Show quantum loading screen
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        {/* Add your quantum loading component here */}
      </SafeAreaProvider>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="MainApp" component={MainAppNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// 🔐 AUTHENTICATION NAVIGATOR
const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      {/* Add other auth screens here */}
    </Stack.Navigator>
  );
};

// 📱 MAIN APP NAVIGATOR
const MainAppNavigator: React.FC = () => {
  const { user } = useAuth();
  const { trackScreen } = useQuantumAnalytics();

  useEffect(() => {
    // Track screen based on user role
    if (user?.role === 'owner') {
      trackScreen('owner_dashboard');
    } else if (user?.role === 'sitter') {
      trackScreen('sitter_dashboard');
    }
  }, [user]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user?.role === 'owner' ? (
        <Stack.Screen name="OwnerDashboard" component={OwnerDashboardScreen} />
      ) : (
        <Stack.Screen name="SitterDashboard" component={SitterDashboardScreen} />
      )}
    </Stack.Navigator>
  );
};

// 🐕 SITTER DASHBOARD SCREEN (placeholder)
const SitterDashboardScreen: React.FC = () => {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      {/* Add your sitter dashboard component here */}
    </SafeAreaProvider>
  );
};

// 🔐 QUANTUM MAIN APP
const App: React.FC = () => {
  useEffect(() => {
    // Initialize quantum security
    initializeQuantumSecurity();
    
    // Setup global error handling
    setupErrorHandling();
    
    // Setup app state listeners
    setupAppStateListeners();
  }, []);

  const initializeQuantumSecurity = async () => {
    try {
      // Initialize quantum analytics
      await quantumAPI.trackEvent({
        action: 'app_initialized',
        category: 'app',
        label: 'quantum_security',
        value: 1,
      });
      
      console.log('🔐 Quantum security initialized');
    } catch (error) {
      console.error('Failed to initialize quantum security:', error);
    }
  };

  const setupErrorHandling = () => {
    // Global error handler
    const handleError = (error: Error, isFatal?: boolean) => {
      console.error('Global error:', error);
      
      // Track error in analytics
      quantumAPI.trackEvent({
        action: 'app_error',
        category: 'error',
        label: isFatal ? 'fatal' : 'non_fatal',
        value: 1,
        metadata: {
          error: error.message,
          stack: error.stack,
        },
      });
    };

    // Set up error handlers
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        handleError(event.error);
      });

      window.addEventListener('unhandledrejection', (event) => {
        handleError(new Error(event.reason), false);
      });
    }
  };

  const setupAppStateListeners = () => {
    // Handle app state changes
    if (typeof window !== 'undefined') {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          // App went to background
          quantumWebSocket.disconnect();
        } else {
          // App came to foreground
          quantumWebSocket.connect();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      
      {/* 🔐 QUANTUM ANALYTICS PROVIDER */}
      <QuantumAnalyticsProvider>
        {/* 🔐 AUTHENTICATION PROVIDER */}
        <AuthProvider>
          {/* 📅 BOOKING PROVIDER */}
          <BookingProvider>
            <AuthWrapper />
          </BookingProvider>
        </AuthProvider>
      </QuantumAnalyticsProvider>
    </SafeAreaProvider>
  );
};

export default App;
