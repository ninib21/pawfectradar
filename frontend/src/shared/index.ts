// 🔐 QUANTUM SHARED EXPORTS: Central export file for all shared components

// 📡 API SERVICES
export { quantumAPI, QuantumAPIClient } from './api/apiClient';
export { quantumWebSocket, QuantumWebSocketService } from './api/websocketService';
export { quantumFileUpload, QuantumFileUploadService } from './api/fileUploadService';

// 🔐 CONTEXTS
export { AuthProvider, useAuth } from './context/AuthContext';
export { BookingProvider, useBooking } from './context/BookingContext';

// 🔧 HOOKS
export {
  useAPI,
  useLogin,
  useRegister,
  useLogout,
  useGetCurrentUser,
  useUpdateProfile,
  useUploadAvatar,
  useGetPets,
  useCreatePet,
  useUpdatePet,
  useDeletePet,
  useGetBookings,
  useCreateBooking,
  useUpdateBooking,
  useCancelBooking,
  useSearchSitters,
  useGetSitterProfile,
  useGetReviews,
  useCreateReview,
  useCreatePaymentIntent,
  useConfirmPayment,
  useGetNotifications,
  useMarkNotificationAsRead,
  useTrackEvent,
  useGetAnalytics,
  useGetSessions,
  useCreateSession,
  useUpdateSession,
  useUploadFile,
  useDataFetch,
  useOptimisticUpdate,
  usePagination,
  useRealTimeData,
} from './hooks/useAPI';

// 📊 TYPES
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'sitter' | 'admin';
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
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
  owner?: User;
  sitter?: User;
  pets?: Pet[];
}

export interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'fish' | 'other';
  breed?: string;
  age: number;
  weight: number;
  specialNeeds?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewerId: string;
  reviewedId: string;
  bookingId: string;
  createdAt: string;
  updatedAt: string;
  reviewer?: User;
  reviewed?: User;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'booking' | 'message' | 'payment' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  bookingId: string;
  sitterId: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'paused' | 'completed';
  location: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 🔐 QUANTUM CONSTANTS
export const QUANTUM_CONSTANTS = {
  API_TIMEOUT: 30000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  WEBSOCKET_RECONNECT_ATTEMPTS: 5,
  WEBSOCKET_HEARTBEAT_INTERVAL: 30000, // 30 seconds
  QUANTUM_SECURITY_LEVEL: 'military-grade',
  QUANTUM_ENCRYPTION: 'post-quantum',
} as const;

// 🔧 QUANTUM UTILITIES
export const quantumUtils = {
  // Generate quantum hash
  generateQuantumHash: (data: string): string => {
    const timestamp = Date.now();
    const hash = Buffer.from(`${data}-${timestamp}-quantum`).toString('base64');
    return hash.substring(0, 16);
  },

  // Format currency
  formatCurrency: (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  },

  // Format date
  formatDate: (date: string | Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  },

  // Format time
  formatTime: (date: string | Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(date));
  },

  // Calculate time difference
  getTimeDifference: (startTime: string, endTime: string): number => {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    return end - start;
  },

  // Validate email
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone number
  validatePhone: (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  },

  // Debounce function
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },
} as const;

// 📊 QUANTUM ANALYTICS
export const quantumAnalytics = {
  // Track page view
  trackPageView: (pageName: string) => {
    if (typeof window !== 'undefined') {
      // Track in analytics service
      console.log(`📊 Page view: ${pageName}`);
    }
  },

  // Track user action
  trackUserAction: (action: string, category: string, label?: string, value?: number) => {
    if (typeof window !== 'undefined') {
      // Track in analytics service
      console.log(`📊 User action: ${action} in ${category}`, { label, value });
    }
  },

  // Track error
  trackError: (error: Error, context?: string) => {
    if (typeof window !== 'undefined') {
      // Track in analytics service
      console.error(`📊 Error tracked:`, error, context);
    }
  },
} as const;
