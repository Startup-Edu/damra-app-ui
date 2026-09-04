import { useQuery } from '@tanstack/react-query'
import { superAdminDashboardService } from '../_services/dashboard.service'

export function useDashboardStatsQuery() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: () => superAdminDashboardService.getStats(),
    staleTime: 30 * 1000,
  })
}
