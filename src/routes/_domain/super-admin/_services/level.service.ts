import { apiClient } from '@/api/client'
import type {
  ListLevelsResponse,
  CreateLevelDTO,
  UpdateLevelDTO,
  LevelItem,
} from '../_types/level.types'

export const superAdminLevelService = {
  listLevels: async (page = 1, limit = 10, search = '', categoryId?: string, gradeId?: string) => {
    const params: Record<string, string> = {
      page: String(page),
      limit: String(limit),
      search,
    }
    if (categoryId) params.categoryId = categoryId
    if (gradeId) params.gradeId = gradeId
    return apiClient.get<ListLevelsResponse>('/admin/levels', { params })
  },

  getLevel: async (id: string) => {
    return apiClient.get<{ success: boolean; data: LevelItem }>(`/admin/levels/${id}`)
  },

  createLevel: async (data: CreateLevelDTO) => {
    return apiClient.post<{ success: boolean; message: string }>('/admin/levels', data)
  },

  updateLevel: async (id: string, data: UpdateLevelDTO) => {
    return apiClient.patch<{ success: boolean; message: string }>(`/admin/levels/${id}`, data)
  },

  deleteLevel: async (id: string) => {
    return apiClient.delete<{ success: boolean; message: string }>(`/admin/levels/${id}`)
  },
}
