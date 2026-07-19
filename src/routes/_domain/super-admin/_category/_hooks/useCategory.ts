import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { superAdminCategoryService } from '../_services/category.service'
import type { CreateCategoryDTO, UpdateCategoryDTO } from '../_types/category.types'
import { toast } from 'sonner'

export function useCategoriesQuery(page: number, limit: number, search: string, rootOnly = false) {
  return useQuery({
    queryKey: ['categories', page, limit, search, rootOnly],
    queryFn: () => superAdminCategoryService.listCategories(page, limit, search, rootOnly),
  })
}

export function useRootCategoriesQuery(enabled = true) {
  return useQuery({
    queryKey: ['categories', 'root-only'],
    queryFn: () => superAdminCategoryService.listCategories(1, 100, '', true),
    enabled,
  })
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCategoryDTO) => superAdminCategoryService.createCategory(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Category created successfully')
        queryClient.invalidateQueries({ queryKey: ['categories'] })
      }
    },
    onError: (error: Error | { message?: string }) => {
      toast.error(error?.message || 'Failed to create category')
    },
  })
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDTO }) =>
      superAdminCategoryService.updateCategory(id, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Category updated successfully')
        queryClient.invalidateQueries({ queryKey: ['categories'] })
      }
    },
    onError: (error: Error | { message?: string }) => {
      toast.error(error?.message || 'Failed to update category')
    },
  })
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => superAdminCategoryService.deleteCategory(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Category deleted successfully')
        queryClient.invalidateQueries({ queryKey: ['categories'] })
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete category')
    },
  })
}
