import apiClient from './apiClient';

// Generic entity class for API operations
class EntityAPI {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  async create(data) {
    const response = await apiClient.post(`/${this.endpoint}`, data);
    return response.data;
  }

  async get(id) {
    const response = await apiClient.get(`/${this.endpoint}/${id}`);
    return response.data;
  }

  async update(id, data) {
    const response = await apiClient.put(`/${this.endpoint}/${id}`, data);
    return response.data;
  }

  async delete(id) {
    const response = await apiClient.delete(`/${this.endpoint}/${id}`);
    return response.data;
  }

  async filter(filters = {}, sort = '') {
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, JSON.stringify(filters[key]));
        }
      });
    }
    if (sort) {
      params.append('sort', sort);
    }
    
    const response = await apiClient.get(`/${this.endpoint}?${params.toString()}`);
    return response.data;
  }

  async list() {
    const response = await apiClient.get(`/${this.endpoint}`);
    return response.data;
  }
}

// Auth API class
class AuthAPI {
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  }

  async register(userData) {
    const response = await apiClient.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  }

  async logout() {
    localStorage.removeItem('authToken');
    await apiClient.post('/auth/logout');
  }

  async me() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }

  async updateProfile(data) {
    const response = await apiClient.put('/auth/profile', data);
    return response.data;
  }
}

// Export entity instances
export const Pet = new EntityAPI('pets');
export const Booking = new EntityAPI('bookings');
export const Review = new EntityAPI('reviews');
export const Notification = new EntityAPI('notifications');
export const SessionLog = new EntityAPI('session-logs');
export const Gallery = new EntityAPI('gallery');
export const SitterAvailability = new EntityAPI('sitter-availability');

// Export auth instance
export const User = new AuthAPI();