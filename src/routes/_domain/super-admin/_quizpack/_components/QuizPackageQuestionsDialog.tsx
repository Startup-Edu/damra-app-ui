import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Loader2,
  GripVertical,
  X,
  BookOpen,
  ListOrdered,
  CheckSquare,
} from 'lucide-react'
import { useQuizPackageQuery, useSyncQuizPackageQuestionsMutation } from '../_hooks/useQuizpack'
import { useQuestionsQuery } from '../../_question/_hooks/useQuestion'
import { useCategoriesQuery } from '../../_category/_hooks/useCategory'
import type { QuizPackageItem } from '../_types/quizpack.types'
import type { QuestionItem } from '../../_question/_types/question.types'

interface QuizPackageQuestionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quizpack: QuizPackageItem
}

export function QuizPackageQuestionsDialog({
  open,
  onOpenChange,
  quizpack,
}: QuizPackageQuestionsDialogProps) {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [orderedQuestions, setOrderedQuestions] = useState<QuestionItem[]>([])
  const [activeTab, setActiveTab] = useState<'pick' | 'order'>('pick')
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  const syncMutation = useSyncQuizPackageQuestionsMutation()

  // Fetch the current package with attached questions
  const { data: pkgRes, isLoading: pkgLoading } = useQuizPackageQuery(quizpack.id, open)

  // Fetch question bank
  const { data: questionsRes, isLoading: questionsLoading } = useQuestionsQuery(
    1, 200, search,
    filterCategory === 'all' ? undefined : filterCategory,
    undefined
  )

  // Fetch categories for filter
  const { data: categoriesRes } = useCategoriesQuery(1, 100, '', true)
  const categories = categoriesRes?.data || []

  const allQuestions = questionsRes?.data || []

  // On open, preload selections from existing attached questions
  useEffect(() => {
    if (!open) return
    if (pkgLoading) return
    const attached = pkgRes?.data?.package_questions ?? []
    const sorted = [...attached].sort((a, b) => a.sequence_order - b.sequence_order)
    const ids = sorted.map((pq) => pq.question_id)
    setSelectedIds(ids)
    setOrderedQuestions(sorted.map((pq) => pq.question).filter(Boolean))
    setSearch('')
    setFilterCategory(quizpack.category_id ?? 'all')
    setActiveTab('pick')
  }, [open, pkgLoading])

  const questionMap = useMemo(() => {
    const m: Record<string, QuestionItem> = {}
    allQuestions.forEach((q) => { m[q.id] = q })
    return m
  }, [allQuestions])

  const toggleSelect = (q: QuestionItem) => {
    setSelectedIds((prev) => {
      if (prev.includes(q.id)) {
        setOrderedQuestions((o) => o.filter((oq) => oq.id !== q.id))
        return prev.filter((id) => id !== q.id)
      } else {
        setOrderedQuestions((o) => [...o, q])
        return [...prev, q.id]
      }
    })
  }

  const handleRemoveOrdered = (id: string) => {
    setSelectedIds((prev) => prev.filter((sid) => sid !== id))
    setOrderedQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  // Drag & drop reordering
  const handleDragStart = (e: React.DragEvent, idx: number) => {
    e.dataTransfer.setData('text/plain', String(idx))
  }

  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault()
    const fromIdx = Number(e.dataTransfer.getData('text/plain'))
    if (fromIdx === targetIdx) { setDragOverIdx(null); return }
    const updated = [...orderedQuestions]
    const [moved] = updated.splice(fromIdx, 1)
    updated.splice(targetIdx, 0, moved)
    setOrderedQuestions(updated)
    setSelectedIds(updated.map((q) => q.id))
    setDragOverIdx(null)
  }

  const handleSave = () => {
    syncMutation.mutate(
      { id: quizpack.id, data: { questionIds: orderedQuestions.map((q) => q.id) } },
      { onSuccess: (res) => { if (res.success) onOpenChange(false) } }
    )
  }

  const isLoading = pkgLoading || questionsLoading
  const isPending = syncMutation.isPending

  const difficultyColor: Record<string, string> = {
    EASY: 'text-emerald-500',
    MEDIUM: 'text-amber-500',
    HARD: 'text-rose-500',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-4xl w-full max-h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-4 pb-4 border-b shrink-0">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Manage Questions
            <Badge variant="outline" className="ml-1 text-[10px] font-semibold">
              {quizpack.title}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Select questions from the Question Bank and drag to set order. The session engine will serve questions in this exact sequence.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Bar */}
        <div className="flex items-center gap-3 px-5 pt-3 pb-3 shrink-0">
          <button
            onClick={() => setActiveTab('pick')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'pick'
                ? 'bg-primary text-white'
                : 'bg-muted'
            }`}
          >
            <CheckSquare className="h-3.5 w-3.5" />
            Select Questions
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
              activeTab === 'pick' ? 'bg-white text-primary' : 'bg-muted'
            }`}>
              {selectedIds.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('order')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'order'
                ? 'bg-primary text-white'
                : 'bg-muted'
            }`}
          >
            <ListOrdered className="h-3.5 w-3.5" />
            Order & Review
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
              activeTab === 'order' ? 'bg-white text-primary' : 'bg-muted'
            }`}>
              {orderedQuestions.length}
            </span>
          </button>
        </div>

        {/* Panel: Question Picker */}
        {activeTab === 'pick' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar px-5 pb-4 space-y-3">
            {/* Filters */}
            <div className="flex items-center gap-2 pb-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" />
                <Input
                  placeholder="Search questions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9 text-xs"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[160px] h-8 text-xs">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name_en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))
            ) : allQuestions.length === 0 ? (
              <div className="py-16 text-center">
                <BookOpen className="mx-auto h-8 w-8 mb-2 opacity-40" />
                <p className="text-xs font-semibold">No questions found</p>
              </div>
            ) : (
              allQuestions.map((q) => {
                const selected = selectedIds.includes(q.id)
                const order = orderedQuestions.findIndex((oq) => oq.id === q.id) + 1
                return (
                  <div
                    key={q.id}
                    onClick={() => toggleSelect(q)}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all select-none ${
                      selected
                        ? 'border-primary/30 bg-primary/5 dark:bg-primary/10'
                        : 'border bg-muted/60 hover:bg-muted'
                    }`}
                  >
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() => toggleSelect(q)}
                      className="mt-0.5 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold leading-snug line-clamp-2">
                        {q.question_text_en}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-[10px] font-bold ${difficultyColor[q.difficulty_level] || 'text-muted'}`}>
                          {q.difficulty_level}
                        </span>
                        <span className="text-[10px]">•</span>
                        <span className="text-[10px]">{q.question_type}</span>
                        {q.category && (
                          <>
                            <span className="text-[10px]">•</span>
                            <span className="text-[10px]">{q.category.name_en}</span>
                          </>
                        )}
                        <span className="text-[10px]">•</span>
                        <span className="text-[10px] text-primary font-semibold">{q.xp_value} XP</span>
                      </div>
                    </div>
                    {selected && (
                      <span className="shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-primary text-white text-[10px] font-bold">
                        {order}
                      </span>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Panel: Order & Review */}
        {activeTab === 'order' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar px-5 pb-5 space-y-3">
            {orderedQuestions.length === 0 ? (
              <div className="py-16 text-center">
                <ListOrdered className="mx-auto h-8 w-8 mb-2 opacity-40" />
                <p className="text-xs font-semibold">No questions selected yet</p>
                <p className="text-[10px] mt-1">Switch to "Select Questions" tab to add questions.</p>
              </div>
            ) : (
              orderedQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx) }}
                  onDragLeave={() => setDragOverIdx(null)}
                  onDrop={(e) => handleDrop(e, idx)}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-grab active:cursor-grabbing ${
                    dragOverIdx === idx
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 scale-[1.01]'
                      : 'border bg-muted/60 hover:bg-muted'
                  }`}
                >
                  <GripVertical className="h-4 w-4 shrink-0" />
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold leading-snug line-clamp-1">
                      {q.question_text_en}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={`text-[10px] font-bold ${difficultyColor[q.difficulty_level] || 'text-neutral-400'}`}>
                        {q.difficulty_level}
                      </span>
                      <span className="text-[10px]">•</span>
                      <span className="text-[10px]">{q.question_type}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveOrdered(q.id)}
                    className="shrink-0 p-1 rounded-md hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Remove question"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        <DialogFooter className="px-5 py-4 border-t shrink-0 flex items-center justify-between gap-3">
          <div className="text-[11px]">
            <span className="font-semibold">{orderedQuestions.length}</span> question{orderedQuestions.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="!h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending}
              className="!h-9 text-xs"
            >
              {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Save Questions
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
