import { apiClient } from './api';
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types';

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  }

  static async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', credentials);
  }

  static async getProfile(): Promise<User> {
    return apiClient.get<User>('/auth/profile');
  }

  static async refreshToken(): Promise<{ access_token: string }> {
    return apiClient.post<{ access_token: string }>('/auth/refresh');
  }
}