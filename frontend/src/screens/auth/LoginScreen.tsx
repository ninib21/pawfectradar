import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Quantum Services
import { useQuantumSecurity } from '../../services/QuantumSecurityService';
import { useQuantumAnalytics } from '../../services/QuantumAnalyticsService';
import { useQuantumState } from '../../services/QuantumStateService';

// Quantum Components
import { QuantumInput } from '../../components/QuantumInput';
import { QuantumButton } from '../../components/QuantumButton';
import { QuantumCard } from '../../components/QuantumCard';

const { width, height } = Dimensions.get('window');

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const navigation = useNavigation();
  const { authenticate, isBiometricAvailable, quantumToken } = useQuantumSecurity();
  const { trackScreen, trackUserAction } = useQuantumAnalytics();
  const { setUser, setLoading, setError } = useQuantumState();

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    trackScreen('LoginScreen');
  }, []);

  const handleBiometricLogin = async () => {
    try {
      setIsAuthenticating(true);
      trackUserAction('biometric_login_attempt');
      
      const success = await authenticate();
      if (success) {
        trackUserAction('biometric_login_success');
        // Navigate to main app
        navigation.navigate('MainTabs' as never);
      } else {
        trackUserAction('biometric_login_failed');
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      trackUserAction('biometric_login_error', { error: error.message });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleEmailLogin = async (data: LoginFormData) => {
    try {
      setIsAuthenticating(true);
      setLoading(true);
      trackUserAction('email_login_attempt', { email: data.email });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock user data
      const mockUser = {
        id: '1',
        email: data.email,
        firstName: 'John',
        lastName: 'Doe',
        role: 'owner' as const,
        trustScore: 95,
        isVerified: true,
        phoneNumber: '+1234567890',
      };

      setUser(mockUser);
      trackUserAction('email_login_success', { email: data.email });
      
      // Navigate to main app
      navigation.navigate('MainTabs' as never);
    } catch (error) {
      console.error('Email login error:', error);
      setError('Login failed. Please try again.');
      trackUserAction('email_login_error', { error: error.message });
    } finally {
      setIsAuthenticating(false);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsAuthenticating(true);
      trackUserAction('google_login_attempt');

      // Simulate Google OAuth
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockUser = {
        id: '2',
        email: 'john.doe@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'owner' as const,
        trustScore: 98,
        isVerified: true,
        phoneNumber: '+1234567890',
      };

      setUser(mockUser);
      trackUserAction('google_login_success');
      
      navigation.navigate('MainTabs' as never);
    } catch (error) {
      console.error('Google login error:', error);
      setError('Google login failed. Please try again.');
      trackUserAction('google_login_error', { error: error.message });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleRegister = () => {
    trackUserAction('navigate_to_register');
    navigation.navigate('Register' as never);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <LinearGradient
          colors={['#00D4AA', '#00B894', '#00A085']}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <Ionicons name="shield-checkmark" size={60} color="#FFFFFF" />
            <Text style={styles.title}>🔒 Quantum PawfectSitters</Text>
            <Text style={styles.subtitle}>Military-Grade Pet Sitting Security</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <QuantumCard title="🔐 Quantum Authentication" secure={true}>
            {isBiometricAvailable && (
              <View style={styles.biometricSection}>
                <QuantumButton
                  title="🔐 Biometric Login"
                  onPress={handleBiometricLogin}
                  variant="quantum"
                  size="lg"
                  biometric={true}
                  loading={isAuthenticating}
                />
                <Text style={styles.orText}>or</Text>
              </View>
            )}

            <View style={styles.formSection}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <QuantumInput
                    placeholder="📧 Email Address"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email?.message}
                    quantumEncrypted={true}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <QuantumInput
                    placeholder="🔒 Password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showPassword}
                    error={errors.password?.message}
                    quantumEncrypted={true}
                    biometric={true}
                  />
                )}
              />

              <QuantumButton
                title="🔐 Quantum Login"
                onPress={handleSubmit(handleEmailLogin)}
                variant="primary"
                size="lg"
                disabled={!isValid || isAuthenticating}
                loading={isAuthenticating}
                quantumToken={true}
              />
            </View>

            <View style={styles.socialSection}>
              <Text style={styles.orText}>or continue with</Text>
              
              <QuantumButton
                title="📱 Continue with Google"
                onPress={handleGoogleLogin}
                variant="secondary"
                size="md"
                loading={isAuthenticating}
              />
            </View>

            <View style={styles.footerSection}>
              <TouchableOpacity onPress={() => Alert.alert('Forgot Password', 'Password reset feature coming soon!')}>
                <Text style={styles.forgotPassword}>🔒 Forgot Password?</Text>
              </TouchableOpacity>

              <View style={styles.registerSection}>
                <Text style={styles.registerText}>New to PawfectSitters? </Text>
                <TouchableOpacity onPress={handleRegister}>
                  <Text style={styles.registerLink}>Create Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          </QuantumCard>

          {quantumToken && (
            <View style={styles.securityInfo}>
              <Text style={styles.securityText}>🔒 Quantum Token Active</Text>
              <Text style={styles.securitySubtext}>Military-Grade Security Enabled</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  gradient: {
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  biometricSection: {
    marginBottom: 20,
  },
  orText: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 16,
    marginVertical: 15,
  },
  formSection: {
    marginBottom: 20,
  },
  socialSection: {
    marginBottom: 20,
  },
  footerSection: {
    alignItems: 'center',
  },
  forgotPassword: {
    color: '#00D4AA',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  registerSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registerText: {
    color: '#64748B',
    fontSize: 16,
  },
  registerLink: {
    color: '#00D4AA',
    fontSize: 16,
    fontWeight: '600',
  },
  securityInfo: {
    alignItems: 'center',
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
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
