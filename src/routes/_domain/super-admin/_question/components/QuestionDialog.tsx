import { useState, useEffect } from 'react'
import { useForm, useStore } from '@tanstack/react-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SearchableSelect } from '@/components/ui/shared/SearchableSelect'
import {
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useQuestionQuery,
} from '../_hooks/useQuestion'
import { useCategoriesQuery } from '../../_category/_hooks/useCategory'
import { useGradesQuery } from '../../_grade/_hooks/useGrade'
import { useGradeCategoriesQuery } from '../../_grade/_hooks/useGradeCategory'
import type {
  QuestionItem,
  QuestionTypeEnum,
  DifficultyEnum,
} from '../_types/question.types'
import { Loader2, AlertTriangle, Plus, Trash2 } from 'lucide-react'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'

const isQuillEmpty = (html: string) => {
  if (!html) return true
  const clean = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim()
  return clean === ''
}

const difficultySelectOptions = [
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HARD', label: 'Hard' },
]

const questionTypeSelectOptions = [
  { value: 'MCQ', label: 'Multiple Choice (MCQ)' },
  { value: 'MULTI_SELECT', label: 'Multi-Select Checkbox' },
  { value: 'TRUE_FALSE', label: 'True / False' },
  { value: 'FILL_BLANK', label: 'Fill in the Blank' },
  { value: 'MATCHING', label: 'Matching Items' },
  { value: 'ORDER', label: 'Reordering Items' },
]

interface QuestionDialogProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  setOpen?: (open: boolean) => void
  question: QuestionItem | null
}

export function QuestionDialog({
  open,
  onOpenChange: propOnOpenChange,
  setOpen: propSetOpen,
  question,
}: QuestionDialogProps) {
  const onOpenChange = propOnOpenChange || propSetOpen || (() => {})
  const [validationError, setValidationError] = useState('')

  // TYPE-SPECIFIC EDITOR STATES (linked alongside TanStack Form)
  const [options, setOptions] = useState<{ id: string; text_en: string; text_kh: string }[]>([
    { id: 'opt-1', text_en: '', text_kh: '' },
    { id: 'opt-2', text_en: '', text_kh: '' },
  ])
  const [correctOptionId, setCorrectOptionId] = useState('')
  const [correctOptionIds, setCorrectOptionIds] = useState<string[]>([])
  const [correctAnswerTF, setCorrectAnswerTF] = useState(true)
  const [blanks, setBlanks] = useState<{ id: string; is_case_sensitive: boolean; accepted_answers_raw: string }[]>([
    { id: 'blank-1', is_case_sensitive: false, accepted_answers_raw: '' },
  ])
  const [leftSide, setLeftSide] = useState<{ id: string; text_en: string; text_kh: string }[]>([
    { id: 'left-1', text_en: '', text_kh: '' },
  ])
  const [rightSide, setRightSide] = useState<{ id: string; text_en: string; text_kh: string }[]>([
    { id: 'right-1', text_en: '', text_kh: '' },
  ])
  const [correctPairs, setCorrectPairs] = useState<{ left_id: string; right_id: string }[]>([])
  const [orderItems, setOrderItems] = useState<{ id: string; text_en: string; text_kh: string }[]>([
    { id: 'ord-1', text_en: '', text_kh: '' },
    { id: 'ord-2', text_en: '', text_kh: '' },
  ])
  const [correctOrder, setCorrectOrder] = useState<string[]>([])

  const createMutation = useCreateQuestionMutation()
  const updateMutation = useUpdateQuestionMutation()

  // Fetch grades and categories
  const { data: gradesResponse, isLoading: gradesLoading } = useGradesQuery(1, 100, '', open)
  const { data: allCategoriesResponse, isLoading: allCategoriesLoading } = useCategoriesQuery(1, 100, '', true, open)

  const grades = gradesResponse?.data || []
  const allCategories = allCategoriesResponse?.data || []

  // Initialize TanStack Form
  const form = useForm({
    defaultValues: {
      gradeId: '',
      categoryId: '',
      questionType: 'MCQ' as QuestionTypeEnum,
      difficulty: 'MEDIUM' as DifficultyEnum,
      questionTextEn: '',
      questionTextKh: '',
      explanationEn: '',
      explanationKh: '',
      imageUrl: '',
      xpValue: 10,
      timeLimitSeconds: '' as number | '',
      isActive: true,
    },
    onSubmit: async ({ value }) => {
      setValidationError('')

      if (!value.gradeId) {
        setValidationError('Please select a Grade')
        return
      }

      if (!value.categoryId) {
        setValidationError('Please select a Category')
        return
      }

      if (isQuillEmpty(value.questionTextEn) || isQuillEmpty(value.questionTextKh)) {
        setValidationError('Both English and Khmer question texts are required')
        return
      }

      // Resolve dynamic types
      let contentPayload: any = {}
      let validationPayload: any = {}

      if (value.questionType === 'MCQ') {
        const cleanOptions = options.map((o) => ({
          id: o.id.trim(),
          text_en: o.text_en.trim(),
          text_kh: o.text_kh.trim(),
        }))
        if (cleanOptions.some((o) => !o.text_en || !o.text_kh)) {
          setValidationError('All options must contain English and Khmer texts')
          return
        }
        if (cleanOptions.length < 2) {
          setValidationError('Multiple Choice questions must have at least 2 options')
          return
        }
        if (!correctOptionId) {
          setValidationError('Please select a correct option answer')
          return
        }
        contentPayload = { options: cleanOptions }
        validationPayload = { correct_option_id: correctOptionId }
      } else if (value.questionType === 'MULTI_SELECT') {
        const cleanOptions = options.map((o) => ({
          id: o.id.trim(),
          text_en: o.text_en.trim(),
          text_kh: o.text_kh.trim(),
        }))
        if (cleanOptions.some((o) => !o.text_en || !o.text_kh)) {
          setValidationError('All options must contain English and Khmer texts')
          return
        }
        if (cleanOptions.length < 2) {
          setValidationError('Multi-select questions must have at least 2 options')
          return
        }
        if (correctOptionIds.length === 0) {
          setValidationError('Please select at least 1 correct option')
          return
        }
        contentPayload = { options: cleanOptions }
        validationPayload = { correct_option_ids: correctOptionIds }
      } else if (value.questionType === 'TRUE_FALSE') {
        contentPayload = {}
        validationPayload = { correct_answer: correctAnswerTF }
      } else if (value.questionType === 'FILL_BLANK') {
        const cleanBlanks = blanks.map((b) => ({
          id: b.id.trim(),
          is_case_sensitive: b.is_case_sensitive,
          accepted_answers: b.accepted_answers_raw
            .split(',')
            .map((a) => a.trim())
            .filter(Boolean),
        }))
        if (cleanBlanks.some((b) => b.accepted_answers.length === 0)) {
          setValidationError('All blanks must have at least one accepted answer')
          return
        }
        contentPayload = { blanks_count: cleanBlanks.length }
        validationPayload = { correct_blanks: cleanBlanks }
      } else if (value.questionType === 'MATCHING') {
        const cleanLeft = leftSide.map((i) => ({
          id: i.id.trim(),
          text_en: i.text_en.trim(),
          text_kh: i.text_kh.trim(),
        }))
        const cleanRight = rightSide.map((i) => ({
          id: i.id.trim(),
          text_en: i.text_en.trim(),
          text_kh: i.text_kh.trim(),
        }))
        if (cleanLeft.some((i) => !i.text_en || !i.text_kh) || cleanRight.some((i) => !i.text_en || !i.text_kh)) {
          setValidationError('All items in matching must contain English and Khmer texts')
          return
        }
        if (cleanLeft.length === 0 || cleanRight.length === 0) {
          setValidationError('Matching must have at least one item on left and right side')
          return
        }
        if (correctPairs.length === 0) {
          setValidationError('Please configure at least one correct match connection pair')
          return
        }
        contentPayload = { left_side: cleanLeft, right_side: cleanRight }
        validationPayload = { correct_pairs: correctPairs }
      } else if (value.questionType === 'ORDER') {
        const cleanItems = orderItems.map((i) => ({
          id: i.id.trim(),
          text_en: i.text_en.trim(),
          text_kh: i.text_kh.trim(),
        }))
        if (cleanItems.some((i) => !i.text_en || !i.text_kh)) {
          setValidationError('All items must contain English and Khmer texts')
          return
        }
        if (cleanItems.length < 2) {
          setValidationError('Ordering questions require at least 2 items')
          return
        }
        const order = correctOrder.length === cleanItems.length ? correctOrder : cleanItems.map((i) => i.id)
        contentPayload = { items: cleanItems }
        validationPayload = { correct_order: order }
      }

      const payload = {
        gradeId: value.gradeId,
        categoryId: value.categoryId,
        questionType: value.questionType,
        difficulty: value.difficulty,
        questionTextEn: value.questionTextEn.trim(),
        questionTextKh: value.questionTextKh.trim(),
        explanationEn: isQuillEmpty(value.explanationEn) ? null : value.explanationEn.trim(),
        explanationKh: isQuillEmpty(value.explanationKh) ? null : value.explanationKh.trim(),
        imageUrl: value.imageUrl.trim() || null,
        xpValue: Number(value.xpValue),
        timeLimitSeconds: value.timeLimitSeconds === '' ? null : Number(value.timeLimitSeconds),
        content: contentPayload,
        validation: validationPayload,
      }

      if (isEditing && question) {
        const updatePayload: any = { ...payload }
        delete updatePayload.categoryId
        updatePayload.isActive = value.isActive

        updateMutation.mutate(
          { id: question.id, data: updatePayload },
          {
            onSuccess: (res) => {
              if (res.success) onOpenChange(false)
            },
            onError: (err: any) => {
              if (err?.error?.details?.[0]?.message) {
                setValidationError(err.error.details[0].message)
              }
            },
          }
        )
      } else {
        createMutation.mutate(payload, {
          onSuccess: (res) => {
            if (res.success) onOpenChange(false)
          },
          onError: (err: any) => {
            if (err?.error?.details?.[0]?.message) {
              setValidationError(err.error.details[0].message)
            }
          },
        })
      }
    },
  })

  useEffect(() => {
    if (open) {
      if (question) {
        form.setFieldValue('gradeId', question.grade_id || (question as any).gradeId || question.grade?.id || '')
        form.setFieldValue('categoryId', question.category_id || (question as any).categoryId || question.category?.id || '')
        form.setFieldValue('questionType', question.question_type)
        form.setFieldValue('difficulty', question.difficulty_level)
        form.setFieldValue('questionTextEn', question.question_text_en)
        form.setFieldValue('questionTextKh', question.question_text_kh)
        form.setFieldValue('explanationEn', question.explanation_en || '')
        form.setFieldValue('explanationKh', question.explanation_kh || '')
        form.setFieldValue('imageUrl', question.image_url || '')
        form.setFieldValue('xpValue', question.xp_value)
        form.setFieldValue('timeLimitSeconds', question.time_limit_seconds || '')
        form.setFieldValue('isActive', question.is_active)

        const type = question.question_type
        const content = question.content || {}
        const validation = question.validation || {}

        if (type === 'MCQ') {
          setOptions((content.options || []).map((o: any) => ({ id: o.id, text_en: o.text_en || o.textEn || '', text_kh: o.text_kh || o.textKh || '' })))
          setCorrectOptionId(validation.correct_option_id || validation.correctOptionId || '')
        } else if (type === 'MULTI_SELECT') {
          setOptions((content.options || []).map((o: any) => ({ id: o.id, text_en: o.text_en || o.textEn || '', text_kh: o.text_kh || o.textKh || '' })))
          setCorrectOptionIds(validation.correct_option_ids || validation.correctOptionIds || [])
        } else if (type === 'TRUE_FALSE') {
          setCorrectAnswerTF(validation.correct_answer ?? validation.correctAnswer ?? true)
        } else if (type === 'FILL_BLANK') {
          const loadedBlanks = (validation.correct_blanks || validation.correctBlanks || []).map((b: any) => ({
            id: b.id,
            is_case_sensitive: b.is_case_sensitive ?? b.isCaseSensitive ?? false,
            accepted_answers_raw: (b.accepted_answers || b.acceptedAnswers || []).join(', '),
          }))
          setBlanks(loadedBlanks.length ? loadedBlanks : [{ id: 'blank-1', is_case_sensitive: false, accepted_answers_raw: '' }])
        } else if (type === 'MATCHING') {
          setLeftSide((content.left_side || content.leftSide || []).map((i: any) => ({ id: i.id, text_en: i.text_en || i.textEn || '', text_kh: i.text_kh || i.textKh || '' })))
          setRightSide((content.right_side || content.rightSide || []).map((i: any) => ({ id: i.id, text_en: i.text_en || i.textEn || '', text_kh: i.text_kh || i.textKh || '' })))
          setCorrectPairs((validation.correct_pairs || validation.correctPairs || []).map((p: any) => ({ left_id: p.left_id || p.leftId, right_id: p.right_id || p.rightId })))
        } else if (type === 'ORDER') {
          setOrderItems((content.items || []).map((i: any) => ({ id: i.id, text_en: i.text_en || i.textEn || '', text_kh: i.text_kh || i.textKh || '' })))
          setCorrectOrder(validation.correct_order || validation.correctOrder || [])
        }
      } else {
        form.reset()
        setOptions([{ id: 'opt-1', text_en: '', text_kh: '' }, { id: 'opt-2', text_en: '', text_kh: '' }])
        setCorrectOptionId('')
        setCorrectOptionIds([])
        setCorrectAnswerTF(true)
        setBlanks([{ id: 'blank-1', is_case_sensitive: false, accepted_answers_raw: '' }])
        setLeftSide([{ id: 'left-1', text_en: '', text_kh: '' }])
        setRightSide([{ id: 'right-1', text_en: '', text_kh: '' }])
        setCorrectPairs([])
        setOrderItems([{ id: 'ord-1', text_en: '', text_kh: '' }, { id: 'ord-2', text_en: '', text_kh: '' }])
        setCorrectOrder([])
      }
      setValidationError('')
    }
  }, [open, question])

  const selectedGradeId = useStore(form.store, (s) => s.values.gradeId)
  const currentQuestionType = useStore(form.store, (s) => s.values.questionType)
  const { data: gradeCategoriesResponse, isLoading: gradeCategoriesLoading } = useGradeCategoriesQuery(selectedGradeId, !!selectedGradeId)
  const availableCategories = selectedGradeId && gradeCategoriesResponse?.data ? gradeCategoriesResponse.data : allCategories
  
  const gradeSelectOptions = grades.map((g) => ({ value: g.id, label: `${g.name_en} (${g.name_kh})`, description: g.name_kh }))
  const categorySelectOptions = availableCategories.map((c) => ({ value: c.id, label: c.name_en, description: c.name_kh }))

  const isEditing = !!question
  const isLoading = createMutation.isPending || updateMutation.isPending || gradesLoading || allCategoriesLoading || gradeCategoriesLoading

  // OPTION HELPERS (MCQ, MULTI_SELECT)
  const addOption = () => {
    const nextId = `opt-${Date.now()}`
    setOptions([...options, { id: nextId, text_en: '', text_kh: '' }])
  }
  const removeOption = (id: string) => {
    setOptions(options.filter((o) => o.id !== id))
    if (correctOptionId === id) setCorrectOptionId('')
    setCorrectOptionIds(correctOptionIds.filter((cid) => cid !== id))
  }
  const handleOptionTextChange = (id: string, field: 'text_en' | 'text_kh', value: string) => {
    setOptions(options.map((o) => (o.id === id ? { ...o, [field]: value } : o)))
  }

  // BLANK HELPERS (FILL_BLANK)
  const addBlank = () => {
    const nextId = `blank-${blanks.length + 1}`
    setBlanks([...blanks, { id: nextId, is_case_sensitive: false, accepted_answers_raw: '' }])
  }
  const removeBlank = (id: string) => {
    setBlanks(blanks.filter((b) => b.id !== id))
  }
  const handleBlankChange = (id: string, field: string, value: any) => {
    setBlanks(blanks.map((b) => (b.id === id ? { ...b, [field]: value } : b)))
  }

  // MATCHING HELPERS
  const addLeft = () => {
    const nextId = `left-${Date.now()}`
    setLeftSide([...leftSide, { id: nextId, text_en: '', text_kh: '' }])
  }
  const addRight = () => {
    const nextId = `right-${Date.now()}`
    setRightSide([...rightSide, { id: nextId, text_en: '', text_kh: '' }])
  }
  const removeLeft = (id: string) => {
    setLeftSide(leftSide.filter((i) => i.id !== id))
    setCorrectPairs(correctPairs.filter((p) => p.left_id !== id))
  }
  const removeRight = (id: string) => {
    setRightSide(rightSide.filter((i) => i.id !== id))
    setCorrectPairs(correctPairs.filter((p) => p.right_id !== id))
  }
  const handleItemTextChange = (side: 'left' | 'right', id: string, field: 'text_en' | 'text_kh', value: string) => {
    if (side === 'left') {
      setLeftSide(leftSide.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
    } else {
      setRightSide(rightSide.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
    }
  }
  const togglePair = (lId: string, rId: string) => {
    const exists = correctPairs.find((p) => p.left_id === lId && p.right_id === rId)
    if (exists) {
      setCorrectPairs(correctPairs.filter((p) => !(p.left_id === lId && p.right_id === rId)))
    } else {
      setCorrectPairs([...correctPairs, { left_id: lId, right_id: rId }])
    }
  }

  // ORDER HELPERS
  const addOrderItem = () => {
    const nextId = `ord-${Date.now()}`
    setOrderItems([...orderItems, { id: nextId, text_en: '', text_kh: '' }])
  }
  const removeOrderItem = (id: string) => {
    setOrderItems(orderItems.filter((i) => i.id !== id))
    setCorrectOrder(correctOrder.filter((cid) => cid !== id))
  }
  const handleOrderItemChange = (id: string, field: 'text_en' | 'text_kh', value: string) => {
    setOrderItems(orderItems.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[960px] md:max-w-[960px] w-[95vw] shadow-xl max-h-[90vh] !flex !flex-col !p-0 !gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 space-y-1.5 shrink-0">
          <DialogTitle className="text-lg font-bold">{isEditing ? 'Modify Question Details' : 'Create New Question'}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing ? 'Update translations, parameters, grade, category, or formatting options.' : 'Add a new educational gameplay question to the question bank.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit() }} className="flex flex-col flex-1 overflow-hidden">
          <ScrollArea className="flex-1 min-h-0 w-full overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
              <div className="md:col-span-4 space-y-4 md:border-r md:pr-6 border-border">
                <form.Field
                  name="gradeId"
                  children={(field) => (
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-semibold">
                        Grade Level <span className="text-rose-500">*</span>
                      </Label>
                      <SearchableSelect
                        options={gradeSelectOptions}
                        value={field.state.value}
                        onChange={(val) => {
                          field.handleChange(val)
                          form.setFieldValue('categoryId', '') // Reset category on grade change
                        }}
                        disabled={isLoading}
                        sortable="asc"
                        placeholder="Select Grade"
                        searchPlaceholder="Search grade..."
                        triggerClassName="w-full"
                      />
                    </div>
                  )}
                />

                <form.Field
                  name="categoryId"
                  children={(field) => (
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-semibold">
                        Category <span className="text-rose-500">*</span>
                      </Label>
                      <SearchableSelect
                        options={categorySelectOptions}
                        value={field.state.value}
                        onChange={field.handleChange}
                        disabled={isEditing || isLoading || !selectedGradeId}
                        sortable="asc"
                        placeholder={!selectedGradeId ? "Select Grade first" : "Select Category"}
                        searchPlaceholder="Search category..."
                        triggerClassName="w-full"
                      />
                    </div>
                  )}
                />

                <form.Field
                  name="difficulty"
                  children={(field) => (
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-semibold">
                        Difficulty <span className="text-rose-500">*</span>
                      </Label>
                      <SearchableSelect
                        options={difficultySelectOptions}
                        value={field.state.value}
                        onChange={(val) => field.handleChange(val as DifficultyEnum)}
                        disabled={isLoading}
                        placeholder="Select Difficulty"
                        triggerClassName="w-full"
                      />
                    </div>
                  )}
                />

                <form.Field
                  name="questionType"
                  children={(field) => (
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-semibold">
                        Question Type <span className="text-rose-500">*</span>
                      </Label>
                      <SearchableSelect
                        options={questionTypeSelectOptions}
                        value={field.state.value}
                        onChange={(val) => field.handleChange(val as QuestionTypeEnum)}
                        disabled={isLoading}
                        placeholder="Select Question Type"
                        triggerClassName="w-full"
                      />
                    </div>
                  )}
                />

                <form.Field
                  name="xpValue"
                  children={(field) => (
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-semibold">
                        XP Reward Value
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                        disabled={isLoading}
                        className="h-9.5 text-xs"
                      />
                    </div>
                  )}
                />

                <form.Field
                  name="timeLimitSeconds"
                  children={(field) => (
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-semibold">
                        Time Limit (Seconds)
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        placeholder="No limit"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value === '' ? '' : Number(e.target.value))}
                        disabled={isLoading}
                        className="h-9.5 text-xs"
                      />
                    </div>
                  )}
                />

                <form.Field
                  name="isActive"
                  children={(field) => (
                    <div className="space-y-1.5 flex flex-col justify-end pt-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border h-9.5">
                        <Label className="text-[11px] font-semibold cursor-pointer">
                          Active Status
                        </Label>
                        <Switch
                          checked={field.state.value}
                          onCheckedChange={field.handleChange}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  )}
                />
              </div>

              {/* Right Column: Question Texts, Explanations & Answer Config */}
              <div className="md:col-span-8 space-y-4">
                <form.Field
                  name="questionTextEn"
                  children={(field) => (
                    <div className="space-y-1.5 quill-editor-wrapper text-editor-question">
                      <Label className="text-[11px] font-semibold">
                        Question Text (English) <span className="text-rose-500">*</span>
                      </Label>
                      <ReactQuill
                        theme="snow"
                        value={field.state.value || ''}
                        onChange={field.handleChange}
                        readOnly={isLoading}
                        modules={{
                          toolbar: [
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ list: 'ordered' }, { list: 'bullet' }],
                            ['clean'],
                          ],
                        }}
                        placeholder="What is 2 + 2?"
                      />
                    </div>
                  )}
                />

                <form.Field
                  name="questionTextKh"
                  children={(field) => (
                    <div className="space-y-1.5 quill-editor-wrapper text-editor-question">
                      <Label className="text-[11px] font-semibold">
                        Question Text (Khmer) <span className="text-rose-500">*</span>
                      </Label>
                      <ReactQuill
                        theme="snow"
                        value={field.state.value || ''}
                        onChange={field.handleChange}
                        readOnly={isLoading}
                        modules={{
                          toolbar: [
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ list: 'ordered' }, { list: 'bullet' }],
                            ['clean'],
                          ],
                        }}
                        placeholder="២ + ២ ស្មើនឹងប៉ុន្មាន?"
                      />
                    </div>
                  )}
                />

                {/* Explanations */}
                <form.Field
                  name="explanationEn"
                  children={(field) => (
                    <div className="space-y-1.5 quill-editor-wrapper text-editor-explanation pt-1.5 border-t border-border">
                      <Label className="text-[11px] font-semibold">
                        Explanation (English)
                      </Label>
                      <ReactQuill
                        theme="snow"
                        value={field.state.value || ''}
                        onChange={field.handleChange}
                        readOnly={isLoading}
                        modules={{
                          toolbar: [
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ list: 'ordered' }, { list: 'bullet' }],
                            ['clean'],
                          ],
                        }}
                        placeholder="Brief hint or logic overview..."
                      />
                    </div>
                  )}
                />

                <form.Field
                  name="explanationKh"
                  children={(field) => (
                    <div className="space-y-1.5 quill-editor-wrapper text-editor-explanation">
                      <Label className="text-[11px] font-semibold">
                        Explanation (Khmer)
                      </Label>
                      <ReactQuill
                        theme="snow"
                        value={field.state.value || ''}
                        onChange={field.handleChange}
                        readOnly={isLoading}
                        modules={{
                          toolbar: [
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ list: 'ordered' }, { list: 'bullet' }],
                            ['clean'],
                          ],
                        }}
                        placeholder="ការពន្យល់សង្ខេប..."
                      />
                    </div>
                  )}
                />



                {/* DYNAMIC ANSWER CONFIG PANELS */}
                <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Answer Validation & Options Config
                    </h3>
                  </div>

                  {/* MCQ / MULTI_SELECT PANEL */}
                  {(currentQuestionType === 'MCQ' || currentQuestionType === 'MULTI_SELECT') && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        {options.map((opt, idx) => (
                          <div key={opt.id} className="flex gap-2 items-center">
                            {currentQuestionType === 'MCQ' ? (
                              <input
                                type="radio"
                                name="mcq-correct"
                                checked={correctOptionId === opt.id}
                                onChange={() => setCorrectOptionId(opt.id)}
                                className="h-4.5 w-4.5 accent-primary shrink-0"
                              />
                            ) : (
                              <input
                                type="checkbox"
                                checked={correctOptionIds.includes(opt.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setCorrectOptionIds([...correctOptionIds, opt.id])
                                  } else {
                                    setCorrectOptionIds(correctOptionIds.filter((id) => id !== opt.id))
                                  }
                                }}
                                className="h-4.5 w-4.5 accent-primary shrink-0"
                              />
                            )}
                            <Input
                              placeholder={`Option ${idx + 1} English`}
                              value={opt.text_en}
                              onChange={(e) => handleOptionTextChange(opt.id, 'text_en', e.target.value)}
                              disabled={isLoading}
                              className="h-8.5 text-xs flex-1"
                            />
                            <Input
                              placeholder={`Option ${idx + 1} Khmer`}
                              value={opt.text_kh}
                              onChange={(e) => handleOptionTextChange(opt.id, 'text_kh', e.target.value)}
                              disabled={isLoading}
                              className="h-8.5 text-xs flex-1"
                            />
                            {options.length > 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeOption(opt.id)}
                                disabled={isLoading}
                                className="h-8.5 w-8.5 text-rose-500 shrink-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addOption}
                        disabled={isLoading}
                        className="text-xs h-8"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Option
                      </Button>
                    </div>
                  )}

                  {/* TRUE_FALSE PANEL */}
                  {currentQuestionType === 'TRUE_FALSE' && (
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-semibold">
                        Correct Answer:
                      </span>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                          <input
                            type="radio"
                            name="tf-answer"
                            checked={correctAnswerTF === true}
                            onChange={() => setCorrectAnswerTF(true)}
                          />
                          True
                        </label>
                        <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                          <input
                            type="radio"
                            name="tf-answer"
                            checked={correctAnswerTF === false}
                            onChange={() => setCorrectAnswerTF(false)}
                          />
                          False
                        </label>
                      </div>
                    </div>
                  )}

                  {/* FILL_BLANK PANEL */}
                  {currentQuestionType === 'FILL_BLANK' && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        {blanks.map((b, idx) => (
                          <div key={b.id} className="flex gap-3 items-center">
                            <span className="text-xs font-semibold text-muted-foreground shrink-0 w-16">
                              Blank {idx + 1}:
                            </span>
                            <Input
                              placeholder="Comma separated acceptable answers (e.g. 4, four, IV)"
                              value={b.accepted_answers_raw}
                              onChange={(e) => handleBlankChange(b.id, 'accepted_answers_raw', e.target.value)}
                              disabled={isLoading}
                              className="h-8.5 text-xs flex-1"
                            />
                            <label className="flex items-center gap-1.5 text-[10px] cursor-pointer shrink-0 font-medium">
                              <Switch
                                checked={b.is_case_sensitive}
                                onCheckedChange={(checked) => handleBlankChange(b.id, 'is_case_sensitive', checked)}
                                disabled={isLoading}
                              />
                              Case Sensitive
                            </label>
                            {blanks.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeBlank(b.id)}
                                disabled={isLoading}
                                className="h-8.5 w-8.5 text-rose-500 shrink-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addBlank}
                        disabled={isLoading}
                        className="text-xs h-8"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Blank Target
                      </Button>
                    </div>
                  )}

                  {/* MATCHING PANEL */}
                  {currentQuestionType === 'MATCHING' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {/* Left items */}
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase">Left Column Side</Label>
                          <div className="space-y-1.5">
                            {leftSide.map((i, idx) => (
                              <div key={i.id} className="flex gap-1.5 items-center">
                                <Input
                                  placeholder={`Left ${idx + 1} English`}
                                  value={i.text_en}
                                  onChange={(e) => handleItemTextChange('left', i.id, 'text_en', e.target.value)}
                                  className="h-8 text-xs"
                                />
                                <Input
                                  placeholder="Khmer"
                                  value={i.text_kh}
                                  onChange={(e) => handleItemTextChange('left', i.id, 'text_kh', e.target.value)}
                                  className="h-8 text-xs"
                                />
                                {leftSide.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeLeft(i.id)}
                                    className="h-8 w-8 text-rose-500 shrink-0"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                          <Button type="button" variant="outline" size="sm" onClick={addLeft} className="h-7 text-[10px]">
                            Add Left Item
                          </Button>
                        </div>

                        {/* Right items */}
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase">Right Column Side</Label>
                          <div className="space-y-1.5">
                            {rightSide.map((i, idx) => (
                              <div key={i.id} className="flex gap-1.5 items-center">
                                <Input
                                  placeholder={`Right ${idx + 1} English`}
                                  value={i.text_en}
                                  onChange={(e) => handleItemTextChange('right', i.id, 'text_en', e.target.value)}
                                  className="h-8 text-xs"
                                />
                                <Input
                                  placeholder="Khmer"
                                  value={i.text_kh}
                                  onChange={(e) => handleItemTextChange('right', i.id, 'text_kh', e.target.value)}
                                  className="h-8 text-xs"
                                />
                                {rightSide.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeRight(i.id)}
                                    className="h-8 w-8 text-rose-500 shrink-0"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                          <Button type="button" variant="outline" size="sm" onClick={addRight} className="h-7 text-[10px]">
                            Add Right Item
                          </Button>
                        </div>
                      </div>

                      {/* Match Connections Config */}
                      <div className="pt-2 border-t">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase block mb-2">Configure Correct Matches</Label>
                        <p className="text-[9px] text-muted-foreground mb-2">Click elements to link them together as correct pair matching targets.</p>
                        <div className="flex flex-wrap gap-2">
                          {leftSide.map((l) =>
                            rightSide.map((r) => {
                              const isLinked = correctPairs.some((p) => p.left_id === l.id && p.right_id === r.id)
                              return (
                                <Button
                                  key={`${l.id}-${r.id}`}
                                  type="button"
                                  variant={isLinked ? 'default' : 'outline'}
                                  onClick={() => togglePair(l.id, r.id)}
                                  className="text-[10px] h-7.5 px-2"
                                >
                                  {l.text_en || '(left)'} ↔ {r.text_en || '(right)'}
                                </Button>
                              )
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ORDER PANEL */}
                  {currentQuestionType === 'ORDER' && (
                    <div className="space-y-3">
                      <p className="text-[9px] text-muted-foreground">Order items sequence. Provide them in their correct sequence from top to bottom.</p>
                      <div className="space-y-2">
                        {orderItems.map((item, idx) => (
                          <div key={item.id} className="flex gap-2 items-center">
                            <span className="text-xs font-bold text-muted-foreground shrink-0 w-6">#{idx + 1}</span>
                            <Input
                              placeholder={`Item English text`}
                              value={item.text_en}
                              onChange={(e) => handleOrderItemChange(item.id, 'text_en', e.target.value)}
                              className="h-8.5 text-xs flex-1"
                            />
                            <Input
                              placeholder={`Item Khmer text`}
                              value={item.text_kh}
                              onChange={(e) => handleOrderItemChange(item.id, 'text_kh', e.target.value)}
                              className="h-8.5 text-xs flex-1"
                            />
                            {orderItems.length > 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeOrderItem(item.id)}
                                disabled={isLoading}
                                className="h-8.5 w-8.5 text-rose-500 shrink-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      <Button type="button" variant="outline" size="sm" onClick={addOrderItem} className="text-xs h-8">
                        <Plus className="h-3 w-3 mr-1" /> Add Order Item
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {validationError && (
                <div className="md:col-span-12 flex items-start gap-2 p-3 rounded-lg border border-rose-500/10 bg-rose-500/5 text-rose-500">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium leading-tight">{validationError}</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Fixed footer outside scrollarea */}
          <DialogFooter className="p-6 pt-3 border-t border-border bg-muted/40 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="!h-9 text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="!h-9 text-xs">
              {isLoading && <Loader2 className="mr-2 size-3.5 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Question'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
