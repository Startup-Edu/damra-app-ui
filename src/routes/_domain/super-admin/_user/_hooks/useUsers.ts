import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { superAdminUserService } from '../_services/users.service'
import type { CreateUserDTO, UpdateUserDTO } from '../_types/users.types'
import { toast } from 'sonner'

export function useUsersQuery(page: number, limit: number, search: string) {
  return useQuery({
    queryKey: ['users', page, limit, search],
    queryFn: () => superAdminUserService.listUsers(page, limit, search),
  })
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateUserDTO) => superAdminUserService.createUser(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('User created successfully')
        queryClient.invalidateQueries({ queryKey: ['users'] })
      }
    },
    onError: (error: Error | { message?: string }) => {
      toast.error(error?.message || 'Failed to create user')
    },
  })
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDTO }) =>
      superAdminUserService.updateUser(id, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('User updated successfully')
        queryClient.invalidateQueries({ queryKey: ['users'] })
      }
    },
    onError: (error: Error | { message?: string }) => {
      toast.error(error?.message || 'Failed to update user')
    },
  })
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => superAdminUserService.deleteUser(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('User deleted successfully')
        queryClient.invalidateQueries({ queryKey: ['users'] })
      }
    },
    onError: (error: Error | { message?: string }) => {
      toast.error(error?.message || 'Failed to delete user')
    },
  })
}

export function useRolesDropdownQuery(enabled = false) {
  return useQuery({
    queryKey: ['roles-dropdown'],
    queryFn: () => superAdminUserService.listRolesDropdown(),
    enabled,
  })
}
