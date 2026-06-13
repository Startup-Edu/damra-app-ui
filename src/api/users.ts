import { apiClient } from './client'

export interface Role {
  id: string
  name: string
}

export interface UserItem {
  id: string
  email: string
  name: string
  roles: Role[]
  default_data: boolean
  is_active: boolean
}

export interface ListUsersResponse {
  success: boolean
  status_code: number
  message: string
  message_kh: string
  data: UserItem[]
  page_number: number
  page_size: number
  total_elements: number
  total_pages: number
  first: boolean
  last: boolean
  empty: boolean
}

export const usersApi = {
  listUsers: (page = 1, limit = 10, search = '') =>
    apiClient.get<ListUsersResponse>(`/users`, {
      params: {
        page: String(page),
        limit: String(limit),
        search,
      },
    }),
}
