import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { superAdminCategoryService } from '../_services/category.service'
import type { CreateCategoryDTO, UpdateCategoryDTO } from '../_types/category.types'
import { toast } from 'sonner'

export function useCategoriesQuery(page: number, limit: number, search: string, isActive?: boolean) {
  return useQuery({
    queryKey: ['categories', page, limit, search, isActive],
    queryFn: () => superAdminCategoryService.listCategories(page, limit, search, isActive),
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
        queryClient.invalidateQueries({ queryKey: ['categories-dropdown'] })
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
        queryClient.invalidateQueries({ queryKey: ['categories-dropdown'] })
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
        queryClient.invalidateQueries({ queryKey: ['categories-dropdown'] })
      }
    },
    onError: (error: any) => {
      // If error contains specific backend details, use them
      const errMsg = error?.message || 'Failed to delete category'
      toast.error(errMsg)
    },
  })
}

export function useRootCategoriesQuery(enabled = false) {
  return useQuery({
    queryKey: ['categories-dropdown'],
    queryFn: async () => {
      // Fetch active categories (limit 100 to get them all)
      const res = await superAdminCategoryService.listCategories(1, 100, '', true)
      // Filter client-side: only return categories where parent_id is null/empty
      return {
        ...res,
        data: res.data?.filter((c) => !c.parent_id) || [],
      }
    },
    enabled,
  })
}
