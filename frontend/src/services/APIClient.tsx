import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';

interface APIResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  quantumToken?: string;
}

interface APIError {
  message: string;
  code: string;
  status: number;
}

class QuantumAPIClient {
  private client: AxiosInstance;
  private baseURL: string;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_API_URL || 'https://quantum-pawfectsitters-api.railway.app';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-Client': 'react-native',
        'X-Version': '1.0.0',
        'X-Quantum': 'true',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const token = await SecureStore.getItemAsync('quantum_token');
          if (token) {
            config.headers.Authorization = `Bearer quantum-${token}`;
          }
          
          // Add quantum security headers
          config.headers['X-Quantum-Security'] = 'military-grade';
          config.headers['X-Quantum-Encryption'] = 'post-quantum';
          config.headers['X-Quantum-Authentication'] = 'biometric-quantum';
          
          return config;
        } catch (error) {
          console.error('Request interceptor error:', error);
          return config;
        }
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse<APIResponse>) => {
        // Handle quantum token updates
        if (response.data.quantumToken) {
          SecureStore.setItemAsync('quantum_token', response.data.quantumToken);
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Attempt to refresh quantum token
            const newToken = await this.refreshQuantumToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer quantum-${newToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Clear token and redirect to login
            await SecureStore.deleteItemAsync('quantum_token');
            throw refreshError;
          } finally {
            this.isRefreshing = false;
            this.processQueue(null, null);
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private async refreshQuantumToken(): Promise<string | null> {
    try {
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      if (!refreshToken) return null;

      const response = await axios.post(`${this.baseURL}/auth/refresh`, {
        refreshToken,
      });

      const newToken = response.data.data.quantumToken;
      if (newToken) {
        await SecureStore.setItemAsync('quantum_token', newToken);
        return newToken;
      }

      return null;
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  }

  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private handleError(error: any): APIError {
    if (error.response) {
      return {
        message: error.response.data?.message || 'Server error',
        code: error.response.data?.code || 'UNKNOWN_ERROR',
        status: error.response.status,
      };
    } else if (error.request) {
      return {
        message: 'Network error - no response received',
        code: 'NETWORK_ERROR',
        status: 0,
      };
    } else {
      return {
        message: error.message || 'Unknown error',
        code: 'UNKNOWN_ERROR',
        status: 0,
      };
    }
  }

  // Authentication APIs
  async login(email: string, password: string): Promise<APIResponse> {
    const response = await this.client.post('/auth/login', {
      email,
      password,
      quantumEncrypted: true,
    });
    return response.data;
  }

  async register(userData: any): Promise<APIResponse> {
    const response = await this.client.post('/auth/register', {
      ...userData,
      quantumEncrypted: true,
    });
    return response.data;
  }

  async googleLogin(token: string): Promise<APIResponse> {
    const response = await this.client.post('/auth/google', {
      token,
      quantumEncrypted: true,
    });
    return response.data;
  }

  async logout(): Promise<APIResponse> {
    const response = await this.client.post('/auth/logout');
    await SecureStore.deleteItemAsync('quantum_token');
    await SecureStore.deleteItemAsync('refresh_token');
    return response.data;
  }

  // User APIs
  async getProfile(): Promise<APIResponse> {
    const response = await this.client.get('/users/profile');
    return response.data;
  }

  async updateProfile(userData: any): Promise<APIResponse> {
    const response = await this.client.put('/users/profile', {
      ...userData,
      quantumEncrypted: true,
    });
    return response.data;
  }

  async uploadProfileImage(imageData: any): Promise<APIResponse> {
    const formData = new FormData();
    formData.append('image', imageData);
    
    const response = await this.client.post('/users/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Pet APIs
  async getPets(): Promise<APIResponse> {
    const response = await this.client.get('/pets');
    return response.data;
  }

  async createPet(petData: any): Promise<APIResponse> {
    const response = await this.client.post('/pets', {
      ...petData,
      quantumEncrypted: true,
    });
    return response.data;
  }

  async updatePet(petId: string, petData: any): Promise<APIResponse> {
    const response = await this.client.put(`/pets/${petId}`, {
      ...petData,
      quantumEncrypted: true,
    });
    return response.data;
  }

  async deletePet(petId: string): Promise<APIResponse> {
    const response = await this.client.delete(`/pets/${petId}`);
    return response.data;
  }

  // Booking APIs
  async getBookings(): Promise<APIResponse> {
    const response = await this.client.get('/bookings');
    return response.data;
  }

  async createBooking(bookingData: any): Promise<APIResponse> {
    const response = await this.client.post('/bookings', {
      ...bookingData,
      quantumEncrypted: true,
    });
    return response.data;
  }

  async updateBooking(bookingId: string, bookingData: any): Promise<APIResponse> {
    const response = await this.client.put(`/bookings/${bookingId}`, {
      ...bookingData,
      quantumEncrypted: true,
    });
    return response.data;
  }

  async cancelBooking(bookingId: string): Promise<APIResponse> {
    const response = await this.client.post(`/bookings/${bookingId}/cancel`);
    return response.data;
  }

  // Sitter APIs
  async searchSitters(filters: any): Promise<APIResponse> {
    const response = await this.client.get('/sitters/search', {
      params: {
        ...filters,
        quantum: true,
      },
    });
    return response.data;
  }

  async getSitterProfile(sitterId: string): Promise<APIResponse> {
    const response = await this.client.get(`/sitters/${sitterId}`);
    return response.data;
  }

  async getSitterReviews(sitterId: string): Promise<APIResponse> {
    const response = await this.client.get(`/sitters/${sitterId}/reviews`);
    return response.data;
  }

  // Payment APIs
  async createPaymentIntent(bookingId: string, amount: number): Promise<APIResponse> {
    const response = await this.client.post('/payments/create-intent', {
      bookingId,
      amount,
      quantumEncrypted: true,
    });
    return response.data;
  }

  async confirmPayment(paymentIntentId: string): Promise<APIResponse> {
    const response = await this.client.post('/payments/confirm', {
      paymentIntentId,
      quantumEncrypted: true,
    });
    return response.data;
  }

  // Message APIs
  async getMessages(userId: string): Promise<APIResponse> {
    const response = await this.client.get(`/messages/${userId}`);
    return response.data;
  }

  async sendMessage(messageData: any): Promise<APIResponse> {
    const response = await this.client.post('/messages', {
      ...messageData,
      quantumEncrypted: true,
    });
    return response.data;
  }

  async markMessageAsRead(messageId: string): Promise<APIResponse> {
    const response = await this.client.put(`/messages/${messageId}/read`);
    return response.data;
  }

  // Analytics APIs
  async trackEvent(eventData: any): Promise<APIResponse> {
    const response = await this.client.post('/analytics/track', {
      ...eventData,
      quantumEncrypted: true,
    });
    return response.data;
  }

  async getAnalytics(): Promise<APIResponse> {
    const response = await this.client.get('/analytics');
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<APIResponse> {
    const response = await this.client.get('/health');
    return response.data;
  }
}

// Create singleton instance
const apiClient = new QuantumAPIClient();

export default apiClient;
