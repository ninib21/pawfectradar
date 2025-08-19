import React, { createContext, useContext, useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

interface QuantumSecurityContextType {
  isAuthenticated: boolean;
  isBiometricAvailable: boolean;
  quantumToken: string | null;
  authenticate: () => Promise<boolean>;
  logout: () => Promise<void>;
  generateQuantumToken: () => Promise<string>;
  encryptData: (data: string) => Promise<string>;
  decryptData: (encryptedData: string) => Promise<string>;
  verifyQuantumIntegrity: () => Promise<boolean>;
}

const QuantumSecurityContext = createContext<QuantumSecurityContextType | undefined>(undefined);

export const useQuantumSecurity = () => {
  const context = useContext(QuantumSecurityContext);
  if (!context) {
    throw new Error('useQuantumSecurity must be used within a QuantumSecurityProvider');
  }
  return context;
};

export const QuantumSecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [quantumToken, setQuantumToken] = useState<string | null>(null);

  useEffect(() => {
    initializeQuantumSecurity();
  }, []);

  const initializeQuantumSecurity = async () => {
    try {
      // Check biometric availability
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricAvailable(hasHardware && isEnrolled);

      // Check for existing quantum token
      const storedToken = await SecureStore.getItemAsync('quantum_token');
      if (storedToken) {
        setQuantumToken(storedToken);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Quantum security initialization error:', error);
    }
  };

  const generateQuantumToken = async (): Promise<string> => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const deviceId = await SecureStore.getItemAsync('device_id') || 'unknown';
    const quantumToken = `${timestamp}-${random}-${deviceId}-quantum-secure`;
    
    // Store token securely
    await SecureStore.setItemAsync('quantum_token', quantumToken);
    setQuantumToken(quantumToken);
    
    return quantumToken;
  };

  const authenticate = async (): Promise<boolean> => {
    try {
      if (!isBiometricAvailable) {
        Alert.alert('Biometric Not Available', 'Please enable biometric authentication on your device.');
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: '🔒 Quantum Biometric Authentication Required',
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        const token = await generateQuantumToken();
        setIsAuthenticated(true);
        setQuantumToken(token);
        return true;
      } else {
        Alert.alert('Authentication Failed', 'Biometric authentication was not successful.');
        return false;
      }
    } catch (error) {
      console.error('Authentication error:', error);
      Alert.alert('Authentication Error', 'An error occurred during authentication.');
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync('quantum_token');
      setIsAuthenticated(false);
      setQuantumToken(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const encryptData = async (data: string): Promise<string> => {
    // Quantum encryption simulation
    const timestamp = Date.now();
    const encrypted = Buffer.from(`${timestamp}:${data}`).toString('base64');
    return `quantum-encrypted:${encrypted}`;
  };

  const decryptData = async (encryptedData: string): Promise<string> => {
    // Quantum decryption simulation
    if (encryptedData.startsWith('quantum-encrypted:')) {
      const data = encryptedData.replace('quantum-encrypted:', '');
      const decoded = Buffer.from(data, 'base64').toString();
      const [, originalData] = decoded.split(':');
      return originalData;
    }
    return encryptedData;
  };

  const verifyQuantumIntegrity = async (): Promise<boolean> => {
    try {
      // Simulate quantum integrity verification
      const storedToken = await SecureStore.getItemAsync('quantum_token');
      if (!storedToken) return false;
      
      // Verify token format and timestamp
      const parts = storedToken.split('-');
      if (parts.length !== 4) return false;
      
      const timestamp = parseInt(parts[0]);
      const now = Date.now();
      const tokenAge = now - timestamp;
      
      // Token expires after 24 hours
      if (tokenAge > 24 * 60 * 60 * 1000) {
        await logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Quantum integrity verification error:', error);
      return false;
    }
  };

  const value: QuantumSecurityContextType = {
    isAuthenticated,
    isBiometricAvailable,
    quantumToken,
    authenticate,
    logout,
    generateQuantumToken,
    encryptData,
    decryptData,
    verifyQuantumIntegrity,
  };

  return (
    <QuantumSecurityContext.Provider value={value}>
      {children}
    </QuantumSecurityContext.Provider>
  );
};
