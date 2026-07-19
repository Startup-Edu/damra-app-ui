export interface RolePermissionItem {
  id: string
  name: string
  resource: string
  action: string
  description: string | null
}

export interface RoleItem {
  id: string
  name: string
  description: string | null
  default_data: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  is_deleted: boolean
  permissions?: RolePermissionItem[]
}

export interface PermissionItem {
  id: string
  name: string
  resource: string
  action: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  is_deleted: boolean
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

export interface CreateRoleDTO {
  name: string
  description?: string | null
  isActive?: boolean
}

export interface UpdateRoleDTO {
  name?: string
  description?: string | null
  isActive?: boolean
}

export interface CreatePermissionDTO {
  name: string
  resource: string
  action: string
  description?: string | null
  isActive?: boolean
}

export interface UpdatePermissionDTO {
  name?: string
  resource?: string
  action?: string
  description?: string | null
  isActive?: boolean
}

export interface RolePermissionStatus {
  permissionId: string
  isAssigned: boolean
}

export interface GetRolePermissionsResponse {
  success: boolean
  data: {
    roleId: string
    roleName: string
    permissions: Array<{
      id: string
      name: string
      resource: string
      action: string
      description: string | null
      is_assigned: boolean
    }>
  }
}
