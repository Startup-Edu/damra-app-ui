export interface QuestionTypeConfigItem {
  id: string
  code: string
  name_en: string
  name_kh: string
  description_en: string | null
  description_kh: string | null
  icon_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  is_deleted: boolean
}

export interface ListQuestionTypesResponse {
  success: boolean
  status_code: number
  message: string
  message_kh: string
  data: QuestionTypeConfigItem[]
  page_number: number
  page_size: number
  total_elements: number
  total_pages: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface CreateQuestionTypeDTO {
  code: string
  nameEn: string
  nameKh: string
  descriptionEn?: string | null
  descriptionKh?: string | null
  iconUrl?: string | null
  isActive?: boolean
  sortOrder?: number
}

export interface UpdateQuestionTypeDTO {
  code?: string
  nameEn?: string
  nameKh?: string
  descriptionEn?: string | null
  descriptionKh?: string | null
  iconUrl?: string | null
  isActive?: boolean
  sortOrder?: number
}
