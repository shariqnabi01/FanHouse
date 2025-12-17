import api from './api';

export interface User {
  id: string;
  email: string;
  username?: string;
  role: 'fan' | 'creator' | 'admin';
  creator?: {
    id: string;
    verification_status: 'pending' | 'approved' | 'rejected';
    bio?: string;
    display_name?: string;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
}

export async function register(email: string, password: string, username?: string, role: string = 'fan'): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register', { email, password, username, role });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await api.get<{ user: User }>('/auth/me');
  return response.data.user;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

