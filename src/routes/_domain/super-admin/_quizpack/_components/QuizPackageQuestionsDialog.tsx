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
import { SearchableSelect } from '@/components/ui/shared/SearchableSelect'
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
import { cleanText, cn } from '@/lib/utils'
import type { QuizPackageItem } from '../_types/quizpack.types'
import type { QuestionItem } from '../../_question/_types/question.types'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

interface QuizPackageQuestionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quizpack: QuizPackageItem
}

interface SortableQuestionRowProps {
  question: QuestionItem
  index: number
  onRemove: (id: string) => void
  difficultyColor: Record<string, string>
}

function SortableQuestionRow({
  question,
  index,
  onRemove,
  difficultyColor,
}: SortableQuestionRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const diff = question.difficulty_level || (question as any).difficulty || 'EASY'
  const textPreview = cleanText(question.question_text_en)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border border-border bg-card transition-all select-none hover:bg-accent/40",
        isDragging && "opacity-30 border-primary/50"
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-accent shrink-0 text-muted-foreground hover:text-foreground touch-none"
        title="Drag to re-order"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
        {index + 1}
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
          <span className="text-[10px] uppercase font-medium">{question.question_type}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onRemove(question.id)}
        className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
        title="Remove question"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function QuestionDragOverlayItem({
  question,
  index,
  difficultyColor,
}: {
  question: QuestionItem
  index: number
  difficultyColor: Record<string, string>
}) {
  const diff = question.difficulty_level || (question as any).difficulty || 'EASY'
  const textPreview = cleanText(question.question_text_en)

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-primary bg-popover shadow-2xl scale-[1.02] text-popover-foreground">
      <GripVertical className="h-4 w-4 text-primary shrink-0" />
      <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0">
        {index + 1}
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
          <span className="text-[10px] uppercase font-medium">{question.question_type}</span>
        </div>
      </div>
    </div>
  )
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
  const [activeDragId, setActiveDragId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setOrderedQuestions((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        const updated = arrayMove(items, oldIndex, newIndex)
        setSelectedIds(updated.map((q) => q.id))
        return updated
      })
    }
    setActiveDragId(null)
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
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-8.5 text-xs"
                />
              </div>

              <SearchableSelect
                options={categoryOptions}
                value={filterCategory}
                onChange={(val) => setFilterCategory(val || 'all')}
                placeholder="All Categories"
                searchPlaceholder="Search category..."
                triggerClassName="w-[180px] h-8.5 text-xs"
              />
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : allQuestions.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs">
                No questions found. Try adjusting filters or search.
              </div>
            ) : (
              allQuestions.map((q) => {
                const isSelected = selectedIds.includes(q.id)
                const diff = q.difficulty_level || (q as any).difficulty || 'EASY'
                const textPreview = cleanText(q.question_text_en)
                return (
                  <div
                    key={q.id}
                    onClick={() => toggleSelect(q)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary/50 bg-primary/5 dark:bg-primary/10'
                        : 'border-border bg-card hover:bg-accent/50'
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(q)}
                      className="shrink-0"
                    />
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
                        {q.category && (
                          <>
                            <span className="text-[10px]">•</span>
                            <span className="text-[10px]">
                              {q.category.name_en}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={orderedQuestions.map((q) => q.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2.5">
                    {orderedQuestions.map((q, idx) => (
                      <SortableQuestionRow
                        key={q.id}
                        question={q}
                        index={idx}
                        onRemove={handleRemoveOrdered}
                        difficultyColor={difficultyColor}
                      />
                    ))}
                  </div>
                </SortableContext>

                <DragOverlay>
                  {activeDragId ? (() => {
                    const activeIndex = orderedQuestions.findIndex((q) => q.id === activeDragId)
                    const activeQuestion = orderedQuestions[activeIndex]
                    if (!activeQuestion) return null
                    return (
                      <QuestionDragOverlayItem
                        question={activeQuestion}
                        index={activeIndex}
                        difficultyColor={difficultyColor}
                      />
                    )
                  })() : null}
                </DragOverlay>
              </DndContext>
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
