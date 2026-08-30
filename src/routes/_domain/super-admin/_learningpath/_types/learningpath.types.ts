import type { CategoryItem } from '../../_category/_types/category.types'
import type { GradeItem } from '../../_grade/_types/grade.types'
import type { QuizPackageItem } from '../../_quizpack/_types/quizpack.types'

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
  sequence_order?: number
  sequenceOrder?: number
  sequence?: number
  category_id: string
  grade_id: string
  is_active: boolean
  is_published?: boolean
  isPublished?: boolean
  xp_reward?: number
  xpReward?: number
  pass_score_percentage?: number
  passScorePercentage?: number
  allow_skip?: boolean
  allowSkip?: boolean
  created_at: string
  updated_at: string
  is_deleted: boolean
  category?: CategoryItem
  grade?: GradeItem
  nodes?: LearningPathNodeItem[]
  quiz_packages?: QuizPackageItem[]
  quizPackages?: QuizPackageItem[]
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
  sequenceOrder?: number
  sequence_order?: number
  sequence?: number
  categoryId: string
  gradeId: string
  isActive?: boolean
  isPublished?: boolean
  is_published?: boolean
  xpReward?: number
  passScorePercentage?: number
  allowSkip?: boolean
  packageIds?: string[]
}

export interface UpdateLearningPathDTO {
  titleEn?: string
  titleKh?: string
  sequenceOrder?: number
  sequence_order?: number
  sequence?: number
  categoryId?: string
  gradeId?: string
  isActive?: boolean
  isPublished?: boolean
  is_published?: boolean
  xpReward?: number
  passScorePercentage?: number
  allowSkip?: boolean
  packageIds?: string[]
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
