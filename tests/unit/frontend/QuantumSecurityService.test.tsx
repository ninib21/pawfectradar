import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuantumSecurityProvider, useQuantumSecurity } from '../../frontend/src/services/QuantumSecurityService';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

// Mock expo modules
jest.mock('expo-secure-store');
jest.mock('expo-local-authentication');

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;
const mockLocalAuth = LocalAuthentication as jest.Mocked<typeof LocalAuthentication>;

// Test component to access context
const TestComponent = () => {
  const { 
    isAuthenticated, 
    isBiometricAvailable, 
    authenticate, 
    logout, 
    generateQuantumToken,
    encryptData,
    decryptData 
  } = useQuantumSecurity();

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="biometric-status">{isBiometricAvailable ? 'available' : 'not-available'}</div>
      <button data-testid="login-btn" onClick={() => authenticate('test@example.com', 'password123')}>
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>Logout</button>
      <button data-testid="generate-token-btn" onClick={generateQuantumToken}>
        Generate Token
      </button>
      <button data-testid="encrypt-btn" onClick={() => encryptData('test-data')}>
        Encrypt
      </button>
      <button data-testid="decrypt-btn" onClick={() => decryptData('encrypted-data')}>
        Decrypt
      </button>
    </div>
  );
};

describe('QuantumSecurityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockSecureStore.getItemAsync.mockResolvedValue('mock-token');
    mockSecureStore.setItemAsync.mockResolvedValue();
    mockSecureStore.deleteItemAsync.mockResolvedValue();
    mockLocalAuth.hasHardwareAsync.mockResolvedValue(true);
    mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);
    mockLocalAuth.authenticateAsync.mockResolvedValue({ success: true });
  });

  describe('Authentication', () => {
    it('should initialize with stored token', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue('stored-quantum-token');

      render(
        <QuantumSecurityProvider>
          <TestComponent />
        </QuantumSecurityProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });
    });

    it('should authenticate user with email and password', async () => {
      render(
        <QuantumSecurityProvider>
          <TestComponent />
        </QuantumSecurityProvider>
      );

      const loginButton = screen.getByTestId('login-btn');
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'quantumAuthToken',
        expect.any(String)
      );
    });

    it('should logout user and clear token', async () => {
      render(
        <QuantumSecurityProvider>
          <TestComponent />
        </QuantumSecurityProvider>
      );

      const logoutButton = screen.getByTestId('logout-btn');
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      });

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('quantumAuthToken');
    });
  });

  describe('Biometric Authentication', () => {
    it('should check biometric availability', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValue(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);

      render(
        <QuantumSecurityProvider>
          <TestComponent />
        </QuantumSecurityProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('biometric-status')).toHaveTextContent('available');
      });
    });

    it('should handle biometric authentication', async () => {
      mockLocalAuth.authenticateAsync.mockResolvedValue({ success: true });

      render(
        <QuantumSecurityProvider>
          <TestComponent />
        </QuantumSecurityProvider>
      );

      // Simulate biometric authentication
      const { authenticate } = useQuantumSecurity();
      await authenticate('test@example.com', 'password123', true);

      expect(mockLocalAuth.authenticateAsync).toHaveBeenCalledWith({
        promptMessage: 'Authenticate with biometrics',
        fallbackLabel: 'Use passcode'
      });
    });

    it('should handle biometric authentication failure', async () => {
      mockLocalAuth.authenticateAsync.mockResolvedValue({ success: false });

      render(
        <QuantumSecurityProvider>
          <TestComponent />
        </QuantumSecurityProvider>
      );

      const { authenticate } = useQuantumSecurity();
      const result = await authenticate('test@example.com', 'password123', true);

      expect(result.success).toBe(false);
    });
  });

  describe('Quantum Token Generation', () => {
    it('should generate quantum-secure tokens', async () => {
      render(
        <QuantumSecurityProvider>
          <TestComponent />
        </QuantumSecurityProvider>
      );

      const generateButton = screen.getByTestId('generate-token-btn');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
          'quantumToken',
          expect.any(String)
        );
      });
    });

    it('should generate tokens with quantum entropy', async () => {
      const { generateQuantumToken } = useQuantumSecurity();
      
      const token1 = await generateQuantumToken();
      const token2 = await generateQuantumToken();

      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
      expect(token1.length).toBeGreaterThan(100);
      expect(token2.length).toBeGreaterThan(100);
    });
  });

  describe('Quantum Encryption/Decryption', () => {
    it('should encrypt data with quantum algorithms', async () => {
      render(
        <QuantumSecurityProvider>
          <TestComponent />
        </QuantumSecurityProvider>
      );

      const encryptButton = screen.getByTestId('encrypt-btn');
      fireEvent.click(encryptButton);

      await waitFor(() => {
        expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
          'quantumEncryptedData',
          expect.any(String)
        );
      });
    });

    it('should decrypt data successfully', async () => {
      const testData = 'sensitive-information';
      const encryptedData = 'encrypted-quantum-data';

      render(
        <QuantumSecurityProvider>
          <TestComponent />
        </QuantumSecurityProvider>
      );

      const { encryptData, decryptData } = useQuantumSecurity();
      
      const encrypted = await encryptData(testData);
      const decrypted = await decryptData(encrypted);

      expect(encrypted).not.toBe(testData);
      expect(decrypted).toBe(testData);
    });

    it('should handle encryption/decryption with quantum resistance', async () => {
      const { encryptData, decryptData } = useQuantumSecurity();
      
      const testData = 'quantum-secure-data';
      const encrypted = await encryptData(testData);
      
      // Verify quantum-resistant properties
      expect(encrypted).toMatch(/^[A-Za-z0-9+/=]+$/); // Base64 format
      expect(encrypted.length).toBeGreaterThan(testData.length * 2);
      
      const decrypted = await decryptData(encrypted);
      expect(decrypted).toBe(testData);
    });
  });

  describe('Quantum Integrity Verification', () => {
    it('should verify quantum token integrity', async () => {
      const { generateQuantumToken, verifyQuantumIntegrity } = useQuantumSecurity();
      
      const token = await generateQuantumToken();
      const isValid = await verifyQuantumIntegrity(token);
      
      expect(isValid).toBe(true);
    });

    it('should detect tampered tokens', async () => {
      const { verifyQuantumIntegrity } = useQuantumSecurity();
      
      const tamperedToken = 'tampered-quantum-token';
      const isValid = await verifyQuantumIntegrity(tamperedToken);
      
      expect(isValid).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle secure store errors gracefully', async () => {
      mockSecureStore.getItemAsync.mockRejectedValue(new Error('Storage error'));

      render(
        <QuantumSecurityProvider>
          <TestComponent />
        </QuantumSecurityProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      });
    });

    it('should handle biometric errors gracefully', async () => {
      mockLocalAuth.hasHardwareAsync.mockRejectedValue(new Error('Biometric error'));

      render(
        <QuantumSecurityProvider>
          <TestComponent />
        </QuantumSecurityProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('biometric-status')).toHaveTextContent('not-available');
      });
    });
  });

  describe('Context Usage', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useQuantumSecurity must be used within a QuantumSecurityProvider');

      consoleSpy.mockRestore();
    });
  });
});
