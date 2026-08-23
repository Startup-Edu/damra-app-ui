export interface GradeItem {
  id: string
  name_en: string
  name_kh: string
  grade_number: number
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  is_deleted: boolean
}

export interface ListGradesResponse {
  success: boolean
  status_code: number
  message: string
  message_kh: string
  data: GradeItem[]
  page_number: number
  page_size: number
  total_elements: number
  total_pages: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface CreateGradeDTO {
  nameEn: string
  nameKh: string
  gradeNumber: number
  sortOrder?: number
  isActive?: boolean
}

export interface UpdateGradeDTO {
  nameEn?: string
  nameKh?: string
  gradeNumber?: number
  sortOrder?: number
  isActive?: boolean
}
