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
import { SearchableSelect } from '@/components/ui/searchable-select'
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
import { cleanText } from '@/lib/utils'
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
    1, 100, search,
    filterCategory === 'all' ? undefined : filterCategory,
    undefined
  )

  // Fetch categories for filter
  const { data: categoriesRes } = useCategoriesQuery(1, 100, '', true)
  const categories = categoriesRes?.data || []

  const categoryOptions = useMemo(() => [
    { value: 'all', label: 'All Categories' },
    ...categories.map((c) => ({
      value: c.id,
      label: c.name_kh ? `${c.name_en} (${c.name_kh})` : c.name_en,
    })),
  ], [categories])

  const allQuestions = questionsRes?.data || []

  // On open, preload selections from existing attached questions
  useEffect(() => {
    if (!open) return
    if (pkgLoading) return
    const rawPkg = pkgRes?.data
    let attached: QuestionItem[] = []
    if (rawPkg?.questions && Array.isArray(rawPkg.questions)) {
      attached = rawPkg.questions
    } else if (rawPkg?.package_questions && Array.isArray(rawPkg.package_questions)) {
      attached = [...rawPkg.package_questions]
        .sort((a, b) => a.sequence_order - b.sequence_order)
        .map((pq) => pq.question)
        .filter(Boolean)
    }

    const uniqueAttached = attached.filter(
      (q, index, self) => self.findIndex((item) => item.id === q.id) === index
    )
    const ids = uniqueAttached.map((q) => q.id)
    setSelectedIds(ids)
    setOrderedQuestions(uniqueAttached)
    setSearch('')
    setFilterCategory('all')
    setActiveTab('pick')
  }, [open, pkgLoading, pkgRes])

  const toggleSelect = (q: QuestionItem) => {
    setSelectedIds((prevIds) => {
      if (prevIds.includes(q.id)) {
        setOrderedQuestions((prevOrders) => prevOrders.filter((oq) => oq.id !== q.id))
        return prevIds.filter((id) => id !== q.id)
      } else {
        setOrderedQuestions((prevOrders) => {
          if (prevOrders.some((oq) => oq.id === q.id)) return prevOrders
          return [...prevOrders, q]
        })
        if (prevIds.includes(q.id)) return prevIds
        return [...prevIds, q.id]
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
      <DialogContent className="sm:max-w-[850px] w-full max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b shrink-0">
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
        <div className="flex items-center gap-3 px-6 pt-3.5 pb-3 shrink-0 border-b bg-muted/20">
          <button
            type="button"
            onClick={() => setActiveTab('pick')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'pick'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <CheckSquare className="h-3.5 w-3.5" />
            Select Questions
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
              activeTab === 'pick' ? 'bg-primary-foreground text-primary' : 'bg-background'
            }`}>
              {selectedIds.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('order')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'order'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <ListOrdered className="h-3.5 w-3.5" />
            Order & Review
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
              activeTab === 'order' ? 'bg-primary-foreground text-primary' : 'bg-background'
            }`}>
              {orderedQuestions.length}
            </span>
          </button>
        </div>

        {/* Panel: Question Picker */}
        {activeTab === 'pick' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3 min-h-0">
            {/* Filters */}
            <div className="flex items-center gap-3 pb-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search questions by text..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9 text-xs"
                />
              </div>
              <SearchableSelect
                options={categoryOptions}
                value={filterCategory}
                onChange={setFilterCategory}
                placeholder="All Categories"
                searchPlaceholder="Search category..."
                className="w-[200px]"
              />
            </div>

            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))
            ) : allQuestions.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center space-y-2">
                <BookOpen className="h-8 w-8 mb-1 opacity-40" />
                <p className="text-xs font-semibold">No questions found</p>
                {(filterCategory !== 'all' || search) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilterCategory('all')
                      setSearch('')
                    }}
                    className="text-xs h-8 mt-2"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              allQuestions.map((q) => {
                const selected = selectedIds.includes(q.id)
                const order = orderedQuestions.findIndex((oq) => oq.id === q.id) + 1
                const diff = q.difficulty_level || (q as any).difficulty || 'EASY'
                const textPreview = cleanText(q.question_text_en)
                const khmerTextPreview = cleanText(q.question_text_kh)
                return (
                  <div
                    key={q.id}
                    onClick={() => toggleSelect(q)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all select-none ${
                      selected
                        ? 'border-primary/40 bg-primary/5 dark:bg-primary/10 shadow-xs'
                        : 'border-border bg-card hover:bg-accent/40'
                    }`}
                  >
                    <Checkbox
                      checked={selected}
                      className="mt-0.5 shrink-0 pointer-events-none"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold leading-snug line-clamp-2">
                        {textPreview}
                      </div>
                      {khmerTextPreview && (
                        <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {khmerTextPreview}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap text-muted-foreground">
                        <span className={`text-[10px] font-bold ${difficultyColor[diff] || 'text-muted-foreground'}`}>
                          {diff}
                        </span>
                        <span className="text-[10px]">•</span>
                        <span className="text-[10px] uppercase font-medium">{q.question_type}</span>
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
                      <span className="shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
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
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3 min-h-0">
            {orderedQuestions.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <ListOrdered className="mx-auto h-8 w-8 mb-2 opacity-40" />
                <p className="text-xs font-semibold">No questions selected yet</p>
                <p className="text-[10px] mt-1">Switch to "Select Questions" tab to add questions.</p>
              </div>
            ) : (
              orderedQuestions.map((q, idx) => {
                const diff = q.difficulty_level || (q as any).difficulty || 'EASY'
                const textPreview = cleanText(q.question_text_en)
                return (
                  <div
                    key={q.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx) }}
                    onDragLeave={() => setDragOverIdx(null)}
                    onDrop={(e) => handleDrop(e, idx)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
                      dragOverIdx === idx
                        ? 'border-primary bg-primary/5 dark:bg-primary/10 scale-[1.01]'
                        : 'border-border bg-card hover:bg-accent/40'
                    }`}
                  >
                    <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold leading-snug line-clamp-1">
                        {textPreview}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap text-muted-foreground">
                        <span className={`text-[10px] font-bold ${difficultyColor[diff] || 'text-muted-foreground'}`}>
                          {diff}
                        </span>
                        <span className="text-[10px]">•</span>
                        <span className="text-[10px] uppercase font-medium">{q.question_type}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveOrdered(q.id)}
                      className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Remove question"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        )}

        <DialogFooter className="p-6 pt-3.5 border-t shrink-0 flex items-center justify-between gap-3">
          <div className="text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">{orderedQuestions.length}</span> question{orderedQuestions.length !== 1 ? 's' : ''} selected
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
              type="button"
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
