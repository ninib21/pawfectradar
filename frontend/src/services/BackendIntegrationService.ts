import { quantumAPI } from '../shared/api/quantumAPIClient';

// Backend API endpoints
const BACKEND_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  // User endpoints
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    UPLOAD_AVATAR: '/users/avatar',
    VERIFICATION: '/users/verification',
    PREFERENCES: '/users/preferences',
  },
  // Pet endpoints
  PETS: {
    LIST: '/pets',
    CREATE: '/pets',
    UPDATE: (id: string) => `/pets/${id}`,
    DELETE: (id: string) => `/pets/${id}`,
    UPLOAD_PHOTO: (id: string) => `/pets/${id}/photo`,
  },
  // Booking endpoints
  BOOKINGS: {
    LIST: '/bookings',
    CREATE: '/bookings',
    UPDATE: (id: string) => `/bookings/${id}`,
    DELETE: (id: string) => `/bookings/${id}`,
    CANCEL: (id: string) => `/bookings/${id}/cancel`,
    CONFIRM: (id: string) => `/bookings/${id}/confirm`,
    COMPLETE: (id: string) => `/bookings/${id}/complete',
    RATE: (id: string) => `/bookings/${id}/rate`,
  },
  // Payment endpoints
  PAYMENTS: {
    CREATE_INTENT: '/payments/create-intent',
    CONFIRM: '/payments/confirm',
    REFUND: '/payments/refund',
    METHODS: '/payments/methods',
    HISTORY: '/payments/history',
  },
  // Notification endpoints
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    PREFERENCES: '/notifications/preferences',
    PUSH_TOKEN: '/notifications/push-token',
  },
  // AI endpoints
  AI: {
    TRUST_SCORE: '/ai/trust-score',
    MATCHMAKING: '/ai/matchmaking',
    SENTIMENT: '/ai/sentiment',
    SMART_BOOKING: '/ai/smart-booking',
    RECOMMENDATIONS: '/ai/recommendations',
  },
  // Health endpoints
  HEALTH: {
    CHECK: '/health',
    METRICS: '/health/metrics',
  },
};

export interface BackendResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends BackendResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class BackendIntegrationService {
  private static instance: BackendIntegrationService;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;

  static getInstance(): BackendIntegrationService {
    if (!BackendIntegrationService.instance) {
      BackendIntegrationService.instance = new BackendIntegrationService();
    }
    return BackendIntegrationService.instance;
  }

  // Connection management
  async checkConnection(): Promise<boolean> {
    try {
      const response = await quantumAPI.get(BACKEND_ENDPOINTS.HEALTH.CHECK);
      this.isConnected = response.status === 200;
      this.reconnectAttempts = 0;
      return this.isConnected;
    } catch (error) {
      this.isConnected = false;
      console.error('Backend connection failed:', error);
      return false;
    }
  }

  async ensureConnection(): Promise<boolean> {
    if (this.isConnected) return true;
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      throw new Error('Max reconnection attempts reached');
    }

    this.reconnectAttempts++;
    return await this.checkConnection();
  }

  // Auth API integration
  async login(credentials: { email: string; password: string }): Promise<BackendResponse<{ token: string; user: any }>> {
    await this.ensureConnection();
    return await quantumAPI.post(BACKEND_ENDPOINTS.AUTH.LOGIN, credentials);
  }

  async register(userData: { email: string; password: string; name: string; role: string }): Promise<BackendResponse<{ user: any }>> {
    await this.ensureConnection();
    return await quantumAPI.post(BACKEND_ENDPOINTS.AUTH.REGISTER, userData);
  }

  async refreshToken(): Promise<BackendResponse<{ token: string }>> {
    await this.ensureConnection();
    return await quantumAPI.post(BACKEND_ENDPOINTS.AUTH.REFRESH);
  }

  async logout(): Promise<BackendResponse> {
    await this.ensureConnection();
    return await quantumAPI.post(BACKEND_ENDPOINTS.AUTH.LOGOUT);
  }

  // User API integration
  async getUserProfile(): Promise<BackendResponse<any>> {
    await this.ensureConnection();
    return await quantumAPI.get(BACKEND_ENDPOINTS.USERS.PROFILE);
  }

  async updateUserProfile(profileData: any): Promise<BackendResponse<any>> {
    await this.ensureConnection();
    return await quantumAPI.put(BACKEND_ENDPOINTS.USERS.UPDATE_PROFILE, profileData);
  }

  async uploadUserAvatar(file: File): Promise<BackendResponse<{ avatarUrl: string }>> {
    await this.ensureConnection();
    const formData = new FormData();
    formData.append('avatar', file);
    return await quantumAPI.post(BACKEND_ENDPOINTS.USERS.UPLOAD_AVATAR, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  // Pet API integration
  async getPets(): Promise<PaginatedResponse<any>> {
    await this.ensureConnection();
    return await quantumAPI.get(BACKEND_ENDPOINTS.PETS.LIST);
  }

  async createPet(petData: any): Promise<BackendResponse<any>> {
    await this.ensureConnection();
    return await quantumAPI.post(BACKEND_ENDPOINTS.PETS.CREATE, petData);
  }

  async updatePet(id: string, petData: any): Promise<BackendResponse<any>> {
    await this.ensureConnection();
    return await quantumAPI.put(BACKEND_ENDPOINTS.PETS.UPDATE(id), petData);
  }

  async deletePet(id: string): Promise<BackendResponse> {
    await this.ensureConnection();
    return await quantumAPI.delete(BACKEND_ENDPOINTS.PETS.DELETE(id));
  }

  async uploadPetPhoto(id: string, file: File): Promise<BackendResponse<{ photoUrl: string }>> {
    await this.ensureConnection();
    const formData = new FormData();
    formData.append('photo', file);
    return await quantumAPI.post(BACKEND_ENDPOINTS.PETS.UPLOAD_PHOTO(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  // Booking API integration
  async getBookings(filters?: any): Promise<PaginatedResponse<any>> {
    await this.ensureConnection();
    const params = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return await quantumAPI.get(`${BACKEND_ENDPOINTS.BOOKINGS.LIST}${params}`);
  }

  async createBooking(bookingData: any): Promise<BackendResponse<any>> {
    await this.ensureConnection();
    return await quantumAPI.post(BACKEND_ENDPOINTS.BOOKINGS.CREATE, bookingData);
  }

  async updateBooking(id: string, bookingData: any): Promise<BackendResponse<any>> {
    await this.ensureConnection();
    return await quantumAPI.put(BACKEND_ENDPOINTS.BOOKINGS.UPDATE(id), bookingData);
  }

  async cancelBooking(id: string, reason?: string): Promise<BackendResponse> {
    await this.ensureConnection();
    return await quantumAPI.post(BACKEND_ENDPOINTS.BOOKINGS.CANCEL(id), { reason });
  }

  async confirmBooking(id: string): Promise<BackendResponse> {
    await this.ensureConnection();
    return await quantumAPI.post(BACKEND_ENDPOINTS.BOOKINGS.CONFIRM(id));
  }

  async completeBooking(id: string, completionData: any): Promise<BackendResponse> {
    await this.ensureConnection();
    return await quantumAPI.post(BACKEND_ENDPOINTS.BOOKINGS.COMPLETE(id), completionData);
  }

  async rateBooking(id: string, rating: { stars: number; review: string }): Promise<BackendResponse> {
    await this.ensureConnection();
    return await quantumAPI.post(BACKEND_ENDPOINTS.BOOKINGS.RATE(id), rating);
  }

  // Payment API integration
  async createPaymentIntent(paymentData: any): Promise<BackendResponse<{ clientSecret: string }>> {
    await this.ensureConnection();
    return await quantumAPI.post(BACKEND_ENDPOINTS.PAYMENTS.CREATE_INTENT, paymentData);
  }

  async confirmPayment(paymentId: string): Promise<BackendResponse> {
    await this.ensureConnection();
    return await quantumAPI.post(BACKEND_ENDPOINTS.PAYMENTS.CONFIRM, { paymentId });
  }

  async getPaymentMethods(): Promise<BackendResponse<any[]>> {
    await this.ensureConnection();
    return await quantumAPI.get(BACKEND_ENDPOINTS.PAYMENTS.METHODS);
  }

  async getPaymentHistory(): Promise<PaginatedResponse<any>> {
    await this.ensureConnection();
    return await quantumAPI.get(BACKEND_ENDPOINTS.PAYMENTS.HISTORY);
  }

  // Notification API integration
  async getNotifications(): Promise<PaginatedResponse<any>> {
    await this.ensureConnection();
    return await quantumAPI.get(BACKEND_ENDPOINTS.NOTIFICATIONS.LIST);
  }

  async markNotificationRead(id: string): Promise<BackendResponse> {
    await this.ensureConnection();
    return await quantumAPI.post(BACKEND_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  }

  async markAllNotificationsRead(): Promise<BackendResponse> {
    await this.ensureConnection();
    return await quantumAPI.post(BACKEND_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  }

  async updateNotificationPreferences(preferences: any): Promise<BackendResponse> {
    await this.ensureConnection();
    return await quantumAPI.put(BACKEND_ENDPOINTS.NOTIFICATIONS.PREFERENCES, preferences);
  }

  async updatePushToken(token: string): Promise<BackendResponse> {
    await this.ensureConnection();
    return await quantumAPI.post(BACKEND_ENDPOINTS.NOTIFICATIONS.PUSH_TOKEN, { token });
  }

  // AI API integration
  async getTrustScore(sitterId: string): Promise<BackendResponse<any>> {
    await this.ensureConnection();
    return await quantumAPI.get(`${BACKEND_ENDPOINTS.AI.TRUST_SCORE}?sitterId=${sitterId}`);
  }

  async getMatchmakingRecommendations(filters: any): Promise<BackendResponse<any[]>> {
    await this.ensureConnection();
    return await quantumAPI.post(BACKEND_ENDPOINTS.AI.MATCHMAKING, filters);
  }

  async analyzeSentiment(reviewText: string): Promise<BackendResponse<any>> {
    await this.ensureConnection();
    return await quantumAPI.post(BACKEND_ENDPOINTS.AI.SENTIMENT, { text: reviewText });
  }

  async getSmartBookingSuggestions(bookingData: any): Promise<BackendResponse<any[]>> {
    await this.ensureConnection();
    return await quantumAPI.post(BACKEND_ENDPOINTS.AI.SMART_BOOKING, bookingData);
  }

  async getAIRecommendations(userId: string): Promise<BackendResponse<any[]>> {
    await this.ensureConnection();
    return await quantumAPI.get(`${BACKEND_ENDPOINTS.AI.RECOMMENDATIONS}?userId=${userId}`);
  }

  // Health and metrics
  async getHealthMetrics(): Promise<BackendResponse<any>> {
    await this.ensureConnection();
    return await quantumAPI.get(BACKEND_ENDPOINTS.HEALTH.METRICS);
  }

  // Error handling and retry logic
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    throw lastError;
  }

  // Batch operations
  async batchGetBookings(bookingIds: string[]): Promise<BackendResponse<any[]>> {
    await this.ensureConnection();
    return await quantumAPI.post('/bookings/batch', { ids: bookingIds });
  }

  async batchUpdateNotifications(notificationIds: string[], action: 'read' | 'delete'): Promise<BackendResponse> {
    await this.ensureConnection();
    return await quantumAPI.post('/notifications/batch', { ids: notificationIds, action });
  }
}

export const backendService = BackendIntegrationService.getInstance();
