import { apiClient } from '@/api/client'
import type {
  ListVerificationsResponse,
  VerificationStatsResponse,
  StudentVerificationItem,
  RejectVerificationDTO,
} from '../_types/studentVerification.types'

export interface ListVerificationsParams {
  page?: number
  limit?: number
  status?: string
  search?: string
  gradeId?: string
  startDate?: string
  endDate?: string
}

export const superAdminStudentVerificationService = {
  listVerifications: async (params: ListVerificationsParams = {}) => {
    const queryParams: Record<string, string> = {
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 10),
    }

    if (params.status && params.status !== 'ALL') {
      queryParams.status = params.status
    }

    if (params.search && params.search.trim()) {
      queryParams.search = params.search.trim()
    }

    if (params.gradeId && params.gradeId !== 'ALL') {
      queryParams.gradeId = params.gradeId
    }

    if (params.startDate) {
      queryParams.startDate = params.startDate
    }

    if (params.endDate) {
      queryParams.endDate = params.endDate
    }

    return apiClient.get<ListVerificationsResponse>('/admin/student-verifications', {
      params: queryParams,
    })
  },

  getStats: async () => {
    return apiClient.get<VerificationStatsResponse>('/admin/student-verifications/stats')
  },

  getById: async (id: string) => {
    return apiClient.get<{ success: boolean; data: StudentVerificationItem }>(
      `/admin/student-verifications/${id}`
    )
  },

  approve: async (id: string) => {
    return apiClient.post<{ success: boolean; message: string }>(
      `/admin/student-verifications/${id}/approve`
    )
  },

  reject: async (id: string, data: RejectVerificationDTO) => {
    return apiClient.post<{ success: boolean; message: string }>(
      `/admin/student-verifications/${id}/reject`,
      data
    )
  },
}
