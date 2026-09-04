import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { rolesPermissionsService } from '../_services/rolesPermissions.service'
import type {
  CreateRoleDTO,
  UpdateRoleDTO,
  CreatePermissionDTO,
  UpdatePermissionDTO,
  RolePermissionStatus,
} from '../_types/rolesPermissions.types'
import { toast } from 'sonner'

export function useRolesQuery(page: number, limit: number, search: string) {
  return useQuery({
    queryKey: ['roles', page, limit, search],
    queryFn: () => rolesPermissionsService.listRoles(page, limit, search),
    placeholderData: keepPreviousData,
  })
}

export function useCreateRoleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateRoleDTO) => rolesPermissionsService.createRole(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Role created successfully')
        queryClient.invalidateQueries({ queryKey: ['roles'] })
      }
    },
    onError: (error: Error | { message?: string }) => {
      toast.error(error?.message || 'Failed to create role')
    },
  })
}

export function useUpdateRoleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleDTO }) =>
      rolesPermissionsService.updateRole(id, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Role updated successfully')
        queryClient.invalidateQueries({ queryKey: ['roles'] })
      }
    },
    onError: (error: Error | { message?: string }) => {
      toast.error(error?.message || 'Failed to update role')
    },
  })
}

export function useDeleteRoleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rolesPermissionsService.deleteRole(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Role deleted successfully')
        queryClient.invalidateQueries({ queryKey: ['roles'] })
      }
    },
    onError: (error: Error | { message?: string }) => {
      toast.error(error?.message || 'Failed to delete role')
    },
  })
}

export function usePermissionsQuery(page: number, limit: number, search: string, enabled = true) {
  return useQuery({
    queryKey: ['permissions', page, limit, search],
    queryFn: () => rolesPermissionsService.listPermissions(page, limit, search),
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function useCreatePermissionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePermissionDTO[]) => rolesPermissionsService.createPermissions(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Permission(s) created successfully')
        queryClient.invalidateQueries({ queryKey: ['permissions'] })
      }
    },
    onError: (error: Error | { message?: string }) => {
      toast.error(error?.message || 'Failed to create permission')
    },
  })
}

export function useUpdatePermissionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePermissionDTO }) =>
      rolesPermissionsService.updatePermission(id, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Permission updated successfully')
        queryClient.invalidateQueries({ queryKey: ['permissions'] })
      }
    },
    onError: (error: Error | { message?: string }) => {
      toast.error(error?.message || 'Failed to update permission')
    },
  })
}

export function useDeletePermissionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rolesPermissionsService.deletePermission(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Permission deleted successfully')
        queryClient.invalidateQueries({ queryKey: ['permissions'] })
      }
    },
    onError: (error: Error | { message?: string }) => {
      toast.error(error?.message || 'Failed to delete permission')
    },
  })
}

export function useRolePermissionsQuery(roleId: string, enabled = false) {
  return useQuery({
    queryKey: ['role-permissions', roleId],
    queryFn: () => rolesPermissionsService.getRolePermissions(roleId),
    enabled: enabled && !!roleId,
  })
}

export function useUpdateRolePermissionsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ roleId, permissions }: { roleId: string; permissions: RolePermissionStatus[] }) =>
      rolesPermissionsService.updateRolePermissions(roleId, permissions),
    onSuccess: (res, variables) => {
      if (res.success) {
        toast.success('Role permissions updated successfully')
        queryClient.invalidateQueries({ queryKey: ['role-permissions', variables.roleId] })
      }
    },
    onError: (error: Error | { message?: string }) => {
      toast.error(error?.message || 'Failed to update role permissions')
    },
  })
}
