import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { superAdminQuestionService } from '../_services/question.service'
import type {
  CreateQuestionDTO,
  UpdateQuestionDTO,
  BulkImportQuestionsDTO,
} from '../_types/question.types'
import { toast } from 'sonner'

export function useQuestionsQuery(
  page: number,
  limit: number,
  search: string,
  categoryId?: string,
  gradeId?: string,
  questionType?: string,
  difficulty?: string
) {
  return useQuery({
    queryKey: ['questions', page, limit, search, categoryId, gradeId, questionType, difficulty],
    queryFn: () => superAdminQuestionService.listQuestions(page, limit, search, categoryId, gradeId, questionType, difficulty),
  })
}

export function useQuestionQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: ['question', id],
    queryFn: () => superAdminQuestionService.getQuestion(id),
    enabled: enabled && !!id,
  })
}

export function useCreateQuestionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateQuestionDTO) => superAdminQuestionService.createQuestion(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Question created successfully')
        queryClient.invalidateQueries({ queryKey: ['questions'] })
      }
    },
    onError: (error: Error | { message?: string }) => {
      toast.error(error?.message || 'Failed to create question')
    },
  })
}

export function useUpdateQuestionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuestionDTO }) =>
      superAdminQuestionService.updateQuestion(id, data),
    onSuccess: (res, variables) => {
      if (res.success) {
        toast.success('Question updated successfully')
        queryClient.invalidateQueries({ queryKey: ['questions'] })
        queryClient.invalidateQueries({ queryKey: ['question', variables.id] })
      }
    },
    onError: (error: Error | { message?: string }) => {
      toast.error(error?.message || 'Failed to update question')
    },
  })
}

export function useDeleteQuestionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => superAdminQuestionService.deleteQuestion(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Question deleted successfully')
        queryClient.invalidateQueries({ queryKey: ['questions'] })
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete question')
    },
  })
}

export function useImportQuestionsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BulkImportQuestionsDTO) => superAdminQuestionService.bulkImportQuestions(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || 'Questions imported successfully')
        queryClient.invalidateQueries({ queryKey: ['questions'] })
      }
    },
    onError: (error: Error | { message?: string }) => {
      toast.error(error?.message || 'Failed to import questions')
    },
  })
}
