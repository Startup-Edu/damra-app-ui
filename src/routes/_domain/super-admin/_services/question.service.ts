import { apiClient } from '@/api/client'
import type {
  ListQuestionsResponse,
  CreateQuestionDTO,
  UpdateQuestionDTO,
  QuestionItem,
} from '../_types/question.types'

export const superAdminQuestionService = {
  listQuestions: async (
    page = 1,
    limit = 10,
    search = '',
    categoryId?: string,
    levelId?: string,
    questionType?: string,
    difficulty?: string
  ) => {
    const params: Record<string, string> = {
      page: String(page),
      limit: String(limit),
      search,
    }
    if (categoryId) params.categoryId = categoryId
    if (levelId) params.levelId = levelId
    if (questionType) params.questionType = questionType
    if (difficulty) params.difficulty = difficulty
    return apiClient.get<ListQuestionsResponse>('/admin/questions', { params })
  },

  getQuestion: async (id: string) => {
    return apiClient.get<{ success: boolean; data: QuestionItem }>(`/admin/questions/${id}`)
  },

  createQuestion: async (data: CreateQuestionDTO) => {
    return apiClient.post<{ success: boolean; message: string }>('/admin/questions', data)
  },

  updateQuestion: async (id: string, data: UpdateQuestionDTO) => {
    return apiClient.patch<{ success: boolean; message: string }>(`/admin/questions/${id}`, data)
  },

  deleteQuestion: async (id: string) => {
    return apiClient.delete<{ success: boolean; message: string }>(`/admin/questions/${id}`)
  },
}
