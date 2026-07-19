import type { CategoryItem } from '../../_category/_types/category.types'
import type { GradeItem } from '../../_grade/_types/grade.types'

export type QuestionTypeEnum = 'MCQ' | 'MULTI_SELECT' | 'MATCHING' | 'TRUE_FALSE' | 'FILL_BLANK' | 'ORDER'
export type DifficultyEnum = 'EASY' | 'MEDIUM' | 'HARD'

export interface QuestionItem {
  id: string
  category_id: string
  grade_id: string
  question_type: QuestionTypeEnum
  difficulty_level: DifficultyEnum
  scenario_en: string | null
  scenario_kh: string | null
  question_text_en: string
  question_text_kh: string
  explanation_en: string | null
  explanation_kh: string | null
  image_url: string | null
  content: any
  validation: any
  xp_value: number
  time_limit_seconds: number | null
  content_hash: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  is_deleted: boolean
  category?: CategoryItem
  grade?: GradeItem
}

export interface ListQuestionsResponse {
  success: boolean
  status_code: number
  message: string
  message_kh: string
  data: QuestionItem[]
  page_number: number
  page_size: number
  total_elements: number
  total_pages: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface CreateQuestionDTO {
  categoryId: string
  gradeId: string
  questionType: QuestionTypeEnum
  difficulty?: DifficultyEnum
  scenarioEn?: string | null
  scenarioKh?: string | null
  questionTextEn: string
  questionTextKh: string
  explanationEn?: string | null
  explanationKh?: string | null
  imageUrl?: string | null
  content: any
  validation: any
  xpValue?: number
  timeLimitSeconds?: number | null
  isActive?: boolean
}

export interface UpdateQuestionDTO {
  categoryId?: string
  gradeId?: string
  questionType?: QuestionTypeEnum
  difficulty?: DifficultyEnum
  scenarioEn?: string | null
  scenarioKh?: string | null
  questionTextEn?: string
  questionTextKh?: string
  explanationEn?: string | null
  explanationKh?: string | null
  imageUrl?: string | null
  content?: any
  validation?: any
  xpValue?: number
  timeLimitSeconds?: number | null
  isActive?: boolean
}

export interface BulkImportQuestionsDTO {
  questions: CreateQuestionDTO[]
}

export interface BulkImportQuestionsResponse {
  success: boolean
  message: string
  data: QuestionItem[]
}
