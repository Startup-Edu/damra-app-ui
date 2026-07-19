import { apiClient } from '@/api/client'
import type {
  ListQuizPackagesResponse,
  CreateQuizPackageDTO,
  UpdateQuizPackageDTO,
  QuizPackageItem,
  SyncQuizPackageQuestionsDTO,
} from '../_types/quizpack.types'

export const superAdminQuizPackageService = {
  listQuizPackages: async (
    page = 1,
    limit = 10,
    search = '',
    categoryId?: string
  ) => {
    const params: Record<string, string> = {
      page: String(page),
      limit: String(limit),
      search,
    }
    if (categoryId) params.categoryId = categoryId

    return apiClient.get<ListQuizPackagesResponse>('/admin/quiz-packages', { params })
  },

  getQuizPackage: async (id: string) => {
    return apiClient.get<{ success: boolean; data: QuizPackageItem }>(`/admin/quiz-packages/${id}`)
  },

  createQuizPackage: async (data: CreateQuizPackageDTO) => {
    return apiClient.post<{ success: boolean; message: string }>('/admin/quiz-packages', data)
  },

  updateQuizPackage: async (id: string, data: UpdateQuizPackageDTO) => {
    return apiClient.patch<{ success: boolean; message: string }>(`/admin/quiz-packages/${id}`, data)
  },

  deleteQuizPackage: async (id: string) => {
    return apiClient.delete<{ success: boolean; message: string }>(`/admin/quiz-packages/${id}`)
  },

  syncQuizPackageQuestions: async (id: string, data: SyncQuizPackageQuestionsDTO) => {
    return apiClient.post<{ success: boolean; message: string; data: QuizPackageItem }>(
      `/admin/quiz-packages/${id}/questions`,
      data
    )
  },
}
