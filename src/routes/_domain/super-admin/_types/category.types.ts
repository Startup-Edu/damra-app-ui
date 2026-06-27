export interface CategoryItem {
  id: string
  parent_id: string | null
  name_en: string
  name_kh: string
  description_en: string | null
  description_kh: string | null
  slug: string
  icon_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  parent: CategoryItem | null
  subcategories?: CategoryItem[]
}

export interface ListCategoriesResponse {
  success: boolean
  status_code: number
  message: string
  message_kh: string
  data: CategoryItem[]
  page_number: number
  page_size: number
  total_elements: number
  total_pages: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface CreateCategoryDTO {
  nameEn: string
  nameKh: string
  descriptionEn?: string | null
  descriptionKh?: string | null
  slug?: string
  iconUrl?: string | null
  parentId?: string | null
  isActive?: boolean
  sortOrder?: number
}

export interface UpdateCategoryDTO {
  nameEn?: string
  nameKh?: string
  descriptionEn?: string | null
  descriptionKh?: string | null
  slug?: string
  iconUrl?: string | null
  parentId?: string | null
  isActive?: boolean
  sortOrder?: number
}
