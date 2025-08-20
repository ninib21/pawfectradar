// 🚀 QUANTUM PAWFECT SITTERS - SHARED EXPORTS
// 🔒 MILITARY-GRADE SECURITY + QUANTUM-ENHANCED EXPORTS
// 📈 QUANTUM-INFINITE SCALABILITY
// 🚀 QUANTUM-OPTIMIZED PERFORMANCE

// API Services
export { quantumAPI } from './api/apiClient';
export type { QuantumAPIClient, APIResponse, ErrorResponse } from './api/apiClient';
export { fileUploadService } from './api/fileUploadService';
export type { QuantumFileUploadService, FileInfo, UploadResult, UploadProgress } from './api/fileUploadService';
export { notificationService } from './api/notificationService';
export type { QuantumNotificationService, NotificationData, NotificationSettings, NotificationHistory } from './api/notificationService';
export { paymentService } from './api/paymentService';
export type { QuantumPaymentService, PaymentMethod, PaymentIntent, CryptoPayment, PaymentOptions } from './api/paymentService';
export { analyticsService } from './api/analyticsService';
export type { QuantumAnalyticsService, AnalyticsEvent, UserBehavior, BusinessMetrics, AIPerformanceMetrics } from './api/analyticsService';
export { videoCallService } from './api/videoCallService';
export type { QuantumVideoCallService, VideoCallConfig, Participant, CallSettings, CallSession, CallStats, RecordingOptions } from './api/videoCallService';

// AI Services
export { AIIntegrationService } from '../services/AIIntegrationService';
export { enhancedAIMatchmakingService } from '../services/EnhancedAIMatchmakingService';
export type { EnhancedAIMatchmakingService, PetProfile, SitterProfile, MatchResult, MatchScore, MatchmakingFilters } from '../services/EnhancedAIMatchmakingService';

// Contexts
export { AuthProvider, useAuth } from './context/AuthContext';
export { BookingProvider, useBooking } from './context/BookingContext';
export { EnhancedBookingProvider, useEnhancedBooking } from './context/EnhancedBookingContext';

// Hooks
export { useAPI } from './hooks/useAPI';

// Components
export { PaymentMethodSelector } from '../components/Payment/PaymentMethodSelector';
export { VideoCallInterface } from '../components/VideoCall/VideoCallInterface';
export { EnhancedMatchmakingInterface } from '../components/Matchmaking/EnhancedMatchmakingInterface';
export { TrustScoreDisplay } from '../components/AI/TrustScoreDisplay';
export { SmartBookingSuggestions } from '../components/AI/SmartBookingSuggestions';

// Types
export type {
  User,
  Booking,
  EnhancedBooking,
  AIRecommendation,
  AIInsights,
  AIError,
} from './types';

// Constants
export const APP_NAME = 'Quantum PawfectSitters';
export const APP_VERSION = '1.0.0';
export const API_BASE_URL = __DEV__ ? 'http://localhost:3000/api' : 'https://api.quantum-pawfectsitters.com/api';
export const AI_BASE_URL = __DEV__ ? 'http://localhost:3001' : 'https://ai.quantum-pawfectsitters.com';

// Feature Flags
export const FEATURES = {
  AI_MATCHMAKING: true,
  VIDEO_CALLING: true,
  MULTIPLE_PAYMENT_METHODS: true,
  ADVANCED_ANALYTICS: true,
  PUSH_NOTIFICATIONS: true,
  SCREEN_SHARING: true,
  CALL_RECORDING: true,
  CRYPTO_PAYMENTS: true,
  REAL_TIME_MATCHING: true,
  AI_INSIGHTS: true,
  COMPATIBILITY_ANALYSIS: true,
  BOOKING_PREDICTIONS: true,
} as const;

// Configuration
export const CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  SUPPORTED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
  SUPPORTED_CRYPTOCURRENCIES: ['BTC', 'ETH', 'USDC', 'USDT', 'DOGE'],
  SUPPORTED_FIAT_CURRENCIES: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
  MAX_BOOKING_DURATION: 24, // hours
  MIN_BOOKING_DURATION: 1, // hour
  MAX_DISTANCE: 50, // miles
  MIN_RATING: 3.0,
  MAX_HOURLY_RATE: 100, // USD
  CACHE_EXPIRY: 300000, // 5 minutes
  SESSION_TIMEOUT: 3600000, // 1 hour
  REQUEST_TIMEOUT: 30000, // 30 seconds
  MAX_RETRY_ATTEMPTS: 3,
  ANALYTICS_FLUSH_INTERVAL: 30000, // 30 seconds
  VIDEO_CALL_MAX_PARTICIPANTS: 4,
  VIDEO_CALL_MAX_DURATION: 7200, // 2 hours
  RECORDING_MAX_DURATION: 7200, // 2 hours
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  AUTHENTICATION_ERROR: 'Authentication failed. Please log in again.',
  AUTHORIZATION_ERROR: 'You do not have permission to perform this action.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  UNSUPPORTED_FILE_TYPE: 'File type is not supported.',
  PAYMENT_FAILED: 'Payment processing failed. Please try again.',
  BOOKING_CONFLICT: 'This time slot is no longer available.',
  SITTER_UNAVAILABLE: 'The selected sitter is not available for this time.',
  AI_SERVICE_UNAVAILABLE: 'AI service is temporarily unavailable.',
  VIDEO_CALL_FAILED: 'Failed to establish video call connection.',
  MATCHMAKING_FAILED: 'Failed to find compatible sitters.',
  ANALYTICS_FAILED: 'Failed to track analytics data.',
  NOTIFICATION_FAILED: 'Failed to send notification.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  BOOKING_CREATED: 'Booking created successfully!',
  BOOKING_UPDATED: 'Booking updated successfully!',
  BOOKING_CANCELLED: 'Booking cancelled successfully!',
  PAYMENT_SUCCESSFUL: 'Payment processed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  FILE_UPLOADED: 'File uploaded successfully!',
  NOTIFICATION_SENT: 'Notification sent successfully!',
  MATCHES_FOUND: 'Compatible sitters found!',
  AI_INSIGHTS_GENERATED: 'AI insights generated successfully!',
  VIDEO_CALL_STARTED: 'Video call started successfully!',
  RECORDING_STARTED: 'Call recording started!',
  RECORDING_STOPPED: 'Call recording saved!',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-()]{10,}$/,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  BIO_MAX_LENGTH: 500,
  REVIEW_MAX_LENGTH: 1000,
  MESSAGE_MAX_LENGTH: 1000,
  ADDRESS_MAX_LENGTH: 200,
  PET_NAME_MAX_LENGTH: 30,
  PET_BREED_MAX_LENGTH: 50,
  PET_AGE_MIN: 0,
  PET_AGE_MAX: 30,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
  },
  
  // User Management
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/profile',
    DELETE: '/user/profile',
    AVATAR: '/user/avatar',
  },
  
  // Pet Management
  PETS: {
    LIST: '/pets',
    CREATE: '/pets',
    UPDATE: '/pets/:id',
    DELETE: '/pets/:id',
    UPLOAD_PHOTO: '/pets/:id/photo',
  },
  
  // Booking Management
  BOOKINGS: {
    LIST: '/bookings',
    CREATE: '/bookings',
    UPDATE: '/bookings/:id',
    DELETE: '/bookings/:id',
    CANCEL: '/bookings/:id/cancel',
    CONFIRM: '/bookings/:id/confirm',
    COMPLETE: '/bookings/:id/complete',
  },
  
  // Sitter Management
  SITTERS: {
    LIST: '/sitters',
    PROFILE: '/sitters/:id',
    SEARCH: '/sitters/search',
    AVAILABILITY: '/sitters/:id/availability',
    REVIEWS: '/sitters/:id/reviews',
  },
  
  // Reviews
  REVIEWS: {
    LIST: '/reviews',
    CREATE: '/reviews',
    UPDATE: '/reviews/:id',
    DELETE: '/reviews/:id',
  },
  
  // Payments
  PAYMENTS: {
    STRIPE: {
      CREATE_INTENT: '/payments/stripe/create-intent',
      CONFIRM: '/payments/stripe/confirm',
      SAVE_METHOD: '/payments/stripe/save-method',
    },
    CASHAPP: {
      CREATE_INTENT: '/payments/cashapp/create-intent',
      PROCESS: '/payments/cashapp/process',
    },
    APPLEPAY: {
      CREATE_INTENT: '/payments/applepay/create-intent',
      PROCESS: '/payments/applepay/process',
    },
    CRYPTO: {
      CREATE: '/payments/crypto/create',
      STATUS: '/payments/crypto/:id/status',
      EXCHANGE_RATE: '/payments/crypto/exchange-rate',
      WALLET_ADDRESS: '/payments/crypto/wallet-address',
    },
    METHODS: {
      LIST: '/payments/methods',
      SET_DEFAULT: '/payments/methods/:id/default',
      DELETE: '/payments/methods/:id',
      AVAILABILITY: '/payments/methods/availability',
      USAGE: '/payments/methods/usage',
    },
    HISTORY: '/payments/history',
    ANALYTICS: '/payments/analytics',
    VALIDATE: '/payments/validate-method',
    REPORT_FRAUD: '/payments/report-fraud',
  },
  
  // AI Services
  AI: {
    MATCHMAKING: {
      FIND: '/ai/matchmaking/find',
      RECOMMENDATIONS: '/ai/matchmaking/recommendations',
      REALTIME: '/ai/matchmaking/realtime',
      INSIGHTS: '/ai/matchmaking/insights',
      PREDICT_BOOKING: '/ai/matchmaking/predict-booking',
      COMPATIBILITY: '/ai/matchmaking/compatibility',
      ANALYTICS: '/ai/matchmaking/analytics',
      PERFORMANCE: '/ai/matchmaking/performance',
      TRACK_INTERACTION: '/ai/matchmaking/track-interaction',
      FEEDBACK: '/ai/matchmaking/feedback',
      PREFERENCES: '/ai/matchmaking/preferences',
      MODELS: '/ai/matchmaking/models',
    },
    TRUST_SCORE: '/ai/trust-score',
    SENTIMENT_ANALYSIS: '/ai/sentiment-analysis',
    SMART_BOOKING: '/ai/smart-booking',
  },
  
  // Video Calling
  VIDEO_CALLING: {
    CREATE: '/video-calling/create',
    JOIN: '/video-calling/join',
    LEAVE: '/video-calling/leave',
    END: '/video-calling/end',
    TOGGLE_MUTE: '/video-calling/toggle-mute',
    TOGGLE_VIDEO: '/video-calling/toggle-video',
    START_SCREENSHARE: '/video-calling/start-screenshare',
    STOP_SCREENSHARE: '/video-calling/stop-screenshare',
    START_RECORDING: '/video-calling/start-recording',
    STOP_RECORDING: '/video-calling/stop-recording',
    TRANSCRIPTION: '/video-calling/:id/transcription',
    STATS: '/video-calling/:id/stats',
    CAPABILITIES: '/video-calling/capabilities',
    WEBRTC_CONFIG: '/video-calling/webrtc-config',
  },
  
  // Analytics
  ANALYTICS: {
    TRACK: '/analytics/track',
    EVENTS_BATCH: '/analytics/events/batch',
    BUSINESS_METRICS: '/analytics/business-metrics',
    REVENUE: '/analytics/revenue',
    BOOKINGS: '/analytics/bookings',
    USERS: '/analytics/users',
    SITTERS: '/analytics/sitters',
    AI_PERFORMANCE: '/analytics/ai-performance',
    USER_BEHAVIOR: '/analytics/user-behavior/:id',
    REPORTS: '/analytics/reports',
    EXPORT: '/analytics/export',
    SETTINGS: '/analytics/settings',
  },
  
  // Notifications
  NOTIFICATIONS: {
    SETTINGS: '/notifications/settings',
    HISTORY: '/notifications/history',
    MARK_READ: '/notifications/:id/read',
    MARK_RECEIVED: '/notifications/:id/received',
    DELETE: '/notifications/:id',
    REGISTER_TOKEN: '/notifications/register-token',
  },
  
  // File Upload
  FILES: {
    UPLOAD: '/files/upload',
    GET: '/files/:id',
    DELETE: '/files/:id',
  },
  
  // Health Check
  HEALTH: '/health',
} as const;
