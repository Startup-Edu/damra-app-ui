export type StudentVerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface StudentVerificationUser {
  id?: string
  email?: string
  name?: string
}

export interface StudentVerificationGrade {
  id?: string
  name_en?: string
  name_kh?: string
}

export interface StudentVerificationItem {
  id: string
  full_name: string
  status: StudentVerificationStatus
  student_id_card_url: string
  reject_reason: string | null
  created_at: string
  updated_at?: string
  user?: StudentVerificationUser
  grade?: StudentVerificationGrade
}

export interface ListVerificationsResponse {
  success: boolean
  code: number
  message: string
  message_kh?: string
  page_number: number
  page_size: number
  total_elements: number
  total_pages: number
  first: boolean
  last: boolean
  empty: boolean
  data: StudentVerificationItem[]
}

export interface VerificationStats {
  total: number
  pending: number
  approved: number
  rejected: number
}

export interface VerificationStatsResponse {
  success: boolean
  code: number
  message: string
  data: VerificationStats
}

export interface RejectVerificationDTO {
  rejectReason: string
}

export interface ListVerificationsFilterParams {
  page?: number
  limit?: number
  status?: string
  search?: string
  gradeId?: string
  startDate?: string
  endDate?: string
}

