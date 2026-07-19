import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { superAdminGradeCategoryService } from '../_services/gradeCategory.service'
import { toast } from 'sonner'

export function useGradeCategoriesQuery(gradeId: string, enabled = true) {
  return useQuery({
    queryKey: ['grade-categories', gradeId],
    queryFn: () => superAdminGradeCategoryService.getGradeCategories(gradeId),
    enabled: enabled && !!gradeId,
  })
}

export function useSyncGradeCategoriesMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ gradeId, categoryIds }: { gradeId: string; categoryIds: string[] }) =>
      superAdminGradeCategoryService.syncGradeCategories(gradeId, categoryIds),
    onSuccess: (res, variables) => {
      if (res.success) {
        toast.success('Grade categories mapping updated successfully')
        queryClient.invalidateQueries({ queryKey: ['grade-categories', variables.gradeId] })
      }
    },
    onError: (error: Error | { message?: string }) => {
      toast.error(error?.message || 'Failed to update grade categories mapping')
    },
  })
}
