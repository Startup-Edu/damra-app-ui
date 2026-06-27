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
import { Textarea } from '@/components/ui/textarea'
import {
  useCreateQuestionTypeMutation,
  useUpdateQuestionTypeMutation,
} from '../_hooks/useQuestiontype'
import type { QuestionTypeItem } from '../_types/questiontype.types'
import { Loader2, AlertTriangle } from 'lucide-react'

interface QuestiontypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  questiontype: QuestionTypeItem | null
}

export function QuestiontypeDialog({ open, onOpenChange, questiontype }: QuestiontypeDialogProps) {
  const [code, setCode] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [nameKh, setNameKh] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')
  const [descriptionKh, setDescriptionKh] = useState('')
  const [sortOrder, setSortOrder] = useState<number>(0)
  const [isActive, setIsActive] = useState(true)

  const [validationError, setValidationError] = useState('')

  const createMutation = useCreateQuestionTypeMutation()
  const updateMutation = useUpdateQuestionTypeMutation()

  const isEditing = !!questiontype
  const isLoading = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (open) {
      if (questiontype) {
        setCode(questiontype.code)
        setNameEn(questiontype.name_en)
        setNameKh(questiontype.name_kh)
        setDescriptionEn(questiontype.description_en || '')
        setDescriptionKh(questiontype.description_kh || '')
        setSortOrder(questiontype.sort_order)
        setIsActive(questiontype.is_active)
      } else {
        setCode('')
        setNameEn('')
        setNameKh('')
        setDescriptionEn('')
        setDescriptionKh('')
        setSortOrder(0)
        setIsActive(true)
      }
      setValidationError('')
    }
  }, [open, questiontype])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    if (!code.trim()) {
      setValidationError('Code is required')
      return
    }

    if (!nameEn.trim() || !nameKh.trim()) {
      setValidationError('Both English and Khmer names are required')
      return
    }

    const payload = {
      code: code.trim().toUpperCase(),
      nameEn: nameEn.trim(),
      nameKh: nameKh.trim(),
      descriptionEn: descriptionEn.trim() || null,
      descriptionKh: descriptionKh.trim() || null,
      sortOrder: Number(sortOrder),
      isActive,
    }

    if (isEditing && questiontype) {
      // In updates, backend throws ImmutableCodeError if code is changed.
      // We pass the payload without code, or pass the identical code.
      // Let's send it without code just to be safe.
      const { code: _, ...updatePayload } = payload
      updateMutation.mutate(
        { id: questiontype.id, data: updatePayload },
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
            {isEditing ? 'Modify Question Type' : 'Create New Question Type'}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            {isEditing
              ? 'Update translation labels, descriptions, sequences, or toggling statuses.'
              : 'Add a new type definition for study questions (e.g. MCQ, FILL, WRITTEN).'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="qt-code" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Code (Unique ID) <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="qt-code"
                placeholder="e.g. MCQ"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isEditing || isLoading}
                className="h-9.5 text-xs font-semibold uppercase"
              />
              {isEditing && (
                <p className="text-[8px] text-slate-400 leading-tight">Question type codes cannot be changed after creation.</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="qt-sort" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Sort Order
              </Label>
              <Input
                id="qt-sort"
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="qt-name-en" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                English Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="qt-name-en"
                placeholder="e.g. Multiple Choice"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                disabled={isLoading}
                className="h-9.5 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="qt-name-kh" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Khmer Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="qt-name-kh"
                placeholder="e.g. សំណួរពហុជ្រើសរើស"
                value={nameKh}
                onChange={(e) => setNameKh(e.target.value)}
                disabled={isLoading}
                className="h-9.5 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="qt-desc-en" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              English Description
            </Label>
            <Textarea
              id="qt-desc-en"
              placeholder="Provide a brief explanation of how this question format works..."
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              disabled={isLoading}
              className="text-xs min-h-[60px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="qt-desc-kh" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              Khmer Description
            </Label>
            <Textarea
              id="qt-desc-kh"
              placeholder="ផ្ដល់ការពន្យល់សង្ខេបអំពីទម្រង់សំណួរនេះ..."
              value={descriptionKh}
              onChange={(e) => setDescriptionKh(e.target.value)}
              disabled={isLoading}
              className="text-xs min-h-[60px]"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
            <div className="space-y-0.5">
              <Label htmlFor="qt-status" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Active Status
              </Label>
              <p className="text-[9px] text-slate-400">
                Inactive question types will not be loaded in gameplay engines.
              </p>
            </div>
            <Switch
              id="qt-status"
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
              {isEditing ? 'Save Changes' : 'Create Type'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
