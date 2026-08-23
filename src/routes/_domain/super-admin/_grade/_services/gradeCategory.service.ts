import { apiClient } from '@/api/client'
import type { CategoryItem } from '../../_category/_types/category.types'

export const superAdminGradeCategoryService = {
  getGradeCategories: async (gradeId: string) => {
    return apiClient.get<{ success: boolean; data: CategoryItem[] }>(`/admin/grade-categories/grade/${gradeId}`)
  },

  syncGradeCategories: async (gradeId: string, categoryIds: string[]) => {
    return apiClient.post<{ success: boolean; message: string }>(`/admin/grade-categories/grade/${gradeId}/sync`, { categoryIds })
  },
}
