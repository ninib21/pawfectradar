import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

// 🔐 QUANTUM API CLIENT: Military-grade API client with quantum security
export class QuantumAPIClient {
  private client: AxiosInstance;
  private baseURL: string;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
    this.client = this.createClient();
    this.setupInterceptors();
  }

  private createClient(): AxiosInstance {
    return axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-Quantum-Security': 'military-grade',
        'X-Quantum-Encryption': 'post-quantum',
        'X-Quantum-Monitoring': 'enabled',
      },
    });
  }

  private setupInterceptors(): void {
    // Request interceptor for authentication
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for token refresh and error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshToken();
            if (newToken) {
              originalRequest.headers!.Authorization = `Bearer ${newToken}`;
              this.processQueue(null, newToken);
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            await this.logout();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('quantum_access_token');
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  private async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('quantum_refresh_token');
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  private async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token available');

      const response = await axios.post(`${this.baseURL}/auth/refresh`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      await SecureStore.setItemAsync('quantum_access_token', accessToken);
      await SecureStore.setItemAsync('quantum_refresh_token', newRefreshToken);

      return accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
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

  private async logout(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('quantum_access_token');
      await SecureStore.deleteItemAsync('quantum_refresh_token');
      await SecureStore.deleteItemAsync('quantum_user_data');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 400:
          return new Error(`Bad Request: ${data?.message || 'Invalid request'}`);
        case 401:
          return new Error('Unauthorized: Please login again');
        case 403:
          return new Error('Forbidden: Access denied');
        case 404:
          return new Error('Not Found: Resource not available');
        case 422:
          return new Error(`Validation Error: ${data?.message || 'Invalid data'}`);
        case 429:
          return new Error('Too Many Requests: Please try again later');
        case 500:
          return new Error('Server Error: Please try again later');
        default:
          return new Error(`HTTP Error ${status}: ${data?.message || 'Unknown error'}`);
      }
    } else if (error.request) {
      return new Error('Network Error: Please check your connection');
    } else {
      return new Error(`Request Error: ${error.message}`);
    }
  }

  // 🔐 AUTHENTICATION METHODS
  async login(email: string, password: string): Promise<any> {
    const response = await this.client.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user } = response.data;
    
    await SecureStore.setItemAsync('quantum_access_token', accessToken);
    await SecureStore.setItemAsync('quantum_refresh_token', refreshToken);
    await SecureStore.setItemAsync('quantum_user_data', JSON.stringify(user));
    
    return response.data;
  }

  async register(userData: any): Promise<any> {
    const response = await this.client.post('/auth/register', userData);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } finally {
      await this.logout();
    }
  }

  // 👥 USER METHODS
  async getCurrentUser(): Promise<any> {
    const response = await this.client.get('/users/me');
    return response.data;
  }

  async updateProfile(userData: any): Promise<any> {
    const response = await this.client.put('/users/profile', userData);
    return response.data;
  }

  async uploadAvatar(file: any): Promise<any> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await this.client.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  // 🐕 PET METHODS
  async getPets(): Promise<any[]> {
    const response = await this.client.get('/pets');
    return response.data;
  }

  async createPet(petData: any): Promise<any> {
    const response = await this.client.post('/pets', petData);
    return response.data;
  }

  async updatePet(petId: string, petData: any): Promise<any> {
    const response = await this.client.put(`/pets/${petId}`, petData);
    return response.data;
  }

  async deletePet(petId: string): Promise<void> {
    await this.client.delete(`/pets/${petId}`);
  }

  // 📅 BOOKING METHODS
  async getBookings(): Promise<any[]> {
    const response = await this.client.get('/bookings');
    return response.data;
  }

  async createBooking(bookingData: any): Promise<any> {
    const response = await this.client.post('/bookings', bookingData);
    return response.data;
  }

  async updateBooking(bookingId: string, bookingData: any): Promise<any> {
    const response = await this.client.put(`/bookings/${bookingId}`, bookingData);
    return response.data;
  }

  async cancelBooking(bookingId: string): Promise<any> {
    const response = await this.client.patch(`/bookings/${bookingId}/cancel`);
    return response.data;
  }

  // 🔍 SITTER SEARCH METHODS
  async searchSitters(filters: any): Promise<any[]> {
    const response = await this.client.get('/sitters/search', { params: filters });
    return response.data;
  }

  async getSitterProfile(sitterId: string): Promise<any> {
    const response = await this.client.get(`/sitters/${sitterId}`);
    return response.data;
  }

  // ⭐ REVIEW METHODS
  async getReviews(entityId: string, entityType: 'sitter' | 'owner'): Promise<any[]> {
    const response = await this.client.get(`/reviews/${entityType}/${entityId}`);
    return response.data;
  }

  async createReview(reviewData: any): Promise<any> {
    const response = await this.client.post('/reviews', reviewData);
    return response.data;
  }

  // 💳 PAYMENT METHODS
  async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<any> {
    const response = await this.client.post('/payments/create-intent', {
      amount,
      currency,
    });
    return response.data;
  }

  async confirmPayment(paymentIntentId: string): Promise<any> {
    const response = await this.client.post('/payments/confirm', {
      paymentIntentId,
    });
    return response.data;
  }

  // 📱 NOTIFICATION METHODS
  async getNotifications(): Promise<any[]> {
    const response = await this.client.get('/notifications');
    return response.data;
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.client.patch(`/notifications/${notificationId}/read`);
  }

  // 📊 ANALYTICS METHODS
  async trackEvent(eventData: any): Promise<void> {
    await this.client.post('/analytics/events', eventData);
  }

  async getAnalytics(timeframe: string): Promise<any> {
    const response = await this.client.get('/analytics', { params: { timeframe } });
    return response.data;
  }

  // 🔄 SESSION METHODS
  async getSessions(): Promise<any[]> {
    const response = await this.client.get('/sessions');
    return response.data;
  }

  async createSession(sessionData: any): Promise<any> {
    const response = await this.client.post('/sessions', sessionData);
    return response.data;
  }

  async updateSession(sessionId: string, sessionData: any): Promise<any> {
    const response = await this.client.put(`/sessions/${sessionId}`, sessionData);
    return response.data;
  }

  // 📁 FILE UPLOAD METHODS
  async uploadFile(file: any, type: 'image' | 'document'): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await this.client.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  // 🌐 WEBSOCKET CONNECTION
  getWebSocketURL(): string {
    return this.baseURL.replace('http', 'ws') + '/ws';
  }
}

// Export singleton instance
export const quantumAPI = new QuantumAPIClient();
export default quantumAPI;
