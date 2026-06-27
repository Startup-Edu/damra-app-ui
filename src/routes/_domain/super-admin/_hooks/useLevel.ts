import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { superAdminLevelService } from '../_services/level.service'
import type { CreateLevelDTO, UpdateLevelDTO } from '../_types/level.types'
import { toast } from 'sonner'

export function useLevelsQuery(page: number, limit: number, search: string, categoryId?: string, gradeId?: string) {
  return useQuery({
    queryKey: ['levels', page, limit, search, categoryId, gradeId],
    queryFn: () => superAdminLevelService.listLevels(page, limit, search, categoryId, gradeId),
  })
}

export function useCreateLevelMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateLevelDTO) => superAdminLevelService.createLevel(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Level created successfully')
        queryClient.invalidateQueries({ queryKey: ['levels'] })
      }
    },
    onError: (error: Error | { message?: string }) => {
      toast.error(error?.message || 'Failed to create level')
    },
  })
}

export function useUpdateLevelMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLevelDTO }) =>
      superAdminLevelService.updateLevel(id, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Level updated successfully')
        queryClient.invalidateQueries({ queryKey: ['levels'] })
      }
    },
    onError: (error: Error | { message?: string }) => {
      toast.error(error?.message || 'Failed to update level')
    },
  })
}

export function useDeleteLevelMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => superAdminLevelService.deleteLevel(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Level deleted successfully')
        queryClient.invalidateQueries({ queryKey: ['levels'] })
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete level')
    },
  })
}
