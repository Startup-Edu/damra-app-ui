import { apiClient } from '@/api/client'
import type {
  ListRolesResponse,
  RoleItem,
  CreateRoleDTO,
  UpdateRoleDTO,
  ListPermissionsResponse,
  PermissionItem,
  CreatePermissionDTO,
  UpdatePermissionDTO,
  RolePermissionsResponse,
  RolePermissionStatus,
} from '../_types/rolesPermissions.types'

export const rolesPermissionsService = {
  // Roles API endpoints
  listRoles: async (page = 1, limit = 10, search = '') => {
    return apiClient.get<ListRolesResponse>('/roles', {
      params: {
        page: String(page),
        limit: String(limit),
        search,
      },
    })
  },

  createRole: async (data: CreateRoleDTO) => {
    return apiClient.post<{ success: boolean; data: RoleItem }>('/roles', data)
  },

  updateRole: async (id: string, data: UpdateRoleDTO) => {
    return apiClient.patch<{ success: boolean; data: RoleItem }>(`/roles/${id}`, data)
  },

  deleteRole: async (id: string) => {
    return apiClient.delete<{ success: boolean }>((`/roles/${id}`))
  },

  // Permissions API endpoints
  listPermissions: async (page = 1, limit = 50, search = '') => {
    return apiClient.get<ListPermissionsResponse>('/permissions', {
      params: {
        page: String(page),
        limit: String(limit),
        search,
      },
    })
  },

  createPermissions: async (data: CreatePermissionDTO[]) => {
    return apiClient.post<{ success: boolean; data: PermissionItem[] }>('/permissions', data)
  },

  updatePermission: async (id: string, data: UpdatePermissionDTO) => {
    return apiClient.patch<{ success: boolean; data: PermissionItem }>(`/permissions/${id}`, data)
  },

  deletePermission: async (id: string) => {
    return apiClient.delete<{ success: boolean }>(`/permissions/${id}`)
  },

  // Role Permissions API endpoints
  getRolePermissions: async (roleId: string) => {
    return apiClient.get<RolePermissionsResponse>(`/permissions/role/${roleId}`)
  },

  updateRolePermissions: async (roleId: string, permissions: RolePermissionStatus[]) => {
    return apiClient.patch<{ success: boolean }>('/permissions/role/update', {
      roleId,
      permissions,
    })
  },
}
