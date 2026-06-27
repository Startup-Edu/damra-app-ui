import { apiClient } from '@/api/client'
import type {
  ListGradesResponse,
  CreateGradeDTO,
  UpdateGradeDTO,
  GradeItem,
} from '../_types/grade.types'

export const superAdminGradeService = {
  listGrades: async (page = 1, limit = 10, search = '') => {
    return apiClient.get<ListGradesResponse>('/admin/grades', {
      params: {
        page: String(page),
        limit: String(limit),
        search,
      },
    })
  },

  getGrade: async (id: string) => {
    return apiClient.get<{ success: boolean; data: GradeItem }>(`/admin/grades/${id}`)
  },

  createGrade: async (data: CreateGradeDTO) => {
    return apiClient.post<{ success: boolean; message: string }>('/admin/grades', data)
  },

  updateGrade: async (id: string, data: UpdateGradeDTO) => {
    return apiClient.patch<{ success: boolean; message: string }>(`/admin/grades/${id}`, data)
  },

  deleteGrade: async (id: string) => {
    return apiClient.delete<{ success: boolean; message: string }>(`/admin/grades/${id}`)
  },
}
