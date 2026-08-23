import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { superAdminQuestionTypeService } from '../_services/questiontype.service'
import type {
  CreateQuestionTypeDTO,
  UpdateQuestionTypeDTO,
} from '../_types/questiontype.types'
import { toast } from 'sonner'

export function useQuestionTypesQuery(page: number, limit: number, search: string) {
  return useQuery({
    queryKey: ['question-types', page, limit, search],
    queryFn: () => superAdminQuestionTypeService.listQuestionTypes(page, limit, search),
  })
}

export function useCreateQuestionTypeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateQuestionTypeDTO) => superAdminQuestionTypeService.createQuestionType(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Question type created successfully')
        queryClient.invalidateQueries({ queryKey: ['question-types'] })
      }
    },
    onError: (error: Error | { message?: string }) => {
      toast.error(error?.message || 'Failed to create question type')
    },
  })
}

export function useUpdateQuestionTypeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuestionTypeDTO }) =>
      superAdminQuestionTypeService.updateQuestionType(id, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Question type updated successfully')
        queryClient.invalidateQueries({ queryKey: ['question-types'] })
      }
    },
    onError: (error: Error | { message?: string }) => {
      toast.error(error?.message || 'Failed to update question type')
    },
  })
}

export function useDeleteQuestionTypeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => superAdminQuestionTypeService.deleteQuestionType(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Question type deleted successfully')
        queryClient.invalidateQueries({ queryKey: ['question-types'] })
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete question type')
    },
  })
}
