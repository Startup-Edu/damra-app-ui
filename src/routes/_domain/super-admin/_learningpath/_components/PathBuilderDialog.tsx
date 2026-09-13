import { useState, useMemo, useEffect } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { ConfirmationModal } from '@/components/ui/shared'
import {
  useLearningPathQuery,
  useLearningPathsQuery,
  useSyncQuizPackagesMutation,
} from '../_hooks/useLearningPath'
import { useQuizPackagesQuery } from '../../_quizpack/_hooks/useQuizpack'
import type { LearningPathItem } from '../_types/learningpath.types'
import type { QuizPackageItem } from '../../_quizpack/_types/quizpack.types'
import {
  Loader2,
  Plus,
  Trash2,
  Lock,
  Zap,
  Package,
  GripVertical,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  Layers,
  GraduationCap,
  Save,
  RotateCcw,
} from 'lucide-react'
import { toast } from 'sonner'
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
import { cn } from '@/lib/utils'

interface PathBuilderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  learningPath: LearningPathItem | null
}

interface SortableStepRowProps {
  pkg: QuizPackageItem
  index: number
  totalCount: number
  onMoveUp: () => void
  onMoveDown: () => void
  onDetach: (pkg: QuizPackageItem) => void
  disabled?: boolean
}

function SortableStepRow({
  pkg,
  index,
  totalCount,
  onMoveUp,
  onMoveDown,
  onDetach,
  disabled,
}: SortableStepRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pkg.id, disabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const qCount =
    pkg.questions?.length ||
    pkg.package_questions?.length ||
    pkg.questions_per_session ||
    (pkg as any).questionsPerSession ||
    0

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative z-10 flex items-center gap-3 p-3 rounded-xl border border-border bg-card transition-all select-none hover:bg-accent/40 hover:border-primary/40',
        isDragging && 'opacity-25 border-dashed border-primary/60 bg-primary/5'
      )}
    >
      {/* Drag Handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        disabled={disabled}
        className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-accent shrink-0 text-muted-foreground hover:text-foreground touch-none transition-colors"
        title="Drag to re-order roadmap sequence"
        aria-label="Drag to re-order roadmap sequence"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Sequence Step Number */}
      <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0 border border-primary/20">
        {index + 1}
      </span>

      {/* Package Content */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
            Step #{index + 1}
          </span>
          <Badge
            variant={pkg.is_free ? 'success' : 'secondary'}
            className="text-[9px] px-1.5 py-0 uppercase font-bold"
          >
            {pkg.is_free ? 'Free' : `${pkg.price_coins} Coins`}
          </Badge>
          {index > 0 && (
            <Badge variant="secondary" className="text-[9px] gap-1 px-1.5 py-0 text-muted-foreground">
              <Lock className="h-2.5 w-2.5" /> Requires Step #{index}
            </Badge>
          )}
        </div>

        <h4 className="text-xs font-semibold leading-snug truncate text-foreground">{pkg.title}</h4>
        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
          {pkg.description || 'No description provided'}
        </p>

        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
          <span className="font-semibold">
            {qCount} Question{qCount === 1 ? '' : 's'} per session
          </span>
        </div>
      </div>

      {/* Reorder Buttons (Up/Down) & Detach Action */}
      <div className="flex items-center gap-1 shrink-0">
        <div className="flex flex-col gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMoveUp}
            disabled={index === 0 || disabled}
            className="h-5 w-5 text-muted-foreground hover:text-foreground disabled:opacity-20"
            title="Move Step Up"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMoveDown}
            disabled={index === totalCount - 1 || disabled}
            className="h-5 w-5 text-muted-foreground hover:text-foreground disabled:opacity-20"
            title="Move Step Down"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDetach(pkg)}
          disabled={disabled}
          className="!h-7 px-2 text-[11px] text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 ml-1 transition-colors"
          title="Detach from roadmap"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" /> Detach
        </Button>
      </div>
    </div>
  )
}

function StepDragOverlayItem({ pkg, index }: { pkg: QuizPackageItem; index: number }) {
  const qCount =
    pkg.questions?.length ||
    pkg.package_questions?.length ||
    pkg.questions_per_session ||
    (pkg as any).questionsPerSession ||
    0

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-primary bg-card/95 backdrop-blur-xs shadow-2xl scale-[1.01] text-foreground w-full cursor-grabbing ring-4 ring-primary/10">
      <div className="p-1 rounded text-primary shrink-0">
        <GripVertical className="h-4 w-4" />
      </div>
      <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
            Step #{index + 1}
          </span>
          <Badge
            variant={pkg.is_free ? 'success' : 'secondary'}
            className="text-[9px] px-1.5 py-0 uppercase font-bold"
          >
            {pkg.is_free ? 'Free' : `${pkg.price_coins} Coins`}
          </Badge>
        </div>
        <h4 className="text-xs font-semibold leading-snug truncate text-foreground">{pkg.title}</h4>
        <div className="text-[10px] text-muted-foreground mt-0.5">
          {qCount} Question{qCount === 1 ? '' : 's'} per session
        </div>
      </div>
    </div>
  )
}

export function PathBuilderDialog({ open, onOpenChange, learningPath }: PathBuilderDialogProps) {
  const { data: pathResponse, isLoading, refetch } = useLearningPathQuery(
    learningPath?.id || '',
    open && !!learningPath
  )
  const fullPath = pathResponse?.data || learningPath

  // Robust field resolution
  const categoryId =
    fullPath?.category_id || (fullPath as any)?.categoryId || fullPath?.category?.id || ''
  const gradeId =
    fullPath?.grade_id || (fullPath as any)?.gradeId || fullPath?.grade?.id || ''
  const categoryName = fullPath?.category?.name_en || (fullPath?.category as any)?.nameEn || ''
  const gradeName = fullPath?.grade?.name_en || (fullPath?.grade as any)?.nameEn || ''

  const [packageModalOpen, setPackageModalOpen] = useState(false)
  const [packageToDetach, setPackageToDetach] = useState<QuizPackageItem | null>(null)
  const [detachConfirmOpen, setDetachConfirmOpen] = useState(false)

  // Attached packages
  const attachedPackages: QuizPackageItem[] = useMemo(() => {
    return fullPath?.quiz_packages || fullPath?.quizPackages || []
  }, [fullPath?.quiz_packages, fullPath?.quizPackages])

  const [orderedPackages, setOrderedPackages] = useState<QuizPackageItem[]>([])
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([])
  const [activeDragId, setActiveDragId] = useState<string | null>(null)

  useEffect(() => {
    setOrderedPackages(attachedPackages)
  }, [attachedPackages])

  // Is sequence order dirty compared to saved attachedPackages
  const isOrderDirty = useMemo(() => {
    if (orderedPackages.length !== attachedPackages.length) return false
    return orderedPackages.some((p, i) => p.id !== attachedPackages[i]?.id)
  }, [orderedPackages, attachedPackages])

  // Fetch sibling learning paths for the same category and grade to detect duplicates
  const { data: siblingPathsResponse } = useLearningPathsQuery(
    1,
    100,
    '',
    categoryId || undefined,
    gradeId || undefined,
    open && !!(categoryId && gradeId)
  )

  // Map of package IDs attached to other learning paths in the same Grade & Category
  const attachedElsewhereMap = useMemo(() => {
    const map = new Map<string, { pathId: string; pathTitle: string; sequenceOrder?: number }>()
    const paths = siblingPathsResponse?.data || []
    for (const p of paths) {
      if (p.id === fullPath?.id) continue
      const pkgs = p.quiz_packages || p.quizPackages || []
      for (const pkg of pkgs) {
        map.set(pkg.id, {
          pathId: p.id,
          pathTitle: p.title_en || (p as any).titleEn,
          sequenceOrder: p.sequence_order ?? (p as any).sequenceOrder,
        })
      }
    }
    return map
  }, [siblingPathsResponse?.data, fullPath?.id])

  // Quiz Packages for selection filtered by category
  const { data: quizPackagesResponse, isLoading: packagesLoading } = useQuizPackagesQuery(
    1,
    100,
    '',
    categoryId || undefined,
    open && packageModalOpen
  )
  const allQuizPackages = quizPackagesResponse?.data || []

  // Mutation
  const syncPackagesMutation = useSyncQuizPackagesMutation()

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

  const handleOpenPackageSelector = () => {
    setSelectedPackageIds(orderedPackages.map((p) => p.id))
    setPackageModalOpen(true)
  }

  const togglePackageSelection = (pkgId: string) => {
    // If package is already attached elsewhere in this grade, prevent toggling
    if (attachedElsewhereMap.has(pkgId)) return

    if (selectedPackageIds.includes(pkgId)) {
      setSelectedPackageIds(selectedPackageIds.filter((id) => id !== pkgId))
    } else {
      setSelectedPackageIds([...selectedPackageIds, pkgId])
    }
  }

  const handleSavePackages = () => {
    if (!fullPath) return

    // Retain sequence order of already attached packages, append newly added packages to the end
    const retainedIds = orderedPackages.map((p) => p.id).filter((id) => selectedPackageIds.includes(id))
    const newlyAddedIds = selectedPackageIds.filter((id) => !retainedIds.includes(id))
    const finalIds = [...retainedIds, ...newlyAddedIds]

    syncPackagesMutation.mutate(
      { id: fullPath.id, packageIds: finalIds },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast.success('Attached quiz packages updated successfully')
            setPackageModalOpen(false)
            refetch()
          }
        },
        onError: (err: any) => {
          toast.error(err?.error?.details?.[0]?.message || 'Failed to update attached quiz packages')
        },
      }
    )
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDragId(null)
    if (!over || active.id === over.id || !fullPath) return

    const oldIndex = orderedPackages.findIndex((p) => p.id === active.id)
    const newIndex = orderedPackages.findIndex((p) => p.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const newOrder = arrayMove(orderedPackages, oldIndex, newIndex)
    setOrderedPackages(newOrder)
  }

  const handleDragCancel = () => {
    setActiveDragId(null)
  }

  const handleMoveStep = (currentIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= orderedPackages.length) return

    const newOrder = arrayMove(orderedPackages, currentIndex, targetIndex)
    setOrderedPackages(newOrder)
  }

  const handleSaveOrder = () => {
    if (!fullPath) return
    syncPackagesMutation.mutate(
      { id: fullPath.id, packageIds: orderedPackages.map((p) => p.id) },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast.success('Roadmap step sequence saved successfully')
            refetch()
          }
        },
        onError: (err: any) => {
          toast.error(err?.error?.details?.[0]?.message || 'Failed to save package sequence')
        },
      }
    )
  }

  const handleResetOrder = () => {
    setOrderedPackages(attachedPackages)
  }

  const handleOpenDetachConfirmation = (pkg: QuizPackageItem) => {
    setPackageToDetach(pkg)
    setDetachConfirmOpen(true)
  }

  const handleConfirmDetach = () => {
    if (!fullPath || !packageToDetach) return
    const updatedIds = orderedPackages.filter((p) => p.id !== packageToDetach.id).map((p) => p.id)
    syncPackagesMutation.mutate(
      { id: fullPath.id, packageIds: updatedIds },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast.success(`Detached "${packageToDetach.title}" from roadmap`)
            setDetachConfirmOpen(false)
            setPackageToDetach(null)
            refetch()
          }
        },
        onError: (err: any) => {
          toast.error(err?.error?.details?.[0]?.message || 'Failed to detach quiz package')
        },
      }
    )
  }

  const activeDraggedPackage = useMemo(() => {
    if (!activeDragId) return null
    return orderedPackages.find((p) => p.id === activeDragId) || null
  }, [activeDragId, orderedPackages])

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] w-[95vw] max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-5 pb-4 border-b shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-4">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500 shrink-0" />
                  <span>Journey Roadmap: {fullPath?.title_en}</span>
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {gradeName && (
                    <Badge variant="outline" className="text-[10px] gap-1 py-0 h-5">
                      <GraduationCap className="h-3 w-3 text-muted-foreground" />
                      {gradeName}
                    </Badge>
                  )}
                  {categoryName && (
                    <Badge variant="outline" className="text-[10px] gap-1 py-0 h-5">
                      <Layers className="h-3 w-3 text-muted-foreground" />
                      {categoryName}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    Step-by-step sequential roadmap for students
                  </span>
                </div>
              </div>
              <Button
                type="button"
                onClick={handleOpenPackageSelector}
                disabled={syncPackagesMutation.isPending}
                className="text-xs !h-8.5 gap-1.5 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" /> Attach Quiz Packages ({orderedPackages.length})
              </Button>
            </div>
          </DialogHeader>

          {/* Stepper Viewport with Reordering */}
          <div className="flex-1 min-h-0 w-full p-6 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-xs text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading roadmap steps...
              </div>
            ) : orderedPackages.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <Package className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
                <p className="text-xs font-semibold text-muted-foreground">
                  No Quiz Packages attached to this learning path roadmap yet.
                </p>
                <Button type="button" onClick={handleOpenPackageSelector} variant="outline" size="sm" className="text-xs">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Select Quiz Packages to Attach
                </Button>
              </div>
            ) : (
              <div className="max-w-xl mx-auto space-y-3 relative">
                <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5">
                    <span>Sequential Steps (drag or use arrows to reorder):</span>
                    {isOrderDirty && (
                      <Badge variant="secondary" className="text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 py-0 px-1.5 animate-pulse">
                        Unsaved sequence order
                      </Badge>
                    )}
                  </span>
                  <span>{orderedPackages.length} package{orderedPackages.length === 1 ? '' : 's'}</span>
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  modifiers={[restrictToVerticalAxis]}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragCancel={handleDragCancel}
                >
                  <SortableContext
                    items={orderedPackages.map((p) => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2.5">
                      {orderedPackages.map((pkg, index) => (
                        <SortableStepRow
                          key={pkg.id}
                          pkg={pkg}
                          index={index}
                          totalCount={orderedPackages.length}
                          onMoveUp={() => handleMoveStep(index, 'up')}
                          onMoveDown={() => handleMoveStep(index, 'down')}
                          onDetach={handleOpenDetachConfirmation}
                          disabled={syncPackagesMutation.isPending}
                        />
                      ))}
                    </div>
                  </SortableContext>

                  {/* Portaled DragOverlay so fixed positioning is relative to viewport, not affected by Dialog CSS transforms */}
                  {createPortal(
                    <DragOverlay zIndex={1000} dropAnimation={{ duration: 150, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' }}>
                      {activeDraggedPackage ? (() => {
                        const activeIndex = orderedPackages.findIndex((p) => p.id === activeDraggedPackage.id)
                        return (
                          <StepDragOverlayItem
                            pkg={activeDraggedPackage}
                            index={activeIndex}
                          />
                        )
                      })() : null}
                    </DragOverlay>,
                    document.body
                  )}
                </DndContext>
              </div>
            )}
          </div>

          <DialogFooter className="p-4 border-t shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOrderDirty && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetOrder}
                  disabled={syncPackagesMutation.isPending}
                  className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset Order
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isOrderDirty && (
                <Button
                  type="button"
                  onClick={handleSaveOrder}
                  disabled={syncPackagesMutation.isPending}
                  className="h-8 text-xs gap-1.5"
                >
                  {syncPackagesMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Save Roadmap Order
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-8 text-xs">
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SELECT QUIZ PACKAGES FOR LEARNING PATH */}
      <Dialog open={packageModalOpen} onOpenChange={setPackageModalOpen}>
        <DialogContent className="sm:max-w-[660px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-5 pb-3 border-b shrink-0">
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Attach Quiz Packages to Learning Path
            </DialogTitle>
            <DialogDescription className="text-xs">
              Select Quiz Packages from this category to attach as sequential roadmap steps.
            </DialogDescription>
          </DialogHeader>

          {/* Informational Grade Roadmap Protection Banner */}
          <div className="p-4 pb-0">
            <div className="flex items-start gap-2.5 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
              <div className="space-y-0.5">
                <div className="font-bold text-[11px]">Grade Roadmap Protection</div>
                <div className="text-[11px] leading-relaxed opacity-90">
                  Quiz Packages already assigned to another Learning Path in{' '}
                  <span className="font-bold">{gradeName || 'this Grade'}</span> are locked to prevent duplicate roadmap steps for students.
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 p-4 pt-3 overflow-y-auto custom-scrollbar">
            {packagesLoading ? (
              <div className="flex justify-center py-10 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading Quiz Packages...
              </div>
            ) : allQuizPackages.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted-foreground">
                No Quiz Packages found for this category. Please create Quiz Packages in Super Admin &gt; Quiz Packages first.
              </div>
            ) : (
              <div className="space-y-2">
                {allQuizPackages.map((pkg) => {
                  const attachedInfo = attachedElsewhereMap.get(pkg.id)
                  const isAttachedElsewhere = !!attachedInfo
                  const isChecked = selectedPackageIds.includes(pkg.id)
                  const qCount =
                    pkg.questions?.length ||
                    pkg.package_questions?.length ||
                    pkg.questions_per_session ||
                    (pkg as any).questionsPerSession ||
                    0

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => !isAttachedElsewhere && togglePackageSelection(pkg.id)}
                      className={cn(
                        'p-3 rounded-xl border flex items-center justify-between transition-all select-none',
                        isAttachedElsewhere
                          ? 'opacity-60 bg-muted/30 border-dashed border-border cursor-not-allowed'
                          : isChecked
                            ? 'bg-primary/5 border-primary/40 cursor-pointer shadow-xs'
                            : 'bg-card hover:bg-accent/40 border-border cursor-pointer'
                      )}
                    >
                      <div className="flex items-start gap-3 min-w-0 pr-3">
                        <Checkbox
                          checked={isChecked}
                          disabled={isAttachedElsewhere}
                          onCheckedChange={() => !isAttachedElsewhere && togglePackageSelection(pkg.id)}
                          className="mt-0.5"
                        />
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold leading-snug truncate">
                              {pkg.title}
                            </span>
                            {isAttachedElsewhere && (
                              <Badge
                                variant="outline"
                                className="text-[10px] text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 font-semibold px-1.5 py-0"
                              >
                                Attached to: {attachedInfo.pathTitle} (Step #{attachedInfo.sequenceOrder})
                              </Badge>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground block truncate">
                            {pkg.description || 'No description provided'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-[10px]">
                          {qCount} Qs
                        </Badge>
                        <Badge
                          variant={pkg.is_free ? 'success' : 'secondary'}
                          className="text-[9px] uppercase font-bold"
                        >
                          {pkg.is_free ? 'Free' : `${pkg.price_coins} Coins`}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <DialogFooter className="p-4 border-t shrink-0 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Selected: <span className="font-bold text-foreground">{selectedPackageIds.length}</span> package{selectedPackageIds.length === 1 ? '' : 's'}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPackageModalOpen(false)}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSavePackages}
                disabled={syncPackagesMutation.isPending}
                className="h-8 text-xs"
              >
                {syncPackagesMutation.isPending && (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                )}
                Save Attached Packages ({selectedPackageIds.length})
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DETACH QUIZ PACKAGE CONFIRMATION MODAL */}
      <ConfirmationModal
        open={detachConfirmOpen}
        onOpenChange={setDetachConfirmOpen}
        variant="warning"
        title="Detach Quiz Package?"
        description={
          <>
            Are you sure you want to detach{' '}
            <span className="font-semibold text-foreground">"{packageToDetach?.title}"</span>{' '}
            from this learning path roadmap? Students will no longer see this package in the roadmap sequence.
          </>
        }
        confirmText="Detach Package"
        onConfirm={handleConfirmDetach}
        isPending={syncPackagesMutation.isPending}
      />
    </>
  )
}
