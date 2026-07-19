import type { CategoryItem } from '../../_category/_types/category.types'
import type { GradeItem } from '../../_grade/_types/grade.types'

export interface LearningPathNodeQuestionItem {
  id: string
  node_id: string
  question_id: string
  sequence_order: number
}

export interface LearningPathNodeItem {
  id: string
  learning_path_id: string
  title_en: string
  title_kh: string
  sequence_order: number
  node_type: 'LESSON' | 'CHECKPOINT' | 'CHALLENGE'
  pass_score_percentage: number
  allow_skip: boolean
  xp_reward: number
  is_active: boolean
  node_questions?: LearningPathNodeQuestionItem[]
}

export interface LearningPathItem {
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
  nodes?: LearningPathNodeItem[]
}

export interface ListLearningPathsResponse {
  success: boolean
  status_code: number
  message: string
  message_kh: string
  data: LearningPathItem[]
  page_number: number
  page_size: number
  total_elements: number
  total_pages: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface CreateLearningPathDTO {
  titleEn: string
  titleKh: string
  sequence: number
  categoryId: string
  gradeId: string
  isActive?: boolean
}

export interface UpdateLearningPathDTO {
  titleEn?: string
  titleKh?: string
  sequence?: number
  categoryId?: string
  gradeId?: string
  isActive?: boolean
}

export interface CreateNodeDTO {
  titleEn: string
  titleKh: string
  sequenceOrder?: number
  nodeType?: 'LESSON' | 'CHECKPOINT' | 'CHALLENGE'
  passScorePercentage?: number
  allowSkip?: boolean
  xpReward?: number
}

export interface UpdateNodeDTO {
  titleEn?: string
  titleKh?: string
  sequenceOrder?: number
  nodeType?: 'LESSON' | 'CHECKPOINT' | 'CHALLENGE'
  passScorePercentage?: number
  allowSkip?: boolean
  xpReward?: number
  isActive?: boolean
}
