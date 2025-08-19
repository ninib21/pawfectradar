import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

interface AnalyticsEvent {
  id: string;
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  sessionId: string;
  userId?: string;
  deviceInfo: DeviceInfo;
  quantumHash: string;
}

interface DeviceInfo {
  platform: string;
  version: string;
  deviceId: string;
  screenSize: string;
  timezone: string;
}

interface QuantumAnalyticsContextType {
  trackEvent: (event: string, category: string, action: string, label?: string, value?: number) => Promise<void>;
  trackScreen: (screenName: string) => Promise<void>;
  trackUserAction: (action: string, details?: any) => Promise<void>;
  trackPerformance: (metric: string, value: number) => Promise<void>;
  trackSecurity: (event: string, level: 'info' | 'warning' | 'error') => Promise<void>;
  getAnalytics: () => Promise<AnalyticsEvent[]>;
  clearAnalytics: () => Promise<void>;
  exportAnalytics: () => Promise<string>;
}

const QuantumAnalyticsContext = createContext<QuantumAnalyticsContextType | undefined>(undefined);

export const useQuantumAnalytics = () => {
  const context = useContext(QuantumAnalyticsContext);
  if (!context) {
    throw new Error('useQuantumAnalytics must be used within a QuantumAnalyticsProvider');
  }
  return context;
};

export const QuantumAnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string>('');
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);

  useEffect(() => {
    initializeAnalytics();
  }, []);

  const initializeAnalytics = async () => {
    try {
      // Generate session ID
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);

      // Get device info
      const info = await getDeviceInfo();
      setDeviceInfo(info);

      // Track app launch
      await trackEvent('app_launch', 'app', 'launch', 'quantum_mobile_app');
    } catch (error) {
      console.error('Analytics initialization error:', error);
    }
  };

  const generateSessionId = (): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `session_${timestamp}_${random}`;
  };

  const getDeviceInfo = async (): Promise<DeviceInfo> => {
    // Simulate device info collection
    return {
      platform: 'react-native',
      version: '1.0.0',
      deviceId: await SecureStore.getItemAsync('device_id') || 'unknown',
      screenSize: '375x812',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  };

  const generateQuantumHash = (data: string): string => {
    // Simulate quantum hash generation
    const timestamp = Date.now();
    const hash = Buffer.from(`${data}-${timestamp}-quantum`).toString('base64');
    return hash.substring(0, 16);
  };

  const trackEvent = async (
    event: string,
    category: string,
    action: string,
    label?: string,
    value?: number
  ): Promise<void> => {
    try {
      if (!deviceInfo) return;

      const analyticsEvent: AnalyticsEvent = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
        event,
        category,
        action,
        label,
        value,
        timestamp: Date.now(),
        sessionId,
        deviceInfo,
        quantumHash: generateQuantumHash(`${event}-${category}-${action}`),
      };

      // Store event locally with quantum encryption
      const events = await getStoredEvents();
      events.push(analyticsEvent);
      await storeEvents(events);

      // Send to quantum analytics server (simulated)
      await sendToQuantumServer(analyticsEvent);
    } catch (error) {
      console.error('Event tracking error:', error);
    }
  };

  const trackScreen = async (screenName: string): Promise<void> => {
    await trackEvent('screen_view', 'navigation', 'view', screenName);
  };

  const trackUserAction = async (action: string, details?: any): Promise<void> => {
    await trackEvent('user_action', 'user', action, JSON.stringify(details));
  };

  const trackPerformance = async (metric: string, value: number): Promise<void> => {
    await trackEvent('performance', 'metrics', metric, undefined, value);
  };

  const trackSecurity = async (event: string, level: 'info' | 'warning' | 'error'): Promise<void> => {
    await trackEvent('security', 'security', event, level);
  };

  const getStoredEvents = async (): Promise<AnalyticsEvent[]> => {
    try {
      const stored = await SecureStore.getItemAsync('quantum_analytics');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting stored events:', error);
      return [];
    }
  };

  const storeEvents = async (events: AnalyticsEvent[]): Promise<void> => {
    try {
      await SecureStore.setItemAsync('quantum_analytics', JSON.stringify(events));
    } catch (error) {
      console.error('Error storing events:', error);
    }
  };

  const sendToQuantumServer = async (event: AnalyticsEvent): Promise<void> => {
    // Simulate sending to quantum analytics server
    console.log('Sending to quantum server:', event);
    
    // In real implementation, this would send to a quantum-powered analytics service
    // with zero-knowledge proofs and privacy-preserving analytics
  };

  const getAnalytics = async (): Promise<AnalyticsEvent[]> => {
    return await getStoredEvents();
  };

  const clearAnalytics = async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync('quantum_analytics');
    } catch (error) {
      console.error('Error clearing analytics:', error);
    }
  };

  const exportAnalytics = async (): Promise<string> => {
    try {
      const events = await getStoredEvents();
      const exportData = {
        sessionId,
        deviceInfo,
        events,
        exportTimestamp: Date.now(),
        quantumSignature: generateQuantumHash(JSON.stringify(events)),
      };
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting analytics:', error);
      return '';
    }
  };

  const value: QuantumAnalyticsContextType = {
    trackEvent,
    trackScreen,
    trackUserAction,
    trackPerformance,
    trackSecurity,
    getAnalytics,
    clearAnalytics,
    exportAnalytics,
  };

  return (
    <QuantumAnalyticsContext.Provider value={value}>
      {children}
    </QuantumAnalyticsContext.Provider>
  );
};
