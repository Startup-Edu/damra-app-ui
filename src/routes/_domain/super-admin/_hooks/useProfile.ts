import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/useAuthStore'
import { toast } from 'sonner'
import type { UpdateProfilePayload, ChangePasswordPayload } from '../_types/profile.types'

export function useUpdateProfileMutation() {
  const user = useAuthStore((state) => state.user)
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      return authApi.updateProfile(payload)
    },
    onSuccess: (result: { success: boolean; message: string; message_kh: string; data: { name: string; email: string } }) => {
      toast.success(result.message || 'Profile updated successfully', {
        description: result.message_kh || 'ប្រតិបត្តិការត្រូវបានបញ្ចប់ដោយជោគជ័យ។',
      })

      // Sync store
      if (user) {
        setAuth({
          ...user,
          name: result.data.name,
          email: result.data.email,
        })
      }
    },
    onError: (error: Error | { message?: string }) => {
      toast.error('Update Failed', {
        description: error.message || 'Could not update profile details',
      })
    },
  })
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      return authApi.updateProfile(payload)
    },
    onSuccess: (result: { success: boolean; message: string; message_kh: string }) => {
      toast.success(result.message || 'Password changed successfully', {
        description: result.message_kh || 'ប្រតិបត្តិការត្រូវបានបញ្ចប់ដោយជោគជ័យ។',
      })
    },
    onError: (error: Error | { message?: string }) => {
      toast.error('Change Password Failed', {
        description: error.message || 'Could not update password',
      })
    },
  })
}
