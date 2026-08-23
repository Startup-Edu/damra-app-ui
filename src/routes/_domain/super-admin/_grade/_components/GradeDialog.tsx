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
  useCreateGradeMutation,
  useUpdateGradeMutation,
} from '../_hooks/useGrade'
import type { GradeItem } from '../_types/grade.types'
import { Loader2, AlertTriangle } from 'lucide-react'

interface GradeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  grade: GradeItem | null
}

export function GradeDialog({ open, onOpenChange, grade }: GradeDialogProps) {
  const [nameEn, setNameEn] = useState('')
  const [nameKh, setNameKh] = useState('')
  const [gradeNumber, setGradeNumber] = useState<number | ''>('')
  const [sortOrder, setSortOrder] = useState<number>(0)
  const [isActive, setIsActive] = useState(true)

  const [validationError, setValidationError] = useState('')

  const createMutation = useCreateGradeMutation()
  const updateMutation = useUpdateGradeMutation()

  const isEditing = !!grade
  const isLoading = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (open) {
      if (grade) {
        setNameEn(grade.name_en)
        setNameKh(grade.name_kh)
        setGradeNumber(grade.grade_number)
        setSortOrder(grade.sort_order)
        setIsActive(grade.is_active)
      } else {
        setNameEn('')
        setNameKh('')
        setGradeNumber('')
        setSortOrder(0)
        setIsActive(true)
      }
      setValidationError('')
    }
  }, [open, grade])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    if (!nameEn.trim() || !nameKh.trim()) {
      setValidationError('Both English and Khmer names are required')
      return
    }

    if (gradeNumber === '' || Number(gradeNumber) < 1) {
      setValidationError('A valid positive Grade Number is required (e.g. 7, 8, 12)')
      return
    }

    const payload = {
      nameEn: nameEn.trim(),
      nameKh: nameKh.trim(),
      gradeNumber: Number(gradeNumber),
      sortOrder,
      isActive,
    }

    if (isEditing && grade) {
      updateMutation.mutate(
        { id: grade.id, data: payload },
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
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-lg font-bold">
            {isEditing ? 'Modify Grade Level' : 'Create Grade Level'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing
              ? 'Update the grade level details, sequence, and accessibility parameters.'
              : 'Add a new educational grade level to group subject tracks.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="grade-name-en" className="font-semibold">
                English Label <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="grade-name-en"
                placeholder="e.g. Grade 7"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                disabled={isLoading}
                className="h-9.5 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="grade-name-kh" className="font-semibold">
                Khmer Label <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="grade-name-kh"
                placeholder="e.g. ថ្នាក់ទី ៧"
                value={nameKh}
                onChange={(e) => setNameKh(e.target.value)}
                disabled={isLoading}
                className="h-9.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="grade-number">
                Grade Number <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="grade-number"
                type="number"
                min={1}
                max={20}
                placeholder="7"
                value={gradeNumber}
                onChange={(e) => setGradeNumber(e.target.value ? Number(e.target.value) : '')}
                disabled={isLoading}
                className="h-9.5 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="grade-sort">
                Sort Order
              </Label>
              <Input
                id="grade-sort"
                type="number"
                min={0}
                placeholder="0"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                disabled={isLoading}
                className="h-9.5 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted border mt-2">
            <div className="space-y-0.5">
              <Label htmlFor="grade-status" className="font-semibold">
                Active Status
              </Label>
              <p className="text-[10px]">
                Inactive grades will be hidden from mobile target selection.
              </p>
            </div>
            <Switch
              id="grade-status"
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
              className="!h-9 text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="!h-9 text-xs">
              {isLoading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Grade'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
