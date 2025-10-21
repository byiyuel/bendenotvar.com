import axios, { AxiosResponse } from 'axios';
import { 
  AuthResponse, 
  User, 
  Ad, 
  Conversation, 
  Message, 
  Favorite, 
  LoginForm, 
  RegisterForm, 
  MessageForm,
  FilterOptions,
  PaginationResponse
} from '../types';

// Use relative base URL by default so production goes through the same-origin Nginx proxy
// Falls back to env override for local dev or special setups
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - token ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - token süresi dolmuşsa logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data: LoginForm): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/login', data),
  
  register: (data: RegisterForm): Promise<AxiosResponse<{ message: string; user: User }>> =>
    api.post('/auth/register', data),
  
  verifyEmail: (token: string): Promise<AxiosResponse<{ message: string }>> =>
    api.post(`/auth/verify/${token}`),
  
  verifyToken: (): Promise<AxiosResponse<{ valid: boolean; user: User }>> =>
    api.get('/auth/verify-token'),
};

// User API
export const userAPI = {
  getProfile: (): Promise<AxiosResponse<User>> =>
    api.get('/user/profile'),
  
  updateProfile: (data: Partial<User> | FormData): Promise<AxiosResponse<{ message: string; user: User }>> => {
    const isFormData = data instanceof FormData;
    return api.put('/user/profile', data, isFormData ? {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    } : undefined);
  },
  
  changePassword: (data: { currentPassword: string; newPassword: string }): Promise<AxiosResponse<{ message: string }>> =>
    api.put('/user/change-password', data),
  
  getUserAds: (params?: { page?: number; limit?: number; status?: string }): Promise<AxiosResponse<PaginationResponse<Ad>>> =>
    api.get('/user/ads', { params }),
  
  getFavorites: (params?: { page?: number; limit?: number }): Promise<AxiosResponse<PaginationResponse<Favorite>>> =>
    api.get('/user/favorites', { params }),
  
  getConversations: (): Promise<AxiosResponse<Conversation[]>> =>
    api.get('/user/conversations'),
  
  getStats: (): Promise<AxiosResponse<{ adsCount: number; favoritesCount: number; conversationsCount: number; unreadMessagesCount: number }>> =>
    api.get('/user/stats'),
};

// Ads API
export const adsAPI = {
  getAds: (params?: FilterOptions & { page?: number; limit?: number }): Promise<AxiosResponse<PaginationResponse<Ad>>> =>
    api.get('/ads', { params }),
  
  getAd: (id: string): Promise<AxiosResponse<Ad>> =>
    api.get(`/ads/${id}`),
  
  createAd: (data: FormData): Promise<AxiosResponse<{ message: string; ad: Ad }>> =>
    api.post('/ads', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  updateAd: (id: string, data: FormData): Promise<AxiosResponse<{ message: string; ad: Ad }>> =>
    api.put(`/ads/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  deleteAd: (id: string): Promise<AxiosResponse<{ message: string }>> =>
    api.delete(`/ads/${id}`),
  
  updateAdStatus: (id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<AxiosResponse<{ message: string; ad: Ad }>> =>
    api.patch(`/ads/${id}/status`, { status }),
  
  getCategories: (): Promise<AxiosResponse<{ id: string; name: string; description?: string }[]>> =>
    api.get('/ads/categories/list'),
  
  getFaculties: (): Promise<AxiosResponse<{ faculties: string[]; departments: string[] }>> =>
    api.get('/ads/faculties/list'),
};

// Favorites API
export const favoritesAPI = {
  toggleFavorite: (adId: string): Promise<AxiosResponse<{ message: string; isFavorite: boolean }>> =>
    api.post(`/favorites/${adId}`),
  
  checkFavoriteStatus: (adId: string): Promise<AxiosResponse<{ isFavorite: boolean }>> =>
    api.get(`/favorites/${adId}/status`),
  
  getFavorites: (params?: { page?: number; limit?: number }): Promise<AxiosResponse<PaginationResponse<Favorite>>> =>
    api.get('/favorites', { params }),
  
  removeFavorite: (adId: string): Promise<AxiosResponse<{ message: string }>> =>
    api.delete(`/favorites/${adId}`),
};

// Messages API
export const messagesAPI = {
  getConversations: (): Promise<AxiosResponse<Conversation[]>> =>
    api.get('/messages/conversations'),
  
  getConversation: (id: string): Promise<AxiosResponse<Conversation>> =>
    api.get(`/messages/conversations/${id}`),
  
  createConversation: (adId: string, recipientId: string): Promise<AxiosResponse<Conversation>> =>
    api.post('/messages/conversations', { adId, recipientId }),
  
  getMessages: (conversationId: string, params?: { page?: number; limit?: number }): Promise<AxiosResponse<PaginationResponse<Message>>> =>
    api.get(`/messages/conversations/${conversationId}/messages`, { params }),
  
  sendMessage: (data: MessageForm): Promise<AxiosResponse<{ message: string; messageData: Message; conversation: Conversation }>> =>
    api.post('/messages/send', data),
  
  markMessageAsRead: (messageId: string): Promise<AxiosResponse<{ message: string }>> =>
    api.patch(`/messages/messages/${messageId}/read`),
  
  getUnreadCount: (): Promise<AxiosResponse<{ unreadCount: number }>> =>
    api.get('/messages/unread/count'),
};

// Stats API
export const statsAPI = {
  getStats: (): Promise<AxiosResponse<{
    totalAds: number;
    totalUsers: number;
    totalMessages: number;
    totalFavorites: number;
  }>> =>
    api.get('/stats'),
  
  getCategoryStats: (): Promise<AxiosResponse<{
    notes: number;
    books: number;
    equipment: number;
    projects: number;
  }>> =>
    api.get('/stats/categories'),
};

// Admin API
export const adminAPI = {
  getOverview: (): Promise<AxiosResponse<{ totalUsers: number; totalAds: number; totalMessages: number; totalFavorites: number }>> =>
    api.get('/admin/overview'),
  getPendingAds: (): Promise<AxiosResponse<any[]>> =>
    api.get('/admin/ads/pending'),
  updateAdStatus: (id: string, status: 'PENDING'|'ACTIVE'|'REJECTED'|'INACTIVE'|'DELETED'): Promise<AxiosResponse<{ message: string }>> =>
    api.patch(`/admin/ads/${id}/status`, { status }),
  getUsers: (): Promise<AxiosResponse<Array<Pick<User, 'id'|'email'|'firstName'|'lastName'|'role'|'isVerified'|'createdAt'>>>> =>
    api.get('/admin/users'),
  updateUserRole: (id: string, role: 'USER'|'ADMIN'): Promise<AxiosResponse<{ message: string }>> =>
    api.patch(`/admin/users/${id}/role`, { role }),
  deleteUser: (id: string): Promise<AxiosResponse<{ message: string }>> =>
    api.delete(`/admin/users/${id}`),
  getAds: (): Promise<AxiosResponse<any[]>> =>
    api.get('/admin/ads'),
  deleteAd: (id: string): Promise<AxiosResponse<{ message: string }>> =>
    api.delete(`/admin/ads/${id}`),
  getCategories: (): Promise<AxiosResponse<{ id: string; name: string; description?: string }[]>> =>
    api.get('/admin/categories'),
  createCategory: (data: { name: string; description?: string }): Promise<AxiosResponse<{ message: string }>> =>
    api.post('/admin/categories', data),
  updateCategory: (id: string, data: { name: string; description?: string }): Promise<AxiosResponse<{ message: string }>> =>
    api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id: string): Promise<AxiosResponse<{ message: string }>> =>
    api.delete(`/admin/categories/${id}`),
};

export default api;

