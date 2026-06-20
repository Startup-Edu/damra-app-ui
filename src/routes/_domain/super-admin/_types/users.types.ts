export interface UserRole {
  id: string
  name: string
}

export interface UserItem {
  id: string
  email: string
  name: string
  roles: UserRole[]
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

export interface CreateUserDTO {
  email: string
  name?: string
  password?: string
  roleId: string
  isActive?: boolean
}

export interface UpdateUserDTO {
  email: string
  name?: string
  roleId: string
  isActive?: boolean
  resetPassword?: boolean
  avatarBase64?: string
}

export interface RoleDropdownItem {
  id: string
  name: string
}

export interface ListRolesDropdownResponse {
  success: boolean
  status_code: number
  message: string
  message_kh: string
  data: RoleDropdownItem[]
  page_number: number
  page_size: number
  total_elements: number
  total_pages: number
  first: boolean
  last: boolean
  empty: boolean
}
