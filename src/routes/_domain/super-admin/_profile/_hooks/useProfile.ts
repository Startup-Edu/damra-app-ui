import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import type { AdminProfile, UpdateProfileDTO, ChangePasswordDTO } from '../_types/profile.types'
import { toast } from 'sonner'

export function useProfileQuery() {
  return useQuery({
    queryKey: ['admin-profile'],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: AdminProfile }>('/admin/profile')
      return res.data
    },
  })
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateProfileDTO) => apiClient.patch<{ success: boolean; message: string }>('/admin/profile', data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Profile updated successfully')
        queryClient.invalidateQueries({ queryKey: ['admin-profile'] })
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update profile')
    },
  })
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (data: ChangePasswordDTO) => apiClient.post<{ success: boolean; message: string }>('/admin/profile/change-password', data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Password changed successfully')
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to change password')
    },
  })
}
