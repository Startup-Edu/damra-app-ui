export interface EntityStats {
  total: number
  active: number
  inactive: number
}

export interface DashboardStatsData {
  users: EntityStats
  categories: EntityStats
  quiz_packages: EntityStats
  learning_paths: EntityStats
}

export interface DashboardStatsResponse {
  success: boolean
  status_code: number
  message: string
  message_kh?: string
  data: DashboardStatsData
}
