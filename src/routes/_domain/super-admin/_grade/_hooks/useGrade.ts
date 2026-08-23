import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { superAdminGradeService } from '../_services/grade.service'
import type { CreateGradeDTO, UpdateGradeDTO } from '../_types/grade.types'
import { toast } from 'sonner'

export function useGradesQuery(page: number, limit: number, search: string) {
  return useQuery({
    queryKey: ['grades', page, limit, search],
    queryFn: () => superAdminGradeService.listGrades(page, limit, search),
  })
}

export function useCreateGradeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateGradeDTO) => superAdminGradeService.createGrade(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Grade created successfully')
        queryClient.invalidateQueries({ queryKey: ['grades'] })
      }
    },
    onError: (error: Error | { message?: string }) => {
      toast.error(error?.message || 'Failed to create grade')
    },
  })
}

export function useUpdateGradeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGradeDTO }) =>
      superAdminGradeService.updateGrade(id, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Grade updated successfully')
        queryClient.invalidateQueries({ queryKey: ['grades'] })
      }
    },
    onError: (error: Error | { message?: string }) => {
      toast.error(error?.message || 'Failed to update grade')
    },
  })
}

export function useDeleteGradeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => superAdminGradeService.deleteGrade(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Grade deleted successfully')
        queryClient.invalidateQueries({ queryKey: ['grades'] })
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete grade')
    },
  })
}
