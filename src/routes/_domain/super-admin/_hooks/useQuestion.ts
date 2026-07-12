import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { superAdminQuestionService } from '../_services/question.service'
import type { CreateQuestionDTO, UpdateQuestionDTO } from '../_types/question.types'
import { toast } from 'sonner'

export function useQuestionsQuery(
  page: number,
  limit: number,
  search: string,
  categoryId?: string,
  levelId?: string,
  questionType?: string,
  difficulty?: string
) {
  return useQuery({
    queryKey: ['questions', page, limit, search, categoryId, levelId, questionType, difficulty],
    queryFn: () =>
      superAdminQuestionService.listQuestions(
        page,
        limit,
        search,
        categoryId,
        levelId,
        questionType,
        difficulty
      ),
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
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Question updated successfully')
        queryClient.invalidateQueries({ queryKey: ['questions'] })
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

export function useQuestionQuery(id: string, enabled = false) {
  return useQuery({
    queryKey: ['question', id],
    queryFn: () => superAdminQuestionService.getQuestion(id),
    enabled: enabled && !!id,
  })
}

