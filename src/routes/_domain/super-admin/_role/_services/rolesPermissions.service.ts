import { apiClient } from '@/api/client'
import type {
  ListRolesResponse,
  ListPermissionsResponse,
  CreateRoleDTO,
  UpdateRoleDTO,
  CreatePermissionDTO,
  UpdatePermissionDTO,
  RoleItem,
  GetRolePermissionsResponse,
  RolePermissionStatus,
} from '../_types/rolesPermissions.types'

export const rolesPermissionsService = {
  listRoles: async (page = 1, limit = 10, search = '') => {
    return apiClient.get<ListRolesResponse>('/admin/roles', {
      params: { page: String(page), limit: String(limit), search },
    })
  },

  getRole: async (id: string) => {
    return apiClient.get<{ success: boolean; data: RoleItem }>(`/admin/roles/${id}`)
  },

  createRole: async (data: CreateRoleDTO) => {
    return apiClient.post<{ success: boolean; message: string }>('/admin/roles', data)
  },

  updateRole: async (id: string, data: UpdateRoleDTO) => {
    return apiClient.patch<{ success: boolean; message: string }>(`/admin/roles/${id}`, data)
  },

  deleteRole: async (id: string) => {
    return apiClient.delete<{ success: boolean; message: string }>(`/admin/roles/${id}`)
  },

  listPermissions: async (page = 1, limit = 10, search = '') => {
    return apiClient.get<ListPermissionsResponse>('/admin/permissions', {
      params: { page: String(page), limit: String(limit), search },
    })
  },

  createPermissions: async (data: CreatePermissionDTO[]) => {
    return apiClient.post<{ success: boolean; message: string }>('/admin/permissions', data)
  },

  updatePermission: async (id: string, data: UpdatePermissionDTO) => {
    return apiClient.patch<{ success: boolean; message: string }>(`/admin/permissions/${id}`, data)
  },

  deletePermission: async (id: string) => {
    return apiClient.delete<{ success: boolean; message: string }>(`/admin/permissions/${id}`)
  },

  getRolePermissions: async (roleId: string) => {
    return apiClient.get<GetRolePermissionsResponse>(`/admin/permissions/role/${roleId}`)
  },

  updateRolePermissions: async (roleId: string, permissions: RolePermissionStatus[]) => {
    return apiClient.patch<{ success: boolean; message: string }>('/admin/permissions/role/update', { roleId, permissions })
  },
}
