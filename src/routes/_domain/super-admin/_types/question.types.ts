import type { CategoryItem } from './category.types'
import type { LevelItem } from './level.types'

export type QuestionTypeEnum = 'MCQ' | 'MULTI_SELECT' | 'MATCHING' | 'TRUE_FALSE' | 'FILL_BLANK' | 'ORDER'
export type DifficultyEnum = 'EASY' | 'MEDIUM' | 'HARD'

export interface QuestionItem {
  id: string
  category_id: string
  level_id: string | null
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
  is_active: boolean
  created_at: string
  updated_at: string
  is_deleted: boolean
  category?: CategoryItem
  level?: LevelItem | null
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
  levelId?: string | null
  questionType: QuestionTypeEnum
  difficulty: DifficultyEnum
  scenarioEn?: string | null
  scenarioKh?: string | null
  questionTextEn: string
  questionTextKh: string
  explanationEn?: string | null
  explanationKh?: string | null
  imageUrl?: string | null
  xpValue: number
  timeLimitSeconds?: number | null
  content: any
  validation: any
}

export interface UpdateQuestionDTO {
  levelId?: string | null
  questionType?: QuestionTypeEnum
  difficulty?: DifficultyEnum
  scenarioEn?: string | null
  scenarioKh?: string | null
  questionTextEn?: string
  questionTextKh?: string
  explanationEn?: string | null
  explanationKh?: string | null
  imageUrl?: string | null
  xpValue?: number
  timeLimitSeconds?: number | null
  isActive?: boolean
  content?: any
  validation?: any
}
