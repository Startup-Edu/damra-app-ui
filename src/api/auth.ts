import { apiClient } from './client'

export interface User {
  id: string
  email: string
  name: string
  role: string
  permissions: string[]
}

export interface AuthResponse<T = any> {
  success: boolean
  status_code: number
  message: string
  message_kh: string
  data: T
}

export const authApi = {
  login: (credentials: Record<string, any>) =>
    apiClient.post<AuthResponse<User>>('/auth/login', credentials),

  logout: () =>
    apiClient.post<AuthResponse<void>>('/auth/logout'),

  loadUser: () =>
    apiClient.get<AuthResponse<User>>('/auth/load-user'),

  updateProfile: (payload: Record<string, any>) =>
    apiClient.post<AuthResponse<any>>('/auth/profile', payload),
}
