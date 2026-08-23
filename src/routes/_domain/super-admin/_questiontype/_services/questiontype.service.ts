import { apiClient } from '@/api/client'
import type {
  ListQuestionTypesResponse,
  CreateQuestionTypeDTO,
  UpdateQuestionTypeDTO,
  QuestionTypeConfigItem,
} from '../_types/questiontype.types'

export const superAdminQuestionTypeService = {
  listQuestionTypes: async (page = 1, limit = 10, search = '') => {
    return apiClient.get<ListQuestionTypesResponse>('/admin/question-types', {
      params: { page: String(page), limit: String(limit), search },
    })
  },

  getQuestionType: async (id: string) => {
    return apiClient.get<{ success: boolean; data: QuestionTypeConfigItem }>(`/admin/question-types/${id}`)
  },

  createQuestionType: async (data: CreateQuestionTypeDTO) => {
    return apiClient.post<{ success: boolean; message: string }>('/admin/question-types', data)
  },

  updateQuestionType: async (id: string, data: UpdateQuestionTypeDTO) => {
    return apiClient.patch<{ success: boolean; message: string }>(`/admin/question-types/${id}`, data)
  },

  deleteQuestionType: async (id: string) => {
    return apiClient.delete<{ success: boolean; message: string }>(`/admin/question-types/${id}`)
  },
}
