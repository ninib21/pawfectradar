import * as React from 'react';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { quantumAPI } from '../api/apiClient';
import { quantumWebSocket } from '../api/websocketService';
import { aiService, AIRecommendation, TrustScoreAnalysis, SmartBookingSuggestion } from '../../services/AIIntegrationService';

// 🧠 Enhanced Booking Context with AI Integration
interface EnhancedBooking {
  id: string;
  ownerId: string;
  sitterId: string;
  petIds: string[];
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  totalAmount: number;
  currency: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
  owner?: any;
  sitter?: any;
  pets?: any[];
  // AI-enhanced fields
  aiInsights?: {
    trustScore?: TrustScoreAnalysis;
    smartSuggestions?: SmartBookingSuggestion[];
    riskAssessment?: {
      level: 'low' | 'medium' | 'high';
      factors: string[];
      recommendations: string[];
    };
  };
}

interface EnhancedBookingState {
  bookings: EnhancedBooking[];
  currentBooking: EnhancedBooking | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: string;
    dateRange?: { start: string; end: string };
    sitterId?: string;
    ownerId?: string;
  };
  // AI-enhanced state
  aiRecommendations: AIRecommendation[];
  aiInsights: {
    [bookingId: string]: {
      trustScore?: TrustScoreAnalysis;
      smartSuggestions?: SmartBookingSuggestion[];
      sentimentAnalysis?: any[];
    };
  };
  aiLoading: boolean;
  aiError: string | null;
}

interface EnhancedBookingContextType extends EnhancedBookingState {
  fetchBookings: (filters?: any) => Promise<void>;
  createBooking: (bookingData: any) => Promise<EnhancedBooking>;
  updateBooking: (bookingId: string, bookingData: any) => Promise<EnhancedBooking>;
  cancelBooking: (bookingId: string) => Promise<void>;
  setCurrentBooking: (booking: EnhancedBooking | null) => void;
  setFilters: (filters: any) => void;
  clearError: () => void;
  subscribeToBooking: (bookingId: string) => void;
  unsubscribeFromBooking: (bookingId: string) => void;
  // AI-enhanced methods
  getSitterRecommendations: (petProfile: any, ownerPreferences: any, availableSitters: any[]) => Promise<AIRecommendation[]>;
  analyzeSitterTrustScore: (sitterId: string, sitterData: any) => Promise<TrustScoreAnalysis>;
  getSmartBookingSuggestions: (petId: string, sitterId: string, ownerPreferences: any) => Promise<SmartBookingSuggestion[]>;
  enhanceBookingWithAI: (bookingId: string) => Promise<void>;
  clearAIRecommendations: () => void;
  clearAIInsights: (bookingId?: string) => void;
}

const EnhancedBookingContext = createContext<EnhancedBookingContextType | undefined>(undefined);

export const useEnhancedBooking = () => {
  const context = useContext(EnhancedBookingContext);
  if (!context) {
    throw new Error('useEnhancedBooking must be used within an EnhancedBookingProvider');
  }
  return context;
};

interface EnhancedBookingProviderProps {
  children: ReactNode;
}

export const EnhancedBookingProvider: React.FC<EnhancedBookingProviderProps> = ({ children }) => {
  const [state, setState] = useState<EnhancedBookingState>({
    bookings: [],
    currentBooking: null,
    isLoading: false,
    error: null,
    filters: {},
    aiRecommendations: [],
    aiInsights: {},
    aiLoading: false,
    aiError: null,
  });

  useEffect(() => {
    setupWebSocketListeners();
    return () => cleanupWebSocketListeners();
  }, []);

  const setupWebSocketListeners = () => {
    quantumWebSocket.on('booking_update', handleBookingUpdate);
    quantumWebSocket.on('connected', handleWebSocketConnected);
    quantumWebSocket.on('disconnected', handleWebSocketDisconnected);
  };

  const cleanupWebSocketListeners = () => {
    quantumWebSocket.off('booking_update', handleBookingUpdate);
    quantumWebSocket.off('connected', handleWebSocketConnected);
    quantumWebSocket.off('disconnected', handleWebSocketDisconnected);
  };

  const handleWebSocketConnected = () => {
    console.log('🔗 WebSocket connected, subscribing to booking updates');
    state.bookings.forEach(booking => {
      quantumWebSocket.subscribeToBooking(booking.id);
    });
  };

  const handleWebSocketDisconnected = () => {
    console.log('🔌 WebSocket disconnected');
  };

  const handleBookingUpdate = (updatedBooking: EnhancedBooking) => {
    setState(prev => {
      const updatedBookings = prev.bookings.map(booking =>
        booking.id === updatedBooking.id ? updatedBooking : booking
      );

      const updatedCurrentBooking = prev.currentBooking?.id === updatedBooking.id
        ? updatedBooking
        : prev.currentBooking;

      return {
        ...prev,
        bookings: updatedBookings,
        currentBooking: updatedCurrentBooking,
      };
    });

    quantumAPI.trackEvent('booking_updated', {
      action: 'booking_updated',
      category: 'booking',
      label: updatedBooking.status,
      value: 1,
      metadata: { bookingId: updatedBooking.id },
    });
  };

  const fetchBookings = async (filters?: any) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await quantumAPI.getBookings();
      const bookings = response.data || [];
      
      setState(prev => ({
        ...prev,
        bookings,
        isLoading: false,
      }));

      bookings.forEach((booking: EnhancedBooking) => {
        quantumWebSocket.subscribeToBooking(booking.id);
      });

      await quantumAPI.trackEvent('bookings_fetched', {
        action: 'bookings_fetched',
        category: 'booking',
        label: 'success',
        value: bookings.length,
      });
    } catch (error) {
      console.error('Fetch bookings error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch bookings',
      }));
    }
  };

  const createBooking = async (bookingData: any): Promise<EnhancedBooking> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await quantumAPI.createBooking(bookingData);
      const newBooking = response.data;
      
      setState(prev => ({
        ...prev,
        bookings: [newBooking, ...prev.bookings],
        currentBooking: newBooking,
        isLoading: false,
      }));

      quantumWebSocket.subscribeToBooking(newBooking.id);

      await quantumAPI.trackEvent('booking_created', {
        action: 'booking_created',
        category: 'booking',
        label: 'success',
        value: 1,
        metadata: { bookingId: newBooking.id },
      });

      return newBooking;
    } catch (error) {
      console.error('Create booking error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create booking',
      }));
      throw error;
    }
  };

  const updateBooking = async (bookingId: string, bookingData: any): Promise<EnhancedBooking> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await quantumAPI.updateBooking(bookingId, bookingData);
      const updatedBooking = response.data;
      
      setState(prev => ({
        ...prev,
        bookings: prev.bookings.map(booking =>
          booking.id === bookingId ? updatedBooking : booking
        ),
        currentBooking: prev.currentBooking?.id === bookingId
          ? updatedBooking
          : prev.currentBooking,
        isLoading: false,
      }));

      await quantumAPI.trackEvent('booking_updated', {
        action: 'booking_updated',
        category: 'booking',
        label: 'manual_update',
        value: 1,
        metadata: { bookingId },
      });

      return updatedBooking;
    } catch (error) {
      console.error('Update booking error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update booking',
      }));
      throw error;
    }
  };

  const cancelBooking = async (bookingId: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await quantumAPI.cancelBooking(bookingId);
      
      setState(prev => ({
        ...prev,
        bookings: prev.bookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: 'cancelled' as const }
            : booking
        ),
        currentBooking: prev.currentBooking?.id === bookingId
          ? { ...prev.currentBooking, status: 'cancelled' as const }
          : prev.currentBooking,
        isLoading: false,
      }));

      await quantumAPI.trackEvent('booking_cancelled', {
        action: 'booking_cancelled',
        category: 'booking',
        label: 'success',
        value: 1,
        metadata: { bookingId },
      });
    } catch (error) {
      console.error('Cancel booking error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to cancel booking',
      }));
      throw error;
    }
  };

  // 🧠 AI-Enhanced Methods

  const getSitterRecommendations = async (
    petProfile: any,
    ownerPreferences: any,
    availableSitters: any[]
  ): Promise<AIRecommendation[]> => {
    try {
      setState(prev => ({ ...prev, aiLoading: true, aiError: null }));
      
      const recommendations = await aiService.getSitterRecommendations(
        petProfile,
        ownerPreferences,
        availableSitters
      );
      
      setState(prev => ({
        ...prev,
        aiRecommendations: recommendations,
        aiLoading: false,
      }));

      return recommendations;
    } catch (error) {
      console.error('AI recommendations error:', error);
      setState(prev => ({
        ...prev,
        aiLoading: false,
        aiError: error instanceof Error ? error.message : 'Failed to get AI recommendations',
      }));
      throw error;
    }
  };

  const analyzeSitterTrustScore = async (
    sitterId: string,
    sitterData: any
  ): Promise<TrustScoreAnalysis> => {
    try {
      const trustScore = await aiService.getTrustScoreAnalysis(sitterId, sitterData);
      
      setState(prev => ({
        ...prev,
        aiInsights: {
          ...prev.aiInsights,
          [sitterId]: {
            ...prev.aiInsights[sitterId],
            trustScore,
          },
        },
      }));

      return trustScore;
    } catch (error) {
      console.error('Trust score analysis error:', error);
      throw error;
    }
  };

  const getSmartBookingSuggestions = async (
    petId: string,
    sitterId: string,
    ownerPreferences: any
  ): Promise<SmartBookingSuggestion[]> => {
    try {
      const suggestions = await aiService.getSmartBookingSuggestions(
        petId,
        sitterId,
        ownerPreferences
      );
      
      setState(prev => ({
        ...prev,
        aiInsights: {
          ...prev.aiInsights,
          [`${petId}-${sitterId}`]: {
            ...prev.aiInsights[`${petId}-${sitterId}`],
            smartSuggestions: suggestions,
          },
        },
      }));

      return suggestions;
    } catch (error) {
      console.error('Smart booking suggestions error:', error);
      throw error;
    }
  };

  const enhanceBookingWithAI = async (bookingId: string): Promise<void> => {
    try {
      const booking = state.bookings.find(b => b.id === bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      // Get AI insights for the booking
      const [trustScore, smartSuggestions] = await Promise.all([
        analyzeSitterTrustScore(booking.sitterId, booking.sitter),
        getSmartBookingSuggestions(
          booking.petIds[0], // Assuming single pet for now
          booking.sitterId,
          { preferredTimes: [booking.startTime, booking.endTime] }
        ),
      ]);

      // Update booking with AI insights
      const enhancedBooking: EnhancedBooking = {
        ...booking,
        aiInsights: {
          trustScore,
          smartSuggestions,
          riskAssessment: {
            level: trustScore.overallScore > 0.8 ? 'low' : trustScore.overallScore > 0.6 ? 'medium' : 'high',
            factors: trustScore.insights,
            recommendations: trustScore.recommendations,
          },
        },
      };

      setState(prev => ({
        ...prev,
        bookings: prev.bookings.map(b => b.id === bookingId ? enhancedBooking : b),
        currentBooking: prev.currentBooking?.id === bookingId ? enhancedBooking : prev.currentBooking,
      }));

      await quantumAPI.trackEvent('booking_enhanced_with_ai', {
        action: 'booking_enhanced_with_ai',
        category: 'ai',
        label: 'success',
        value: 1,
        metadata: { bookingId },
      });
    } catch (error) {
      console.error('Enhance booking with AI error:', error);
      throw error;
    }
  };

  const clearAIRecommendations = () => {
    setState(prev => ({
      ...prev,
      aiRecommendations: [],
      aiError: null,
    }));
  };

  const clearAIInsights = (bookingId?: string) => {
    if (bookingId) {
      setState(prev => {
        const newAIInsights = { ...prev.aiInsights };
        delete newAIInsights[bookingId];
        return {
          ...prev,
          aiInsights: newAIInsights,
        };
      });
    } else {
      setState(prev => ({
        ...prev,
        aiInsights: {},
      }));
    }
  };

  const setCurrentBooking = (booking: EnhancedBooking | null) => {
    setState(prev => ({ ...prev, currentBooking: booking }));
  };

  const setFilters = (filters: any) => {
    setState(prev => ({ ...prev, filters: { ...prev.filters, ...filters } }));
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null, aiError: null }));
  };

  const subscribeToBooking = (bookingId: string) => {
    quantumWebSocket.subscribeToBooking(bookingId);
  };

  const unsubscribeFromBooking = (bookingId: string) => {
    quantumWebSocket.unsubscribeFromBooking(bookingId);
  };

  const value: EnhancedBookingContextType = {
    ...state,
    fetchBookings,
    createBooking,
    updateBooking,
    cancelBooking,
    setCurrentBooking,
    setFilters,
    clearError,
    subscribeToBooking,
    unsubscribeFromBooking,
    getSitterRecommendations,
    analyzeSitterTrustScore,
    getSmartBookingSuggestions,
    enhanceBookingWithAI,
    clearAIRecommendations,
    clearAIInsights,
  };

  return (
    <EnhancedBookingContext.Provider value={value}>
      {children}
    </EnhancedBookingContext.Provider>
  );
};
