import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  superAdminStudentVerificationService,
  type ListVerificationsParams,
} from '../_services/studentVerification.service'
import type { RejectVerificationDTO } from '../_types/studentVerification.types'
import { toast } from 'sonner'

export function useStudentVerificationsQuery(params: ListVerificationsParams) {
  return useQuery({
    queryKey: ['admin', 'student-verifications', params],
    queryFn: () => superAdminStudentVerificationService.listVerifications(params),
    staleTime: 15 * 1000,
  })
}

export function useStudentVerificationStatsQuery() {
  return useQuery({
    queryKey: ['admin', 'student-verifications', 'stats'],
    queryFn: () => superAdminStudentVerificationService.getStats(),
    staleTime: 15 * 1000,
  })
}

export function useApproveVerificationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => superAdminStudentVerificationService.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'student-verifications'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'stats'] })
      toast.success('Student verification approved successfully!')
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.message || 'Failed to approve verification'
      toast.error(message)
    },
  })
}

export function useRejectVerificationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectVerificationDTO }) =>
      superAdminStudentVerificationService.reject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'student-verifications'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'stats'] })
      toast.success('Student verification rejected successfully')
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.message || 'Failed to reject verification'
      toast.error(message)
    },
  })
}
