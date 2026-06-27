import type { CategoryItem } from './category.types'
import type { GradeItem } from './grade.types'

export interface LevelItem {
  id: string
  title_en: string
  title_kh: string
  sequence: number
  category_id: string
  grade_id: string
  is_active: boolean
  created_at: string
  updated_at: string
  is_deleted: boolean
  category?: CategoryItem
  grade?: GradeItem
}

export interface ListLevelsResponse {
  success: boolean
  status_code: number
  message: string
  message_kh: string
  data: LevelItem[]
  page_number: number
  page_size: number
  total_elements: number
  total_pages: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface CreateLevelDTO {
  titleEn: string
  titleKh: string
  sequence: number
  categoryId: string
  gradeId: string
  isActive?: boolean
}

export interface UpdateLevelDTO {
  titleEn?: string
  titleKh?: string
  sequence?: number
  categoryId?: string
  gradeId?: string
  isActive?: boolean
}
