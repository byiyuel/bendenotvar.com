export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  department?: string;
  faculty?: string;
  year?: string;
  bio?: string;
  profileImage?: string;
  isVerified: boolean;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  adsCount?: number;
  favoritesCount?: number;
  messagesCount?: number;
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  category: 'Not' | 'Kitap' | 'Ekipman' | 'PDF' | 'Proje' | 'Acil';
  shareType: 'BORROW' | 'PERMANENT' | 'DIGITAL';
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  fileUrl?: string;
  locationDetails?: string;
  whatsappLink?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  _count: {
    favorites: number;
    conversations: number;
  };
}

export interface Conversation {
  id: string;
  lastMessageTime: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'BLOCKED';
  createdAt: string;
  updatedAt: string;
  ad: {
    id: string;
    title: string;
    category: string;
  };
  starter: User;
  recipient: User;
  messages: Message[];
  _count: {
    messages: number;
  };
}

export interface Message {
  id: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: User;
}

export interface Favorite {
  id: string;
  createdAt: string;
  ad: Ad;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  errors?: any[];
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UserAdsResponse {
  ads: Ad[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  department?: string;
  faculty?: string;
}

export interface AdForm {
  title: string;
  description: string;
  category: string;
  shareType: string;
  locationDetails?: string;
  whatsappLink?: string;
  file?: File;
}

export interface MessageForm {
  content: string;
  conversationId?: string;
  adId?: string;
}

export interface FilterOptions {
  page?: number;
  limit?: number;
  category?: string;
  shareType?: string;
  faculty?: string;
  department?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

