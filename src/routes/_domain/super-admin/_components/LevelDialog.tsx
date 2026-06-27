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
  useCreateLevelMutation,
  useUpdateLevelMutation,
} from '../_hooks/useLevel'
import { useCategoriesQuery } from '../_hooks/useCategory'
import { useGradesQuery } from '../_hooks/useGrade'
import type { LevelItem } from '../_types/level.types'
import { Loader2, AlertTriangle } from 'lucide-react'

interface LevelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  level: LevelItem | null
}

export function LevelDialog({ open, onOpenChange, level }: LevelDialogProps) {
  const [titleEn, setTitleEn] = useState('')
  const [titleKh, setTitleKh] = useState('')
  const [sequence, setSequence] = useState<number | ''>('')
  const [categoryId, setCategoryId] = useState('')
  const [gradeId, setGradeId] = useState('')
  const [isActive, setIsActive] = useState(true)

  const [validationError, setValidationError] = useState('')

  const createMutation = useCreateLevelMutation()
  const updateMutation = useUpdateLevelMutation()

  // Fetch active categories and grades for dropdown selectors (limit 100 to get them all)
  const { data: categoriesResponse, isLoading: categoriesLoading } = useCategoriesQuery(1, 100, '', true)
  const { data: gradesResponse, isLoading: gradesLoading } = useGradesQuery(1, 100, '')

  const categories = categoriesResponse?.data || []
  const grades = gradesResponse?.data || []

  const isEditing = !!level
  const isLoading = createMutation.isPending || updateMutation.isPending || categoriesLoading || gradesLoading

  useEffect(() => {
    if (open) {
      if (level) {
        setTitleEn(level.title_en)
        setTitleKh(level.title_kh)
        setSequence(level.sequence)
        setCategoryId(level.category_id)
        setGradeId(level.grade_id)
        setIsActive(level.is_active)
      } else {
        setTitleEn('')
        setTitleKh('')
        setSequence('')
        setCategoryId('')
        setGradeId('')
        setIsActive(true)
      }
      setValidationError('')
    }
  }, [open, level])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    if (!titleEn.trim() || !titleKh.trim()) {
      setValidationError('Both English and Khmer titles are required')
      return
    }

    if (sequence === '' || isNaN(sequence) || sequence < 0) {
      setValidationError('Sequence must be a non-negative integer')
      return
    }

    if (!categoryId || categoryId === 'none') {
      setValidationError('Please select a Category')
      return
    }

    if (!gradeId || gradeId === 'none') {
      setValidationError('Please select a Grade')
      return
    }

    const payload = {
      titleEn: titleEn.trim(),
      titleKh: titleKh.trim(),
      sequence: Number(sequence),
      categoryId,
      gradeId,
      isActive,
    }

    if (isEditing && level) {
      updateMutation.mutate(
        { id: level.id, data: payload },
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
      <DialogContent className="sm:max-w-[500px] text-slate-900 dark:text-slate-50 border border-slate-100 dark:border-slate-800 shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-lg font-bold">
            {isEditing ? 'Modify Level details' : 'Create New Level'}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            {isEditing
              ? 'Update title strings, sequence position, or roadmap categories.'
              : 'Add a new difficulty level slot under a category and grade roadmap.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="level-title-en" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                English Title <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="level-title-en"
                placeholder="e.g. Level 1"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                disabled={isLoading}
                className="h-9.5 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="level-title-kh" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Khmer Title <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="level-title-kh"
                placeholder="e.g. កម្រិត ១"
                value={titleKh}
                onChange={(e) => setTitleKh(e.target.value)}
                disabled={isLoading}
                className="h-9.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="level-category" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Associated Category <span className="text-rose-500">*</span>
              </Label>
              <Select value={categoryId} onValueChange={setCategoryId} disabled={isLoading}>
                <SelectTrigger id="level-category" className="w-full h-9.5 text-xs border border-input">
                  <SelectValue placeholder="Select a category..." />
                </SelectTrigger>
                <SelectContent>
                  {categoriesLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading categories...
                    </SelectItem>
                  ) : categories.length === 0 ? (
                    <SelectItem value="no-categories" disabled>
                      No active categories found
                    </SelectItem>
                  ) : (
                    categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name_en} ({c.name_kh})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="level-grade" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Associated Grade <span className="text-rose-500">*</span>
              </Label>
              <Select value={gradeId} onValueChange={setGradeId} disabled={isLoading}>
                <SelectTrigger id="level-grade" className="w-full h-9.5 text-xs border border-input">
                  <SelectValue placeholder="Select a grade..." />
                </SelectTrigger>
                <SelectContent>
                  {gradesLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading grades...
                    </SelectItem>
                  ) : grades.length === 0 ? (
                    <SelectItem value="no-grades" disabled>
                      No active grades found
                    </SelectItem>
                  ) : (
                    grades.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name_en} ({g.name_kh})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="level-seq" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Sequence Order (Position) <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="level-seq"
                type="number"
                min={0}
                placeholder="1"
                value={sequence}
                onChange={(e) => setSequence(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={isLoading}
                className="h-9.5 text-xs"
              />
              <p className="text-[9px] text-slate-400">Must be unique per (Category, Grade) roadmap.</p>
            </div>

            <div className="space-y-1.5 flex flex-col justify-end">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 h-9.5">
                <Label htmlFor="level-status" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Active Status
                </Label>
                <Switch
                  id="level-status"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {validationError && (
            <div className="flex items-start gap-2 p-3 rounded-lg border border-rose-500/10 bg-rose-500/5 text-rose-500">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="text-xs font-medium leading-tight">{validationError}</p>
            </div>
          )}

          <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800">
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
              {isLoading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Level'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
