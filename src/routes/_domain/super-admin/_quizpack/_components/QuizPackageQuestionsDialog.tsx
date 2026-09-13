import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { SearchableSelect } from '@/components/ui/shared/SearchableSelect'
import { SearchInput } from '@/components/ui/shared'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import {
  Loader2,
  GripVertical,
  BookOpen,
  ListOrdered,
  CheckSquare,
  Sparkles,
  X,
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

  const diff = question.difficulty_level || 'EASY'
  const textPreview = cleanText(question.question_text_en)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border border-border bg-card transition-all select-none hover:bg-accent/40",
        isDragging && "opacity-25 border-dashed border-primary/60 bg-primary/5"
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-accent shrink-0 text-muted-foreground hover:text-foreground touch-none transition-colors"
        title="Drag to re-order"
        aria-label="Drag to re-order"
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
          {question.category && (
            <>
              <span className="text-[10px]">•</span>
              <span className="text-[10px] truncate max-w-[120px]">{question.category.name_en}</span>
            </>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onRemove(question.id)}
        className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
        title="Remove question"
        aria-label="Remove question"
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
  const diff = question.difficulty_level || 'EASY'
  const textPreview = cleanText(question.question_text_en)

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-primary bg-card/95 backdrop-blur-xs shadow-2xl scale-[1.01] text-foreground w-full cursor-grabbing ring-4 ring-primary/10">
      <div className="p-1 rounded shrink-0 text-primary">
        <GripVertical className="h-4 w-4" />
      </div>
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
          {question.category && (
            <>
              <span className="text-[10px]">•</span>
              <span className="text-[10px] truncate max-w-[120px]">{question.category.name_en}</span>
            </>
          )}
        </div>
      </div>
      <div className="shrink-0 p-1.5 opacity-0">
        <X className="h-3.5 w-3.5" />
      </div>
    </div>
  )
}

interface QuizPackageQuestionsContentProps {
  quizpack: QuizPackageItem
  initialQuestions: QuestionItem[]
  onClose: () => void
}

function QuizPackageQuestionsContent({
  quizpack,
  initialQuestions,
  onClose,
}: QuizPackageQuestionsContentProps) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 350)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>(() => initialQuestions.map((q) => q.id))
  const [orderedQuestions, setOrderedQuestions] = useState<QuestionItem[]>(() => initialQuestions)
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

  // Fetch question bank
  const { data: questionsRes, isLoading: questionsLoading } = useQuestionsQuery(
    1,
    100,
    debouncedSearch,
    filterCategory === 'all' ? undefined : filterCategory,
    undefined
  )

  // Fetch categories for filter
  const { data: categoriesRes } = useCategoriesQuery(1, 100, '', true)

  const categoryOptions = useMemo(() => {
    const cats = categoriesRes?.data || []
    return [
      { value: 'all', label: 'All Categories' },
      ...cats.map((c) => ({
        value: c.id,
        label: c.name_kh ? `${c.name_en} (${c.name_kh})` : c.name_en,
      })),
    ]
  }, [categoriesRes?.data])

  const allQuestions = questionsRes?.data || []

  const toggleSelect = (q: QuestionItem) => {
    const isCurrentlySelected = selectedIds.includes(q.id)
    if (isCurrentlySelected) {
      setSelectedIds((prev) => prev.filter((id) => id !== q.id))
      setOrderedQuestions((prev) => prev.filter((oq) => oq.id !== q.id))
    } else {
      setSelectedIds((prev) => [...prev, q.id])
      setOrderedQuestions((prev) => {
        if (prev.some((oq) => oq.id === q.id)) return prev
        return [...prev, q]
      })
    }
  }

  const handleSelectAllShown = () => {
    if (allQuestions.length === 0) return
    const newQuestions = allQuestions.filter((q) => !selectedIds.includes(q.id))
    if (newQuestions.length === 0) return

    setSelectedIds((prev) => [...prev, ...newQuestions.map((q) => q.id)])
    setOrderedQuestions((prev) => [...prev, ...newQuestions])
  }

  const handleDeselectAllShown = () => {
    if (allQuestions.length === 0) return
    const shownIds = new Set(allQuestions.map((q) => q.id))
    setSelectedIds((prev) => prev.filter((id) => !shownIds.has(id)))
    setOrderedQuestions((prev) => prev.filter((q) => !shownIds.has(q.id)))
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

  const handleDragCancel = () => {
    setActiveDragId(null)
  }

  const handleSave = () => {
    syncMutation.mutate(
      { id: quizpack.id, data: { questionIds: orderedQuestions.map((q) => q.id) } },
      {
        onSuccess: (res) => {
          if (res.success) onClose()
        },
      }
    )
  }

  const difficultyColor: Record<string, string> = {
    EASY: 'text-emerald-500',
    MEDIUM: 'text-amber-500',
    HARD: 'text-rose-500',
  }

  const allShownSelected = allQuestions.length > 0 && allQuestions.every((q) => selectedIds.includes(q.id))
  const isPending = syncMutation.isPending

  return (
    <>
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
      <div className="flex items-center justify-between px-6 pt-3.5 pb-3 shrink-0 border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('pick')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'pick'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <CheckSquare className="h-3.5 w-3.5" />
            Select Questions
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                activeTab === 'pick' ? 'bg-primary-foreground text-primary' : 'bg-background'
              }`}
            >
              {selectedIds.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('order')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'order'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <ListOrdered className="h-3.5 w-3.5" />
            Order & Review
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                activeTab === 'order' ? 'bg-primary-foreground text-primary' : 'bg-background'
              }`}
            >
              {orderedQuestions.length}
            </span>
          </button>
        </div>

        {activeTab === 'pick' && allQuestions.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground"
              onClick={allShownSelected ? handleDeselectAllShown : handleSelectAllShown}
            >
              {allShownSelected ? 'Deselect visible' : 'Select all visible'}
            </Button>
          </div>
        )}
      </div>

      {/* Panel: Question Picker */}
      {activeTab === 'pick' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3 min-h-0">
          {/* Filters */}
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <SearchInput
              placeholder="Search questions by text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              containerClassName="flex-1 min-w-[200px]"
            />

            <SearchableSelect
              options={categoryOptions}
              value={filterCategory}
              onChange={(val) => setFilterCategory(val || 'all')}
              placeholder="All Categories"
              searchPlaceholder="Search category..."
              triggerClassName="w-[180px] h-8.5 text-xs"
            />
          </div>

          {questionsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : allQuestions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs">
              <Sparkles className="h-7 w-7 mx-auto mb-2 opacity-30" />
              No questions found. Try adjusting filters or search.
            </div>
          ) : (
            allQuestions.map((q) => {
              const isSelected = selectedIds.includes(q.id)
              const diff = q.difficulty_level || 'EASY'
              const textPreview = cleanText(q.question_text_en)
              return (
                <div
                  key={q.id}
                  onClick={() => toggleSelect(q)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'border-primary/50 bg-primary/5 dark:bg-primary/10 shadow-xs'
                      : 'border-border bg-card hover:bg-accent/50'
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelect(q)}
                    className="shrink-0"
                    onClick={(e) => e.stopPropagation()}
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
                          <span className="text-[10px] truncate max-w-[150px]">
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
              <p className="text-[10px] mt-1 text-muted-foreground">Switch to "Select Questions" tab to pick questions for this package.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('pick')}
                className="mt-3 text-xs"
              >
                <CheckSquare className="h-3.5 w-3.5 mr-1.5" />
                Go to Question Picker
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
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

              {/* Portaled DragOverlay so fixed positioning is relative to viewport, not affected by Dialog CSS transforms */}
              {createPortal(
                <DragOverlay zIndex={1000} dropAnimation={{ duration: 150, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' }}>
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
                </DragOverlay>,
                document.body
              )}
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
            onClick={onClose}
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
    </>
  )
}

export function QuizPackageQuestionsDialog({
  open,
  onOpenChange,
  quizpack,
}: QuizPackageQuestionsDialogProps) {
  // Fetch current package data when dialog is opened
  const { data: pkgRes, isLoading: pkgLoading } = useQuizPackageQuery(quizpack.id, open)

  const attachedQuestions = useMemo(() => {
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

    return attached.filter(
      (q, index, self) => self.findIndex((item) => item.id === q.id) === index
    )
  }, [pkgRes?.data])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px] w-full max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        {pkgLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <div className="space-y-2 pt-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
          <QuizPackageQuestionsContent
            key={`${quizpack.id}-${open ? 'open' : 'closed'}`}
            quizpack={quizpack}
            initialQuestions={attachedQuestions}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
