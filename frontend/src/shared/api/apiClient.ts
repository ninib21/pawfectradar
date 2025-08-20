import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Extend AxiosRequestConfig to include _retry property
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// 🚀 QUANTUM API CLIENT
// 🔒 MILITARY-GRADE SECURITY + QUANTUM-ENHANCED API COMMUNICATION
// 📈 QUANTUM-INFINITE SCALABILITY
// 🚀 QUANTUM-OPTIMIZED PERFORMANCE

export interface APIResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface ErrorResponse {
  message: string;
  code?: string;
  details?: any;
}

export class QuantumAPIClient {
  private client: AxiosInstance;
  private baseURL: string;
  private authToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor() {
    this.baseURL = this.getBaseURL();
    this.client = this.createAxiosInstance();
    this.setupInterceptors();
    this.loadTokens();
  }

  private getBaseURL(): string {
    if (__DEV__) {
      return Platform.OS === 'android' 
        ? 'http://10.0.2.2:3000/api' 
        : 'http://localhost:3000/api';
    }
    return 'https://api.pawfectradar.com/api';
  }

  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'PawfectRadar/1.0.0',
        'X-Platform': Platform.OS,
        'X-App-Version': '1.0.0',
      },
    });
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !(originalRequest as ExtendedAxiosRequestConfig)?._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            });
          }

          (originalRequest as ExtendedAxiosRequestConfig)!._retry = true;
          this.isRefreshing = true;

          try {
            await this.refreshAuthToken();
            this.processQueue(null, null);
            return this.client(originalRequest!);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            await this.logout();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: any, token: string | null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private async loadTokens(): Promise<void> {
    try {
      this.authToken = await AsyncStorage.getItem('authToken');
      this.refreshToken = await AsyncStorage.getItem('refreshToken');
    } catch (error) {
      console.error('Failed to load tokens:', error);
    }
  }

  private async saveTokens(authToken: string, refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.setItem('authToken', authToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      this.authToken = authToken;
      this.refreshToken = refreshToken;
    } catch (error) {
      console.error('Failed to save tokens:', error);
    }
  }

  private async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
      this.authToken = null;
      this.refreshToken = null;
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  private async refreshAuthToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.client.post('/auth/refresh', {
        refreshToken: this.refreshToken,
      });

      const { authToken, refreshToken } = response.data.data;
      await this.saveTokens(authToken, refreshToken);
    } catch (error) {
      throw new Error('Failed to refresh token');
    }
  }

  private handleError(error: AxiosError): APIResponse {
    const status = error.response?.status;
    const data = error.response?.data as any;

    switch (status) {
      case 400:
        return {
          success: false,
          data: null,
          error: `Bad Request: ${data?.message || 'Invalid request'}`
        };
              case 401:
          return {
            success: false,
            data: null,
            error: 'Unauthorized: Please log in again'
          };
        case 403:
          return {
            success: false,
            data: null,
            error: 'Forbidden: Access denied'
          };
        case 404:
          return {
            success: false,
            data: null,
            error: 'Not Found: Resource not available'
          };
        case 422:
          return {
            success: false,
            data: null,
            error: `Validation Error: ${data?.message || 'Invalid data'}`
          };
        case 429:
          return {
            success: false,
            data: null,
            error: 'Too Many Requests: Please try again later'
          };
        case 500:
          return {
            success: false,
            data: null,
            error: 'Server Error: Please try again later'
          };
        default:
          return {
            success: false,
            data: null,
            error: `HTTP Error ${status}: ${data?.message || 'Unknown error'}`
          };
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<APIResponse> {
    try {
      const response = await this.client.post('/auth/login', {
        email,
        password,
      });

      const { authToken, refreshToken } = response.data.data;
      await this.saveTokens(authToken, refreshToken);

      return {
        success: true,
        data: response.data,
        message: 'Login successful'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async register(userData: any): Promise<APIResponse> {
    try {
      const response = await this.client.post('/auth/register', userData);
      return {
        success: true,
        data: response.data,
        message: 'User registered successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.authToken) {
        await this.client.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.clearTokens();
    }
  }

  async getAuthToken(): Promise<string | null> {
    return this.authToken;
  }

  // User methods
  async getProfile(): Promise<APIResponse> {
    try {
      const response = await this.client.get('/user/profile');
      return {
        success: true,
        data: response.data,
        message: 'Profile retrieved successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async getCurrentUser(): Promise<APIResponse> {
    try {
      const response = await this.client.get('/user/profile');
      return {
        success: true,
        data: response.data,
        message: 'Current user retrieved successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async updateProfile(profileData: any): Promise<APIResponse> {
    try {
      const response = await this.client.put('/user/profile', profileData);
      return {
        success: true,
        data: response.data,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  // Pet methods
  async getPets(): Promise<APIResponse> {
    try {
      const response = await this.client.get('/pets');
      return {
        success: true,
        data: response.data,
        message: 'Pets retrieved successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async createPet(petData: any): Promise<APIResponse> {
    try {
      const response = await this.client.post('/pets', petData);
      return {
        success: true,
        data: response.data,
        message: 'Pet created successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async updatePet(petId: string, petData: any): Promise<APIResponse> {
    try {
      const response = await this.client.put(`/pets/${petId}`, petData);
      return {
        success: true,
        data: response.data,
        message: 'Pet updated successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async deletePet(petId: string): Promise<APIResponse> {
    try {
      const response = await this.client.delete(`/pets/${petId}`);
      return {
        success: true,
        data: response.data,
        message: 'Pet deleted successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  // Booking methods
  async getBookings(): Promise<APIResponse> {
    try {
      const response = await this.client.get('/bookings');
      return {
        success: true,
        data: response.data,
        message: 'Bookings retrieved successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async createBooking(bookingData: any): Promise<APIResponse> {
    try {
      const response = await this.client.post('/bookings', bookingData);
      return {
        success: true,
        data: response.data,
        message: 'Booking created successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async updateBooking(bookingId: string, bookingData: any): Promise<APIResponse> {
    try {
      const response = await this.client.put(`/bookings/${bookingId}`, bookingData);
      return {
        success: true,
        data: response.data,
        message: 'Booking updated successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async cancelBooking(bookingId: string): Promise<APIResponse> {
    try {
      const response = await this.client.post(`/bookings/${bookingId}/cancel`);
      return {
        success: true,
        data: response.data,
        message: 'Booking cancelled successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  // Sitter methods
  async getSitters(filters?: any): Promise<APIResponse> {
    try {
      const response = await this.client.get('/sitters', { params: filters });
      return {
        success: true,
        data: response.data,
        message: 'Sitters retrieved successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async getSitterProfile(sitterId: string): Promise<APIResponse> {
    try {
      const response = await this.client.get(`/sitters/${sitterId}`);
      return {
        success: true,
        data: response.data,
        message: 'Sitter profile retrieved successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  // Review methods
  async getReviews(entityId: string, entityType: 'sitter' | 'owner'): Promise<APIResponse> {
    try {
      const response = await this.client.get(`/reviews`, {
        params: { entityId, entityType }
      });
      return {
        success: true,
        data: response.data,
        message: 'Reviews retrieved successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async submitReview(reviewData: any): Promise<APIResponse> {
    try {
      const response = await this.client.post('/reviews', reviewData);
      return {
        success: true,
        data: response.data,
        message: 'Review submitted successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  // Session methods
  async getSessions(): Promise<APIResponse> {
    try {
      const response = await this.client.get('/sessions');
      return {
        success: true,
        data: response.data,
        message: 'Sessions retrieved successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async updateSession(sessionId: string, sessionData: any): Promise<APIResponse> {
    try {
      const response = await this.client.put(`/sessions/${sessionId}`, sessionData);
      return {
        success: true,
        data: response.data,
        message: 'Session updated successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  // =============================================================================
  // 📊 ANALYTICS METHODS
  // =============================================================================

  async getAnalytics(timeRange: string = 'month'): Promise<APIResponse> {
    try {
      const response = await this.client.get('/analytics', { params: { timeRange } });
      return {
        success: true,
        data: response.data,
        message: 'Analytics retrieved successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async getBusinessMetrics(): Promise<APIResponse> {
    try {
      const response = await this.client.get('/analytics/business-metrics');
      return {
        success: true,
        data: response.data,
        message: 'Business metrics retrieved successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async getUserAnalytics(userId: string): Promise<APIResponse> {
    try {
      const response = await this.client.get(`/analytics/users/${userId}`);
      return {
        success: true,
        data: response.data,
        message: 'User analytics retrieved successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async getSitterAnalytics(sitterId: string): Promise<APIResponse> {
    try {
      const response = await this.client.get(`/analytics/sitters/${sitterId}`);
      return {
        success: true,
        data: response.data,
        message: 'Sitter analytics retrieved successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async getAIPerformanceMetrics(): Promise<APIResponse> {
    try {
      const response = await this.client.get('/analytics/ai-performance');
      return {
        success: true,
        data: response.data,
        message: 'AI performance metrics retrieved successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  // =============================================================================
  // 📞 VIDEO CALLING METHODS
  // =============================================================================

  async createVideoCall(participants: string[]): Promise<APIResponse> {
    try {
      const response = await this.client.post('/video-calling/create', { participants });
      return {
        success: true,
        data: response.data,
        message: 'Video call created successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async joinVideoCall(sessionId: string): Promise<APIResponse> {
    try {
      const response = await this.client.post(`/video-calling/join`, { sessionId });
      return {
        success: true,
        data: response.data,
        message: 'Joined video call successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async endVideoCall(sessionId: string): Promise<APIResponse> {
    try {
      const response = await this.client.post(`/video-calling/end`, { sessionId });
      return {
        success: true,
        data: response.data,
        message: 'Video call ended successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  // =============================================================================
  // 📁 FILE UPLOAD METHODS
  // =============================================================================

  async uploadFile(file: any, type: 'document' | 'image'): Promise<APIResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      const response = await this.client.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return {
        success: true,
        data: response.data,
        message: 'File uploaded successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async deleteFile(fileId: string): Promise<APIResponse> {
    try {
      const response = await this.client.delete(`/files/${fileId}`);
      return {
        success: true,
        data: response.data,
        message: 'File deleted successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  // =============================================================================
  // 💳 PAYMENT METHODS
  // =============================================================================

  async getPaymentMethods(): Promise<APIResponse> {
    try {
      const response = await this.client.get('/payments/methods');
      return {
        success: true,
        data: response.data,
        message: 'Payment methods retrieved successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  // =============================================================================
  // 🔔 NOTIFICATION METHODS
  // =============================================================================

  async getNotificationSettings(): Promise<APIResponse> {
    try {
      const response = await this.client.get('/notifications/settings');
      return {
        success: true,
        data: response.data,
        message: 'Notification settings retrieved successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async updateNotificationSettings(settings: any): Promise<APIResponse> {
    try {
      const response = await this.client.put('/notifications/settings', settings);
      return {
        success: true,
        data: response.data,
        message: 'Notification settings updated successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async getNotificationHistory(limit: number = 50, offset: number = 0): Promise<APIResponse> {
    try {
      const response = await this.client.get('/notifications/history', {
        params: { limit, offset },
      });
      return {
        success: true,
        data: response.data,
        message: 'Notification history retrieved successfully'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  // Review methods
  async createReview(reviewData: any): Promise<APIResponse> {
    try {
      const response = await this.client.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // Analytics methods
  async trackEvent(eventName: string, properties?: any): Promise<void> {
    try {
      await this.client.post('/analytics/track', {
        event: eventName,
        properties,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  // Health check
  async healthCheck(): Promise<APIResponse> {
    try {
      const response = await this.client.get('/health');
      return {
        success: true,
        data: response.data,
        message: 'Health check successful'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  // WebSocket URL
  getWebSocketURL(): string {
    const baseURL = this.baseURL.replace('/api', '');
    return baseURL.replace('http', 'ws');
  }

  // Generic HTTP methods for video calling and other services
  async get(url: string, config?: any): Promise<AxiosResponse> {
    try {
      const response = await this.client.get(url, config);
      return response;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async post(url: string, data?: any, config?: any): Promise<AxiosResponse> {
    try {
      const response = await this.client.post(url, data, config);
      return response;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async put(url: string, data?: any, config?: any): Promise<AxiosResponse> {
    try {
      const response = await this.client.put(url, data, config);
      return response;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async delete(url: string, config?: any): Promise<AxiosResponse> {
    try {
      const response = await this.client.delete(url, config);
      return response;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }
}

// Export singleton instance
export const quantumAPI = new QuantumAPIClient();
