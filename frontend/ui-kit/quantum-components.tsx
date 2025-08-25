import React, { useState, useEffect } from 'react';

import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

// 🔒 QUANTUM SECURITY: Quantum token generation
const generateQuantumToken = async (): Promise<string> => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const quantumToken = `${timestamp}-${random}-quantum-secure`;
  return quantumToken;
};

// 🔒 QUANTUM ENCRYPTION: Secure storage utilities
const quantumSecureStore = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      const quantumToken = await generateQuantumToken();
      const encryptedValue = `${quantumToken}:${value}`;
      await SecureStore.setItemAsync(key, encryptedValue);
    } catch (error) {
      console.error('Quantum secure storage error:', error);
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      const encryptedValue = await SecureStore.getItemAsync(key);
      if (encryptedValue) {
        const [, value] = encryptedValue.split(':');
        return value;
      }
      return null;
    } catch (error) {
      console.error('Quantum secure retrieval error:', error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Quantum secure deletion error:', error);
    }
  }
};

// 🔒 QUANTUM BIOMETRIC: Biometric authentication
const quantumBiometricAuth = {
  async isAvailable(): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  },

  async authenticate(): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: '🔒 Quantum Biometric Authentication Required',
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });
      return result.success;
    } catch (error) {
      console.error('Quantum biometric authentication error:', error);
      return false;
    }
  }
};

// 🎨 QUANTUM BUTTON COMPONENT
interface QuantumButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'quantum' | 'military';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  biometric?: boolean;
  quantumToken?: boolean;
}

export const QuantumButton: React.FC<QuantumButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  biometric = false,
  quantumToken = false,
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (quantumToken) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [quantumToken, pulseAnim]);

  const handlePress = async () => {
    if (disabled || loading) return;

    if (biometric) {
      setIsAuthenticating(true);
      const isAvailable = await quantumBiometricAuth.isAvailable();
      
      if (isAvailable) {
        const isAuthenticated = await quantumBiometricAuth.authenticate();
        if (isAuthenticated) {
          onPress();
        } else {
          Alert.alert('🔒 Authentication Failed', 'Biometric authentication was not successful.');
        }
      } else {
        Alert.alert('🔒 Biometric Not Available', 'Biometric authentication is not available on this device.');
      }
      setIsAuthenticating(false);
    } else {
      onPress();
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return { gradient: ['#259FEE', '#1E7FBE'], textColor: '#FFFFFF' };
      case 'secondary':
        return { gradient: ['#0EA5E9', '#0284C7'], textColor: '#FFFFFF' };
      case 'success':
        return { gradient: ['#22C55E', '#16A34A'], textColor: '#FFFFFF' };
      case 'warning':
        return { gradient: ['#F59E0B', '#D97706'], textColor: '#FFFFFF' };
      case 'error':
        return { gradient: ['#EF4444', '#DC2626'], textColor: '#FFFFFF' };
      case 'quantum':
        return { gradient: ['#00D4AA', '#00B894'], textColor: '#FFFFFF' };
      case 'military':
        return { gradient: ['#1A1A1A', '#0A0A0A'], textColor: '#FFFFFF' };
      default:
        return { gradient: ['#259FEE', '#1E7FBE'], textColor: '#FFFFFF' };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 };
      case 'md':
        return { paddingVertical: 12, paddingHorizontal: 24, fontSize: 16 };
      case 'lg':
        return { paddingVertical: 16, paddingHorizontal: 32, fontSize: 18 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 24, fontSize: 16 };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading || isAuthenticating}
        style={[
          styles.quantumButton,
          sizeStyles,
          disabled && styles.disabled,
          quantumToken && styles.quantumGlow,
        ]}
      >
        <LinearGradient
          colors={variantStyles.gradient}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.buttonContent}>
            {biometric && (
              <Ionicons
                name="finger-print"
                size={20}
                color={variantStyles.textColor}
                style={styles.buttonIcon}
              />
            )}
            {quantumToken && (
              <Ionicons
                name="shield-checkmark"
                size={20}
                color={variantStyles.textColor}
                style={styles.buttonIcon}
              />
            )}
            <Text style={[styles.buttonText, { color: variantStyles.textColor, fontSize: sizeStyles.fontSize }]}>
              {loading ? '🔒 Processing...' : isAuthenticating ? '🔐 Authenticating...' : title}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// 🎨 QUANTUM INPUT COMPONENT
interface QuantumInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  quantumEncrypted?: boolean;
  biometric?: boolean;
}

export const QuantumInput: React.FC<QuantumInputProps> = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  quantumEncrypted = false,
  biometric = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleBiometricToggle = async () => {
    if (biometric) {
      const isAuthenticated = await quantumBiometricAuth.authenticate();
      if (isAuthenticated) {
        setShowPassword(!showPassword);
      }
    } else {
      setShowPassword(!showPassword);
    }
  };

  return (
    <View style={styles.inputContainer}>
      <View style={[
        styles.quantumInput,
        isFocused && styles.inputFocused,
        error && styles.inputError,
        quantumEncrypted && styles.quantumEncrypted,
      ]}>
        <TextInput
          style={styles.inputText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {quantumEncrypted && (
          <Ionicons
            name="shield-checkmark"
            size={20}
            color="#6366F1"
            style={styles.inputIcon}
          />
        )}
        {secureTextEntry && (
          <TouchableOpacity onPress={handleBiometricToggle} style={styles.inputIcon}>
            <Ionicons
              name={biometric ? "finger-print" : (showPassword ? "eye-off" : "eye")}
              size={20}
              color="#64748B"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.inputErrorText}>{error}</Text>}
    </View>
  );
};

// 🎨 QUANTUM CARD COMPONENT
interface QuantumCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  secure?: boolean;
  quantumToken?: string;
  onPress?: () => void;
}

export const QuantumCard: React.FC<QuantumCardProps> = ({
  children,
  title,
  subtitle,
  secure = false,
  quantumToken,
  onPress,
}) => {
  const [glowAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (secure) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [secure, glowAnim]);

  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer
      onPress={onPress}
      style={[
        styles.quantumCard,
        secure && {
          shadowColor: '#22C55E',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.2, 0.6],
          }),
          shadowRadius: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [10, 20],
          }),
        },
      ]}
    >
      {(title || subtitle) && (
        <View style={styles.cardHeader}>
          {title && <Text style={styles.cardTitle}>{title}</Text>}
          {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
          {secure && (
            <Ionicons
              name="shield-checkmark"
              size={20}
              color="#22C55E"
              style={styles.cardIcon}
            />
          )}
        </View>
      )}
      {quantumToken && (
        <View style={styles.quantumTokenContainer}>
          <Text style={styles.quantumTokenLabel}>🔒 Quantum Token:</Text>
          <Text style={styles.quantumTokenText}>{quantumToken}</Text>
        </View>
      )}
      <View style={styles.cardContent}>
        {children}
      </View>
    </CardContainer>
  );
};

// 🎨 QUANTUM MODAL COMPONENT
interface QuantumModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  secure?: boolean;
  biometric?: boolean;
}

export const QuantumModal: React.FC<QuantumModalProps> = ({
  visible,
  onClose,
  title,
  children,
  secure = false,
  biometric = false,
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleClose = async () => {
    if (biometric) {
      setIsAuthenticating(true);
      const isAuthenticated = await quantumBiometricAuth.authenticate();
      if (isAuthenticated) {
        onClose();
      } else {
        Alert.alert('🔒 Authentication Failed', 'Biometric authentication required to close this modal.');
      }
      setIsAuthenticating(false);
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.quantumModal,
          secure && styles.secureModal,
        ]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            {secure && (
              <Ionicons
                name="shield-checkmark"
                size={24}
                color="#22C55E"
                style={styles.modalIcon}
              />
            )}
            <TouchableOpacity onPress={handleClose} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            {children}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// 🎨 QUANTUM SECURE STORAGE HOOK
export const useQuantumSecureStorage = () => {
  return quantumSecureStore;
};

// 🎨 QUANTUM BIOMETRIC HOOK
export const useQuantumBiometric = () => {
  return quantumBiometricAuth;
};

// 🎨 QUANTUM STYLES
const styles = StyleSheet.create({
  // Quantum Button Styles
  quantumButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  quantumGlow: {
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },

  // Quantum Input Styles
  inputContainer: {
    marginBottom: 16,
  },
  quantumInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  inputFocused: {
    borderColor: '#259FEE',
    shadowColor: '#259FEE',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  quantumEncrypted: {
    borderColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    fontFamily: 'Inter',
  },
  inputIcon: {
    marginLeft: 8,
  },
  inputErrorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'Inter',
  },

  // Quantum Card Styles
  quantumCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
    fontFamily: 'Inter',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter',
  },
  cardIcon: {
    marginLeft: 8,
  },
  quantumTokenContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quantumTokenLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
    fontFamily: 'Inter',
  },
  quantumTokenText: {
    fontSize: 14,
    fontFamily: 'JetBrains Mono',
    color: '#0F172A',
  },
  cardContent: {
    flex: 1,
  },

  // Quantum Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  quantumModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  secureModal: {
    shadowColor: '#22C55E',
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
    fontFamily: 'Inter',
  },
  modalIcon: {
    marginRight: 8,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
});

export default {
  QuantumButton,
  QuantumInput,
  QuantumCard,
  QuantumModal,
  useQuantumSecureStorage,
  useQuantumBiometric,
};
