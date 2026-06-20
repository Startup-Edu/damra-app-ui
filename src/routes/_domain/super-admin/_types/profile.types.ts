export interface UpdateProfilePayload {
  name: string
  email: string
}

export interface ChangePasswordPayload {
  password: string
  confirmedPassword: string
}
