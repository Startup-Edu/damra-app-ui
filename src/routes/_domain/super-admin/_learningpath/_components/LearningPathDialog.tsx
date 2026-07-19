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
import {
  useCreateLearningPathMutation,
  useUpdateLearningPathMutation,
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

  const [validationError, setValidationError] = useState('')

  const createMutation = useCreateLearningPathMutation()
  const updateMutation = useUpdateLearningPathMutation()

  // Fetch grades for selection
  const { data: gradesResponse, isLoading: gradesLoading } = useGradesQuery(1, 100, '')
  const grades = gradesResponse?.data || []

  // Fetch categories for all, or filter by grade
  const { data: allCategoriesResponse, isLoading: allCategoriesLoading } = useCategoriesQuery(1, 100, '', true)
  const { data: gradeCategoriesResponse, isLoading: gradeCategoriesLoading } = useGradeCategoriesQuery(gradeId, !!gradeId)

  const allCategories = allCategoriesResponse?.data || []
  const availableCategories = gradeId && gradeCategoriesResponse?.data ? gradeCategoriesResponse.data : allCategories

  const isEditing = !!learningPath
  const isLoading = createMutation.isPending || updateMutation.isPending || gradesLoading || allCategoriesLoading || gradeCategoriesLoading

  useEffect(() => {
    if (open) {
      if (learningPath) {
        setTitleEn(learningPath.title_en)
        setTitleKh(learningPath.title_kh)
        setSequence(learningPath.sequence)
        setGradeId(learningPath.grade_id || '')
        setCategoryId(learningPath.category_id || '')
        setIsActive(learningPath.is_active)
      } else {
        setTitleEn('')
        setTitleKh('')
        setSequence(1)
        setGradeId('')
        setCategoryId('')
        setIsActive(true)
      }
      setValidationError('')
    }
  }, [open, learningPath])

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
      sequence,
      gradeId,
      categoryId,
      isActive,
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader className="space-y-1.5 border-b pb-4">
          <DialogTitle className="text-lg font-bold">
            {isEditing ? 'Modify Learning Path' : 'Create Learning Path'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing
              ? 'Update the learning path roadmap details, sequencing, and category/grade alignments.'
              : 'Add a new learning path roadmap for Duolingo-style progression.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="path-title-en">
                English Title <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="path-title-en"
                placeholder="e.g. Unit 1: Algebra Fundamentals"
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
                placeholder="e.g. មេរៀនទី១៖ មូលដ្ឋានគ្រឹះពិជគណិត"
                value={titleKh}
                onChange={(e) => setTitleKh(e.target.value)}
                disabled={isLoading}
                className="h-9.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="path-grade">
                Target Grade Level <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={gradeId}
                onValueChange={(val) => {
                  setGradeId(val)
                  setCategoryId('')
                }}
                disabled={isLoading}
              >
                <SelectTrigger id="path-grade" className="w-full h-9.5 text-xs border border-input">
                  <SelectValue placeholder="Select Grade Level" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name_en} ({g.name_kh})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="path-category">
                Aligned Category <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={categoryId}
                onValueChange={setCategoryId}
                disabled={isLoading || !gradeId}
              >
                <SelectTrigger id="path-category" className="w-full h-9.5 text-xs border border-input">
                  <SelectValue placeholder={!gradeId ? "Select Grade first" : "Select Category"} />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="path-sequence">
              Sequence Order (Roadmap Index)
            </Label>
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

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted border mt-2">
            <div className="space-y-0.5">
              <Label htmlFor="path-status">
                Active Status
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Inactive learning paths will be hidden from mobile roadmap feeds.
              </p>
            </div>
            <Switch
              id="path-status"
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={isLoading}
            />
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
