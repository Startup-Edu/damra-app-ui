import type { CreateQuestionDTO, QuestionTypeEnum, DifficultyEnum } from '../../_types/question.types'

export interface ParsedItem {
  index: number
  raw: any
  processedPayload?: CreateQuestionDTO
  isValid: boolean
  isDuplicate?: boolean
  errors: string[]
}

export interface ValidationSummary {
  parsedItems: ParsedItem[]
  validCount: number
  duplicateCount: number
  invalidCount: number
}

export const computeClientHash = (
  catId: string,
  type: string,
  qEn: string,
  qKh: string,
  content: any,
  validation: any
): string => {
  const norm = (str: string) => (str || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().toLowerCase()
  return `${catId.trim()}:${type.trim()}:${norm(qEn)}:${norm(qKh)}:${JSON.stringify(content || {})}:${JSON.stringify(validation || {})}`
}

export const parseAndValidateImportPayload = (
  jsonText: string,
  presetGradeId: string,
  presetCategoryId: string,
  presetDifficulty: DifficultyEnum,
  presetXpValue: number,
  presetTimeLimit: string,
  overrideExisting: boolean
): ValidationSummary => {
  if (!jsonText.trim()) {
    return { parsedItems: [], validCount: 0, duplicateCount: 0, invalidCount: 0 }
  }

  let rawArray: any[] = []
  try {
    const parsed = JSON.parse(jsonText)
    rawArray = Array.isArray(parsed) ? parsed : [parsed]
  } catch {
    return {
      parsedItems: [
        {
          index: 1,
          raw: null,
          isValid: false,
          errors: ['Syntax error: Invalid JSON structure or unescaped characters'],
        },
      ],
      validCount: 0,
      duplicateCount: 0,
      invalidCount: 1,
    }
  }

  const seenHashes = new Set<string>()

  const parsedItems: ParsedItem[] = rawArray.map((item, idx) => {
    const errors: string[] = []
    let isDuplicate = false

    // 1. Question Text validation
    const qEn = item.question_text_en || item.questionTextEn || ''
    const qKh = item.question_text_kh || item.questionTextKh || ''
    if (!qEn.trim()) errors.push('English question text is missing')
    if (!qKh.trim()) errors.push('Khmer question text is missing')

    // 2. Question Type validation
    const type: QuestionTypeEnum = item.question_type || item.questionType || 'MCQ'
    const validTypes: QuestionTypeEnum[] = ['MCQ', 'MULTI_SELECT', 'TRUE_FALSE', 'FILL_BLANK', 'MATCHING', 'ORDER']
    if (!validTypes.includes(type)) {
      errors.push(`Unsupported question type: "${type}"`)
    }

    // 3. Grade & Category Resolution
    const rawGrade = item.grade_id || item.gradeId || ''
    const gradeId = overrideExisting ? (presetGradeId || rawGrade) : (rawGrade || presetGradeId)
    if (!gradeId) {
      errors.push('Grade ID missing (Select a target Grade in presets or provide grade_id)')
    }

    const rawCat = item.category_id || item.categoryId || ''
    const categoryId = overrideExisting ? (presetCategoryId || rawCat) : (rawCat || presetCategoryId)
    if (!categoryId) {
      errors.push('Category ID missing (Select a target Category in presets or provide category_id)')
    }

    // 4. Difficulty & XP Presets
    const diff: DifficultyEnum = item.difficulty_level || item.difficulty || presetDifficulty || 'EASY'
    const xp = item.xp_value ?? item.xpValue ?? presetXpValue ?? 10
    const timer = item.time_limit_seconds ?? item.timeLimitSeconds ?? (presetTimeLimit ? Number(presetTimeLimit) : null)

    // 5. Structure validation by type
    const content = item.content || {}
    const validation = item.validation || {}

    if (type === 'MCQ') {
      const opts = content.options || []
      if (!Array.isArray(opts) || opts.length < 2) {
        errors.push('MCQ requires content.options array with at least 2 items')
      }
      if (!validation.correct_option_id && !validation.correctOptionId) {
        errors.push('MCQ requires validation.correct_option_id')
      }
    } else if (type === 'MULTI_SELECT') {
      const opts = content.options || []
      if (!Array.isArray(opts) || opts.length < 2) {
        errors.push('Multi-Select requires content.options array with at least 2 items')
      }
      const correctIds = validation.correct_option_ids || validation.correctOptionIds || []
      if (!Array.isArray(correctIds) || correctIds.length === 0) {
        errors.push('Multi-Select requires validation.correct_option_ids array with at least 1 ID')
      }
    } else if (type === 'TRUE_FALSE') {
      if (typeof validation.correct_answer !== 'boolean' && typeof validation.correctAnswer !== 'boolean') {
        errors.push('True/False requires validation.correct_answer (boolean)')
      }
    } else if (type === 'FILL_BLANK') {
      const blanks = validation.correct_blanks || validation.correctBlanks || []
      if (!Array.isArray(blanks) || blanks.length === 0) {
        errors.push('Fill in Blank requires validation.correct_blanks array with target answers')
      }
    } else if (type === 'MATCHING') {
      const left = content.left_side || content.leftSide || []
      const right = content.right_side || content.rightSide || []
      const pairs = validation.correct_pairs || validation.correctPairs || []
      if (!Array.isArray(left) || left.length === 0 || !Array.isArray(right) || right.length === 0) {
        errors.push('Matching requires left_side and right_side arrays')
      }
      if (!Array.isArray(pairs) || pairs.length === 0) {
        errors.push('Matching requires validation.correct_pairs array')
      }
    } else if (type === 'ORDER') {
      const items = content.items || []
      const order = validation.correct_order || validation.correctOrder || []
      if (!Array.isArray(items) || items.length < 2) {
        errors.push('Ordering requires content.items array with at least 2 items')
      }
      if (!Array.isArray(order) || order.length === 0) {
        errors.push('Ordering requires validation.correct_order sequence array')
      }
    }

    // Intra-batch duplicate check
    if (categoryId && qEn.trim() && qKh.trim()) {
      const hash = computeClientHash(categoryId, type, qEn, qKh, content, validation)
      if (seenHashes.has(hash)) {
        isDuplicate = true
      } else {
        seenHashes.add(hash)
      }
    }

    const processedPayload: CreateQuestionDTO = {
      gradeId,
      categoryId,
      questionType: type,
      difficulty: diff,
      scenarioEn: item.scenario_en || item.scenarioEn || null,
      scenarioKh: item.scenario_kh || item.scenarioKh || null,
      questionTextEn: qEn,
      questionTextKh: qKh,
      explanationEn: item.explanation_en || item.explanationEn || null,
      explanationKh: item.explanationKh || item.explanationKh || null,
      imageUrl: item.image_url || item.imageUrl || null,
      xpValue: Number(xp),
      timeLimitSeconds: timer ? Number(timer) : null,
      content,
      validation,
    }

    return {
      index: idx + 1,
      raw: item,
      processedPayload,
      isValid: errors.length === 0,
      isDuplicate,
      errors,
    }
  })

  const duplicateCount = parsedItems.filter((i) => i.isDuplicate).length
  const invalidCount = parsedItems.filter((i) => !i.isValid).length
  const validCount = parsedItems.length - invalidCount

  return { parsedItems, validCount, duplicateCount, invalidCount }
}
