export interface UserRoleItem {
  id: string
  name: string
  description: string | null
}

export interface UserItem {
  id: string
  name: string
  email: string
  is_active: boolean
  default_data: boolean
  created_at: string
  updated_at: string
  is_deleted: boolean
  roles: UserRoleItem[]
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

export interface CreateUserDTO {
  name: string
  email: string
  password?: string
  roleIds?: string[]
  isActive?: boolean
}

export interface UpdateUserDTO {
  name?: string
  email?: string
  password?: string
  roleIds?: string[]
  isActive?: boolean
}
