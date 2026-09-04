import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { superAdminQuizPackageService } from '../_services/quizpack.service'
import type {
  CreateQuizPackageDTO,
  UpdateQuizPackageDTO,
  SyncQuizPackageQuestionsDTO,
} from '../_types/quizpack.types'
import { toast } from 'sonner'

export function useQuizPackagesQuery(
  page: number,
  limit: number,
  search: string,
  categoryId?: string,
  enabled = true
) {
  return useQuery({
    queryKey: ['quiz-packages', page, limit, search, categoryId],
    queryFn: () => superAdminQuizPackageService.listQuizPackages(page, limit, search, categoryId),
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function useQuizPackageQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: ['quiz-package', id],
    queryFn: () => superAdminQuizPackageService.getQuizPackage(id),
    enabled: enabled && !!id,
  })
}

export function useCreateQuizPackageMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateQuizPackageDTO) => superAdminQuizPackageService.createQuizPackage(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Quiz package created successfully')
        queryClient.invalidateQueries({ queryKey: ['quiz-packages'] })
      }
    },
    onError: (error: Error | { message?: string }) => {
      toast.error(error?.message || 'Failed to create quiz package')
    },
  })
}

export function useUpdateQuizPackageMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuizPackageDTO }) =>
      superAdminQuizPackageService.updateQuizPackage(id, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Quiz package updated successfully')
        queryClient.invalidateQueries({ queryKey: ['quiz-packages'] })
      }
    },
    onError: (error: Error | { message?: string }) => {
      toast.error(error?.message || 'Failed to update quiz package')
    },
  })
}

export function useDeleteQuizPackageMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => superAdminQuizPackageService.deleteQuizPackage(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Quiz package deleted successfully')
        queryClient.invalidateQueries({ queryKey: ['quiz-packages'] })
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete quiz package')
    },
  })
}

export function useSyncQuizPackageQuestionsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SyncQuizPackageQuestionsDTO }) =>
      superAdminQuizPackageService.syncQuizPackageQuestions(id, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Questions updated successfully')
        queryClient.invalidateQueries({ queryKey: ['quiz-packages'] })
        queryClient.invalidateQueries({ queryKey: ['quiz-package'] })
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update questions')
    },
  })
}
