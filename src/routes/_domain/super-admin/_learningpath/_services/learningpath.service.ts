import { apiClient } from '@/api/client'
import type {
  ListLearningPathsResponse,
  CreateLearningPathDTO,
  UpdateLearningPathDTO,
  LearningPathItem,
  CreateNodeDTO,
  UpdateNodeDTO,
} from '../_types/learningpath.types'

export const superAdminLearningPathService = {
  listLearningPaths: async (page = 1, limit = 10, search = '', categoryId?: string, gradeId?: string) => {
    const params: Record<string, string> = {
      page: String(page),
      limit: String(limit),
      search,
    }
    if (categoryId) params.categoryId = categoryId
    if (gradeId) params.gradeId = gradeId
    return apiClient.get<ListLearningPathsResponse>('/admin/learning-paths', { params })
  },

  getLearningPath: async (id: string) => {
    return apiClient.get<{ success: boolean; data: LearningPathItem }>(`/admin/learning-paths/${id}`)
  },

  createLearningPath: async (data: CreateLearningPathDTO) => {
    return apiClient.post<{ success: boolean; message: string }>('/admin/learning-paths', data)
  },

  updateLearningPath: async (id: string, data: UpdateLearningPathDTO) => {
    return apiClient.patch<{ success: boolean; message: string }>(`/admin/learning-paths/${id}`, data)
  },

  deleteLearningPath: async (id: string) => {
    return apiClient.delete<{ success: boolean; message: string }>(`/admin/learning-paths/${id}`)
  },

  createNode: async (pathId: string, data: CreateNodeDTO) => {
    return apiClient.post<{ success: boolean; message: string }>(`/admin/learning-paths/${pathId}/nodes`, data)
  },

  updateNode: async (nodeId: string, data: UpdateNodeDTO) => {
    return apiClient.patch<{ success: boolean; message: string }>(`/admin/learning-paths/nodes/${nodeId}`, data)
  },

  deleteNode: async (nodeId: string) => {
    return apiClient.delete<{ success: boolean; message: string }>(`/admin/learning-paths/nodes/${nodeId}`)
  },

  syncNodeQuestions: async (nodeId: string, questionIds: string[]) => {
    return apiClient.post<{ success: boolean; message: string }>(`/admin/learning-paths/nodes/${nodeId}/questions`, { questionIds })
  },
}
