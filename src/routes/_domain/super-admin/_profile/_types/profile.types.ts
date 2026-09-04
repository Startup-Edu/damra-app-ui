export interface AdminProfile {
  id: string
  name: string
  email: string
  created_at: string
}

export interface UpdateProfileDTO {
  name: string
  email: string
}

export interface ChangePasswordDTO {
  password: string
  confirmedPassword: string
}
