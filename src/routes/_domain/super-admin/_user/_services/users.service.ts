import { apiClient } from '@/api/client'
import type {
  ListUsersResponse,
  CreateUserDTO,
  UpdateUserDTO,
  UserItem,
} from '../_types/users.types'

export const superAdminUserService = {
  listUsers: async (page = 1, limit = 10, search = '') => {
    return apiClient.get<ListUsersResponse>('/admin/users', {
      params: { page: String(page), limit: String(limit), search },
    })
  },

  getUser: async (id: string) => {
    return apiClient.get<{ success: boolean; data: UserItem }>(`/admin/users/${id}`)
  },

  createUser: async (data: CreateUserDTO) => {
    return apiClient.post<{ success: boolean; message: string }>('/admin/users', data)
  },

  updateUser: async (id: string, data: UpdateUserDTO) => {
    return apiClient.patch<{ success: boolean; message: string }>(`/admin/users/${id}`, data)
  },

  deleteUser: async (id: string) => {
    return apiClient.delete<{ success: boolean; message: string }>(`/admin/users/${id}`)
  },

  listRolesDropdown: async () => {
    return apiClient.get<{ success: boolean; data: { id: string; name: string }[] }>('/admin/roles/dropdownList')
  },
}
export const superAdminUsersService = superAdminUserService
