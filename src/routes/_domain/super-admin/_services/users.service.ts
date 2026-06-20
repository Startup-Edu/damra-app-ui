import { apiClient } from '@/api/client'
import type {
  ListUsersResponse,
  CreateUserDTO,
  UpdateUserDTO,
  ListRolesDropdownResponse,
} from '../_types/users.types'

export const superAdminUsersService = {
  listUsers: async (page = 1, limit = 10, search = '') => {
    return apiClient.get<ListUsersResponse>('/users', {
      params: {
        page: String(page),
        limit: String(limit),
        search,
      },
    })
  },

  createUser: async (data: CreateUserDTO) => {
    return apiClient.post<{ success: boolean; message: string }>('/users', data)
  },

  updateUser: async (id: string, data: UpdateUserDTO) => {
    return apiClient.patch<{ success: boolean; message: string }>(`/users/${id}`, data)
  },

  deleteUser: async (id: string) => {
    return apiClient.delete<{ success: boolean }>(`/users/${id}`)
  },

  listRolesDropdown: async () => {
    // dropdownList has its own validation schema but we pass default pagination params to satisfy
    return apiClient.get<ListRolesDropdownResponse>('/roles/dropdownList', {
      params: {
        page: '1',
        limit: '100', // ensure we fetch all active roles
      },
    })
  },
}
