import { useState, useEffect } from 'react'
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
import { SearchableSelect } from '@/components/ui/shared/SearchableSelect'
import {
  useCreateLearningPathMutation,
  useUpdateLearningPathMutation,
  useLearningPathsQuery,
} from '../_hooks/useLearningPath'
import { useCategoriesQuery } from '../../_category/_hooks/useCategory'
import { useGradesQuery } from '../../_grade/_hooks/useGrade'
import { useGradeCategoriesQuery } from '../../_grade/_hooks/useGradeCategory'
import type { LearningPathItem } from '../_types/learningpath.types'
import { Loader2, AlertTriangle } from 'lucide-react'

interface LearningPathDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  learningPath: LearningPathItem | null
}

export function LearningPathDialog({ open, onOpenChange, learningPath }: LearningPathDialogProps) {
  const [titleEn, setTitleEn] = useState('')
  const [titleKh, setTitleKh] = useState('')
  const [sequence, setSequence] = useState<number>(1)
  const [gradeId, setGradeId] = useState<string>('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [isActive, setIsActive] = useState(true)
  const [xpReward, setXpReward] = useState<number>(100)
  const [passScorePercentage, setPassScorePercentage] = useState<number>(70)
  const [allowSkip, setAllowSkip] = useState<boolean>(false)
  const [isPublished, setIsPublished] = useState<boolean>(false)

  const [validationError, setValidationError] = useState('')

  const createMutation = useCreateLearningPathMutation()
  const updateMutation = useUpdateLearningPathMutation()

  // Fetch grades for selection
  const { data: gradesResponse, isLoading: gradesLoading } = useGradesQuery(1, 100, '', open)
  const grades = gradesResponse?.data || []

  // Fetch categories for all, or filter by grade
  const { data: allCategoriesResponse, isLoading: allCategoriesLoading } = useCategoriesQuery(1, 100, '', true, open)
  const { data: gradeCategoriesResponse, isLoading: gradeCategoriesLoading } = useGradeCategoriesQuery(gradeId, open && !!gradeId)

  // Fetch existing paths for the selected category & grade to suggest next sequence number
  const { data: existingPathsResponse } = useLearningPathsQuery(1, 100, '', categoryId || undefined, gradeId || undefined, open && !!(categoryId && gradeId))
  const existingPaths = existingPathsResponse?.data || []

  const allCategories = allCategoriesResponse?.data || []
  const availableCategories = gradeId && gradeCategoriesResponse?.data ? gradeCategoriesResponse.data : allCategories

  const gradeSelectOptions = grades.map((g) => ({
    value: g.id,
    label: `${g.name_en} (${g.name_kh})`,
    description: g.name_kh,
  }))

  const categorySelectOptions = availableCategories.map((c) => ({
    value: c.id,
    label: c.name_en,
    description: c.name_kh,
  }))

  const isEditing = !!learningPath
  const isLoading = createMutation.isPending || updateMutation.isPending || gradesLoading || allCategoriesLoading || gradeCategoriesLoading

  useEffect(() => {
    if (open) {
      if (learningPath) {
        setTitleEn(learningPath.title_en)
        setTitleKh(learningPath.title_kh)
        setSequence(learningPath.sequence_order ?? learningPath.sequenceOrder ?? learningPath.sequence ?? 1)
        setGradeId(learningPath.grade_id || '')
        setCategoryId(learningPath.category_id || '')
        setIsActive(learningPath.is_active)
        setXpReward(learningPath.xp_reward ?? learningPath.xpReward ?? 100)
        setPassScorePercentage(learningPath.pass_score_percentage ?? learningPath.passScorePercentage ?? 70)
        setAllowSkip(learningPath.allow_skip ?? learningPath.allowSkip ?? false)
        setIsPublished(learningPath.is_published ?? learningPath.isPublished ?? false)
      } else {
        setTitleEn('')
        setTitleKh('')
        setSequence(1)
        setGradeId('')
        setCategoryId('')
        setIsActive(true)
        setXpReward(100)
        setPassScorePercentage(70)
        setAllowSkip(false)
        setIsPublished(false)
      }
      setValidationError('')
    }
  }, [open, learningPath])

  // Auto-suggest next sequence order when category & grade are selected for a new path
  useEffect(() => {
    if (open && !isEditing && categoryId && gradeId && existingPaths.length > 0) {
      const maxSeq = existingPaths.reduce((max, lp) => Math.max(max, lp.sequence_order ?? lp.sequenceOrder ?? lp.sequence ?? 0), 0)
      setSequence(maxSeq + 1)
    }
  }, [open, categoryId, gradeId, isEditing, existingPaths])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    if (!titleEn.trim() || !titleKh.trim()) {
      setValidationError('Both English and Khmer titles are required')
      return
    }

    if (!gradeId) {
      setValidationError('A Target Grade Level selection is required')
      return
    }

    if (!categoryId) {
      setValidationError('A Category alignment selection is required')
      return
    }

    const payload = {
      titleEn: titleEn.trim(),
      titleKh: titleKh.trim(),
      sequenceOrder: sequence,
      sequence_order: sequence,
      sequence,
      gradeId,
      categoryId,
      isActive,
      isPublished,
      is_published: isPublished,
      xpReward,
      passScorePercentage,
      allowSkip,
    }

    if (isEditing && learningPath) {
      updateMutation.mutate(
        { id: learningPath.id, data: payload },
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
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            {isEditing ? 'Edit Learning Path' : 'Create New Learning Path'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Configure the title, target grade, category alignment, sequence order, and XP completion rules.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="path-title-en">
              English Title <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="path-title-en"
              placeholder="e.g. Unit 1: Introduction to Algebra"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              disabled={isLoading}
              className="h-9.5 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="path-title-kh">
              Khmer Title <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="path-title-kh"
              placeholder="e.g. មេរៀនទី១៖ ពិជគណិតដំបូង"
              value={titleKh}
              onChange={(e) => setTitleKh(e.target.value)}
              disabled={isLoading}
              className="h-9.5 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="path-grade">
                Target Grade Level <span className="text-rose-500">*</span>
              </Label>
              <SearchableSelect
                options={gradeSelectOptions}
                value={gradeId}
                onChange={(val) => {
                  setGradeId(val)
                  setCategoryId('')
                }}
                disabled={isLoading}
                sortable="asc"
                placeholder="Select Grade Level"
                searchPlaceholder="Search grade..."
                triggerClassName="w-full"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="path-category">
                Aligned Category <span className="text-rose-500">*</span>
              </Label>
              <SearchableSelect
                options={categorySelectOptions}
                value={categoryId}
                onChange={setCategoryId}
                disabled={isLoading || !gradeId}
                sortable="asc"
                placeholder={!gradeId ? "Select Grade first" : "Select Category"}
                searchPlaceholder="Search category..."
                triggerClassName="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="path-sequence">Sequence Order</Label>
              <Input
                id="path-sequence"
                type="number"
                min={1}
                value={sequence}
                onChange={(e) => setSequence(Number(e.target.value))}
                disabled={isLoading}
                className="h-9.5 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="path-xp">XP Reward</Label>
              <Input
                id="path-xp"
                type="number"
                min={0}
                value={xpReward}
                onChange={(e) => setXpReward(Number(e.target.value))}
                disabled={isLoading}
                className="h-9.5 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="path-pass">Pass Score (%)</Label>
              <Input
                id="path-pass"
                type="number"
                min={0}
                max={100}
                value={passScorePercentage}
                onChange={(e) => setPassScorePercentage(Number(e.target.value))}
                disabled={isLoading}
                className="h-9.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-2">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted border">
              <div className="space-y-0.5">
                <Label htmlFor="path-skip" className="text-xs font-semibold">Allow Skip</Label>
                <p className="text-[10px] text-muted-foreground">Skip prereqs</p>
              </div>
              <Switch
                id="path-skip"
                checked={allowSkip}
                onCheckedChange={setAllowSkip}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted border">
              <div className="space-y-0.5">
                <Label htmlFor="path-status" className="text-xs font-semibold">Active (Admin)</Label>
                <p className="text-[10px] text-muted-foreground">Admin status</p>
              </div>
              <Switch
                id="path-status"
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted border">
              <div className="space-y-0.5">
                <Label htmlFor="path-published" className="text-xs font-semibold">Published</Label>
                <p className="text-[10px] text-muted-foreground">Mobile feed</p>
              </div>
              <Switch
                id="path-published"
                checked={isPublished}
                onCheckedChange={setIsPublished}
                disabled={isLoading}
              />
            </div>
          </div>

          {validationError && (
            <div className="flex items-start gap-2 p-3 rounded-lg border border-rose-500/10 bg-rose-500/5 text-rose-500">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="text-xs font-medium leading-tight">{validationError}</p>
            </div>
          )}

          <DialogFooter className="pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="text-xs">
              {isLoading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Path'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
