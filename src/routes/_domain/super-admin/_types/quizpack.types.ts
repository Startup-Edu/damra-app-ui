import type { CategoryItem } from './category.types'
import type { LevelItem } from './level.types'

export interface QuizPackageItem {
  id: string
  title: string
  description: string | null
  category_id: string | null
  level_id: string | null
  is_free: boolean
  price_coins: number
  is_active: boolean
  questions_per_session: number | null
  created_at: string
  updated_at: string
  is_deleted: boolean
  category?: CategoryItem | null
  level?: LevelItem | null
}

export interface ListQuizPackagesResponse {
  success: boolean
  status_code: number
  message: string
  message_kh: string
  data: QuizPackageItem[]
  page_number: number
  page_size: number
  total_elements: number
  total_pages: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface CreateQuizPackageDTO {
  title: string
  description?: string | null
  levelId: string
  isFree?: boolean
  priceCoins?: number
  isActive?: boolean
  questionsPerSession?: number | null
}

export interface UpdateQuizPackageDTO {
  title?: string
  description?: string | null
  levelId?: string
  isFree?: boolean
  priceCoins?: number
  isActive?: boolean
  questionsPerSession?: number | null
}
