export interface EntityStats {
  total: number
  active: number
  inactive: number
}

export interface StudentVerificationStats {
  total: number
  pending: number
  approved: number
  rejected: number
}

export interface DashboardStatsData {
  users: EntityStats
  categories: EntityStats
  quiz_packages: EntityStats
  learning_paths: EntityStats
  student_verifications?: StudentVerificationStats
}

export interface DashboardStatsResponse {
  success: boolean
  status_code: number
  message: string
  message_kh?: string
  data: DashboardStatsData
}

