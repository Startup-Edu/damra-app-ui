import { apiClient } from '@/api/client'
import type { DashboardStatsResponse } from '../_types/dashboard.types'

export const superAdminDashboardService = {
  getStats: async () => {
    return apiClient.get<DashboardStatsResponse>('/admin/dashboard/stats')
  },
}
