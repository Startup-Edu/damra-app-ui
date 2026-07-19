import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { superAdminLearningPathService } from '../_services/learningpath.service'
import type {
  CreateLearningPathDTO,
  UpdateLearningPathDTO,
  CreateNodeDTO,
  UpdateNodeDTO,
} from '../_types/learningpath.types'
import { toast } from 'sonner'

export function useLearningPathsQuery(page: number, limit: number, search: string, categoryId?: string, gradeId?: string) {
  return useQuery({
    queryKey: ['learning-paths', page, limit, search, categoryId, gradeId],
    queryFn: () => superAdminLearningPathService.listLearningPaths(page, limit, search, categoryId, gradeId),
  })
}

export function useLearningPathQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: ['learning-path', id],
    queryFn: () => superAdminLearningPathService.getLearningPath(id),
    enabled: enabled && !!id,
  })
}

export function useCreateLearningPathMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateLearningPathDTO) => superAdminLearningPathService.createLearningPath(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Learning path created successfully')
        queryClient.invalidateQueries({ queryKey: ['learning-paths'] })
      }
    },
    onError: (error: Error | { message?: string }) => {
      toast.error(error?.message || 'Failed to create learning path')
    },
  })
}

export function useUpdateLearningPathMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLearningPathDTO }) =>
      superAdminLearningPathService.updateLearningPath(id, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Learning path updated successfully')
        queryClient.invalidateQueries({ queryKey: ['learning-paths'] })
        queryClient.invalidateQueries({ queryKey: ['learning-path', id] })
      }
    },
    onError: (error: Error | { message?: string }) => {
      toast.error(error?.message || 'Failed to update learning path')
    },
  })
}

export function useDeleteLearningPathMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => superAdminLearningPathService.deleteLearningPath(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Learning path deleted successfully')
        queryClient.invalidateQueries({ queryKey: ['learning-paths'] })
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete learning path')
    },
  })
}

export function useCreateNodeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ pathId, data }: { pathId: string; data: CreateNodeDTO }) =>
      superAdminLearningPathService.createNode(pathId, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Node created successfully')
        queryClient.invalidateQueries({ queryKey: ['learning-path'] })
        queryClient.invalidateQueries({ queryKey: ['learning-paths'] })
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create node')
    },
  })
}

export function useUpdateNodeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ nodeId, data }: { nodeId: string; data: UpdateNodeDTO }) =>
      superAdminLearningPathService.updateNode(nodeId, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Node updated successfully')
        queryClient.invalidateQueries({ queryKey: ['learning-path'] })
        queryClient.invalidateQueries({ queryKey: ['learning-paths'] })
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update node')
    },
  })
}

export function useDeleteNodeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (nodeId: string) => superAdminLearningPathService.deleteNode(nodeId),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Node deleted successfully')
        queryClient.invalidateQueries({ queryKey: ['learning-path'] })
        queryClient.invalidateQueries({ queryKey: ['learning-paths'] })
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete node')
    },
  })
}

export function useSyncNodeQuestionsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ nodeId, questionIds }: { nodeId: string; questionIds: string[] }) =>
      superAdminLearningPathService.syncNodeQuestions(nodeId, questionIds),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Node questions updated successfully')
        queryClient.invalidateQueries({ queryKey: ['learning-path'] })
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to sync node questions')
    },
  })
}

export const useLevelsQuery = useLearningPathsQuery
export const useLevelQuery = useLearningPathQuery
export const useCreateLevelMutation = useCreateLearningPathMutation
export const useUpdateLevelMutation = useUpdateLearningPathMutation
export const useDeleteLevelMutation = useDeleteLearningPathMutation
