import { apiClient } from './client'

export const healthApi = {
  checkHealth: () =>
    apiClient.get<any>('/health'),
}
