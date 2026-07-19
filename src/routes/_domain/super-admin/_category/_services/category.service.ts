import { apiClient } from '@/api/client'
import type {
  ListCategoriesResponse,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  CategoryItem,
} from '../_types/category.types'

export const superAdminCategoryService = {
  listCategories: async (page = 1, limit = 10, search = '', rootOnly = false) => {
    const params: Record<string, string> = {
      page: String(page),
      limit: String(limit),
      search,
    }
    if (rootOnly) params.rootOnly = 'true'
    return apiClient.get<ListCategoriesResponse>('/admin/categories', { params })
  },

  getCategory: async (id: string) => {
    return apiClient.get<{ success: boolean; data: CategoryItem }>(`/admin/categories/${id}`)
  },

  createCategory: async (data: CreateCategoryDTO) => {
    return apiClient.post<{ success: boolean; message: string }>('/admin/categories', data)
  },

  updateCategory: async (id: string, data: UpdateCategoryDTO) => {
    return apiClient.patch<{ success: boolean; message: string }>(`/admin/categories/${id}`, data)
  },

  deleteCategory: async (id: string) => {
    return apiClient.delete<{ success: boolean; message: string }>(`/admin/categories/${id}`)
  },
}
