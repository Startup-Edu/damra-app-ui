import type { CategoryItem } from '../../_category/_types/category.types'
import type { QuestionItem } from '../../_question/_types/question.types'

export interface QuizPackageItem {
  id: string
  title: string
  description: string | null
  category_id: string | null
  level_id?: string | null
  is_free: boolean
  price_coins: number
  questions_per_session: number | null
  is_active: boolean
  created_at: string
  updated_at: string
  is_deleted: boolean
  category?: CategoryItem | null
  questions?: QuestionItem[]
  package_questions?: QuizPackageQuestionItem[]
}

export interface QuizPackageQuestionItem {
  package_id: string
  question_id: string
  sequence_order: number
  question: QuestionItem
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
  categoryId?: string | null
  levelId?: string | null
  isFree?: boolean
  priceCoins?: number
  questionsPerSession?: number | null
  isActive?: boolean
}

export interface UpdateQuizPackageDTO {
  title?: string
  description?: string | null
  categoryId?: string | null
  levelId?: string | null
  isFree?: boolean
  priceCoins?: number
  questionsPerSession?: number | null
  isActive?: boolean
}

export interface SyncQuizPackageQuestionsDTO {
  questionIds: string[]
}
