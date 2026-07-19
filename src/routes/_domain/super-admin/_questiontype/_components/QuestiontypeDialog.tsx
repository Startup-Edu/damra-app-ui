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
  useCreateQuestionTypeMutation,
  useUpdateQuestionTypeMutation,
} from '../_hooks/useQuestiontype'
import type { QuestionTypeConfigItem } from '../_types/questiontype.types'
import { Loader2, AlertTriangle } from 'lucide-react'

interface QuestiontypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  questiontype: QuestionTypeConfigItem | null
}

export function QuestiontypeDialog({ open, onOpenChange, questiontype }: QuestiontypeDialogProps) {
  const [code, setCode] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [nameKh, setNameKh] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')
  const [descriptionKh, setDescriptionKh] = useState('')
  const [iconUrl, setIconUrl] = useState('')
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
        setIconUrl(questiontype.icon_url || '')
        setSortOrder(questiontype.sort_order)
        setIsActive(questiontype.is_active)
      } else {
        setCode('')
        setNameEn('')
        setNameKh('')
        setDescriptionEn('')
        setDescriptionKh('')
        setIconUrl('')
        setSortOrder(0)
        setIsActive(true)
      }
      setValidationError('')
    }
  }, [open, questiontype])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    if (!code.trim() || !nameEn.trim() || !nameKh.trim()) {
      setValidationError('Code, English name, and Khmer name are required fields')
      return
    }

    const payload = {
      code: code.trim().toUpperCase(),
      nameEn: nameEn.trim(),
      nameKh: nameKh.trim(),
      descriptionEn: descriptionEn.trim() || null,
      descriptionKh: descriptionKh.trim() || null,
      iconUrl: iconUrl.trim() || null,
      sortOrder,
      isActive,
    }

    if (isEditing && questiontype) {
      updateMutation.mutate(
        { id: questiontype.id, data: payload },
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
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-lg font-bold">
            {isEditing ? 'Modify Question Type' : 'Create Question Type'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing
              ? 'Update the question type schema code, display names, and icon properties.'
              : 'Add a new question type configuration for interactive quiz rendering.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="qtype-code">
              Type Code (Identifier) <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="qtype-code"
              placeholder="e.g. MCQ, FILL_BLANK, MATCHING"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isLoading || isEditing}
              className="h-9.5 text-xs font-mono uppercase"
            />
            <p className="text-[11px] text-muted-foreground">Unique uppercase code key used in JSON schemas.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="qtype-name-en">
                English Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="qtype-name-en"
                placeholder="e.g. Multiple Choice"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                disabled={isLoading}
                className="h-9.5 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="qtype-name-kh">
                Khmer Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="qtype-name-kh"
                placeholder="e.g. ជ្រើសរើសចម្លើយត្រូវ"
                value={nameKh}
                onChange={(e) => setNameKh(e.target.value)}
                disabled={isLoading}
                className="h-9.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="qtype-desc-en">
                English Description
              </Label>
              <Input
                id="qtype-desc-en"
                placeholder="Description of question format"
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                disabled={isLoading}
                className="h-9.5 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="qtype-desc-kh">
                Khmer Description
              </Label>
              <Input
                id="qtype-desc-kh"
                placeholder="ការពិពណ៌នាអំពីទម្រង់សំណួរ"
                value={descriptionKh}
                onChange={(e) => setDescriptionKh(e.target.value)}
                disabled={isLoading}
                className="h-9.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="qtype-icon">
                Icon URL
              </Label>
              <Input
                id="qtype-icon"
                placeholder="https://example.com/mcq-icon.svg"
                value={iconUrl}
                onChange={(e) => setIconUrl(e.target.value)}
                disabled={isLoading}
                className="h-9.5 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="qtype-sort">
                Sort Order
              </Label>
              <Input
                id="qtype-sort"
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

          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted mt-2">
            <div className="space-y-0.5">
              <Label htmlFor="qtype-status">
                Active Status
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Inactive question types cannot be chosen when authoring new questions.
              </p>
            </div>
            <Switch
              id="qtype-status"
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
              {isEditing ? 'Save Changes' : 'Create Type'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
