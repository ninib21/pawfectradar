import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { quantumAPI } from '../api/apiClient';
import { quantumWebSocket } from '../api/websocketService';

// 📅 QUANTUM BOOKING CONTEXT: Real-time booking state management
interface Booking {
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
}

interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: string;
    dateRange?: { start: string; end: string };
    sitterId?: string;
    ownerId?: string;
  };
}

interface BookingContextType extends BookingState {
  fetchBookings: (filters?: any) => Promise<void>;
  createBooking: (bookingData: any) => Promise<Booking>;
  updateBooking: (bookingId: string, bookingData: any) => Promise<Booking>;
  cancelBooking: (bookingId: string) => Promise<void>;
  setCurrentBooking: (booking: Booking | null) => void;
  setFilters: (filters: any) => void;
  clearError: () => void;
  subscribeToBooking: (bookingId: string) => void;
  unsubscribeFromBooking: (bookingId: string) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  const [state, setState] = useState<BookingState>({
    bookings: [],
    currentBooking: null,
    isLoading: false,
    error: null,
    filters: {},
  });

  useEffect(() => {
    setupWebSocketListeners();
    return () => cleanupWebSocketListeners();
  }, []);

  const setupWebSocketListeners = () => {
    // Listen for real-time booking updates
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
    // Subscribe to all user's bookings
    state.bookings.forEach(booking => {
      quantumWebSocket.subscribeToBooking(booking.id);
    });
  };

  const handleWebSocketDisconnected = () => {
    console.log('🔌 WebSocket disconnected');
  };

  const handleBookingUpdate = (updatedBooking: Booking) => {
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

    // Track booking update event
    quantumAPI.trackEvent({
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
      
      const bookings = await quantumAPI.getBookings();
      
      setState(prev => ({
        ...prev,
        bookings,
        isLoading: false,
      }));

      // Subscribe to real-time updates for all bookings
      bookings.forEach(booking => {
        quantumWebSocket.subscribeToBooking(booking.id);
      });

      // Track fetch event
      await quantumAPI.trackEvent({
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

  const createBooking = async (bookingData: any): Promise<Booking> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const newBooking = await quantumAPI.createBooking(bookingData);
      
      setState(prev => ({
        ...prev,
        bookings: [newBooking, ...prev.bookings],
        currentBooking: newBooking,
        isLoading: false,
      }));

      // Subscribe to real-time updates for the new booking
      quantumWebSocket.subscribeToBooking(newBooking.id);

      // Track booking creation
      await quantumAPI.trackEvent({
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

  const updateBooking = async (bookingId: string, bookingData: any): Promise<Booking> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const updatedBooking = await quantumAPI.updateBooking(bookingId, bookingData);
      
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

      // Track booking update
      await quantumAPI.trackEvent({
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

      // Track booking cancellation
      await quantumAPI.trackEvent({
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

  const setCurrentBooking = (booking: Booking | null) => {
    setState(prev => ({ ...prev, currentBooking: booking }));
  };

  const setFilters = (filters: any) => {
    setState(prev => ({ ...prev, filters: { ...prev.filters, ...filters } }));
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const subscribeToBooking = (bookingId: string) => {
    quantumWebSocket.subscribeToBooking(bookingId);
  };

  const unsubscribeFromBooking = (bookingId: string) => {
    quantumWebSocket.unsubscribeFromBooking(bookingId);
  };

  const value: BookingContextType = {
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
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
