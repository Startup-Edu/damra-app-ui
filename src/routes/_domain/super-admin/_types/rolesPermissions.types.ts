export interface CreatorUser {
  id: string
  name: string
  email: string
}

export interface RoleItem {
  id: string
  name: string
  is_active: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
  user: CreatorUser | null
}

export interface ListRolesResponse {
  success: boolean
  status_code: number
  message: string
  message_kh: string
  data: RoleItem[]
  page_number: number
  page_size: number
  total_elements: number
  total_pages: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface PermissionItem {
  id: string
  name: string
  status: boolean
  action: string
  module: string
  is_deleted: boolean
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

export interface ListPermissionsResponse {
  success: boolean
  status_code: number
  message: string
  message_kh: string
  data: PermissionItem[]
  page_number: number
  page_size: number
  total_elements: number
  total_pages: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface RolePermissionStatus {
  id: string
  name: string
  status: boolean
}

export interface RolePermissionsData {
  id: string
  role_name: string
  permissions: RolePermissionStatus[]
}

export interface RolePermissionsResponse {
  success: boolean
  status_code: number
  message: string
  message_kh: string
  data: RolePermissionsData
}

export interface CreateRoleDTO {
  name: string
  isActive?: boolean
}

export interface UpdateRoleDTO {
  name: string
  isActive?: boolean
}

export interface CreatePermissionDTO {
  action: string
  module: string
}

export interface UpdatePermissionDTO {
  action: string
  module: string
  status?: boolean
}
