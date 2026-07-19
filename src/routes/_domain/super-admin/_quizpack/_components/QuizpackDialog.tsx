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
  useCreateQuizPackageMutation,
  useUpdateQuizPackageMutation,
} from '../_hooks/useQuizpack'
import { useCategoriesQuery } from '../../_category/_hooks/useCategory'
import type { QuizPackageItem } from '../_types/quizpack.types'
import { Loader2, AlertTriangle } from 'lucide-react'

interface QuizpackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quizpack: QuizPackageItem | null
}

export function QuizpackDialog({ open, onOpenChange, quizpack }: QuizpackDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isFree, setIsFree] = useState(true)
  const [priceCoins, setPriceCoins] = useState<number | ''>(0)
  const [questionsPerSession, setQuestionsPerSession] = useState<number | ''>('')
  const [isActive, setIsActive] = useState(true)

  const [validationError, setValidationError] = useState('')

  const createMutation = useCreateQuizPackageMutation()
  const updateMutation = useUpdateQuizPackageMutation()

  // Fetch categories for direct standalone assignment
  const { data: categoriesResponse, isLoading: categoriesLoading } = useCategoriesQuery(1, 100, '', true)
  const categories = categoriesResponse?.data || []

  const isEditing = !!quizpack
  const isLoading = createMutation.isPending || updateMutation.isPending || categoriesLoading

  useEffect(() => {
    if (open) {
      if (quizpack) {
        setTitle(quizpack.title)
        setDescription(quizpack.description || '')
        setCategoryId(quizpack.category_id || 'none')
        setIsFree(quizpack.is_free)
        setPriceCoins(quizpack.price_coins)
        setQuestionsPerSession(quizpack.questions_per_session ?? '')
        setIsActive(quizpack.is_active)
      } else {
        setTitle('')
        setDescription('')
        setCategoryId('none')
        setIsFree(true)
        setPriceCoins(0)
        setQuestionsPerSession('')
        setIsActive(true)
      }
      setValidationError('')
    }
  }, [open, quizpack])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    if (!title.trim()) {
      setValidationError('Quiz package title is required')
      return
    }

    if (!isFree && (priceCoins === '' || Number(priceCoins) <= 0)) {
      setValidationError('Paid packages require a valid coin price (> 0)')
      return
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      categoryId: categoryId === 'none' ? null : categoryId,
      isFree,
      priceCoins: isFree ? 0 : Number(priceCoins),
      questionsPerSession: questionsPerSession === '' ? null : Number(questionsPerSession),
      isActive,
    }

    if (isEditing && quizpack) {
      updateMutation.mutate(
        { id: quizpack.id, data: payload },
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
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto custom-scrollbar">
        <DialogHeader className="space-y-1.5 border-b pb-3">
          <DialogTitle className="text-lg font-bold">
            {isEditing ? 'Modify Quiz Package' : 'Create Standalone Quiz Package'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing
              ? 'Update the standalone quiz package configuration, pricing, and category alignment.'
              : 'Add a new standalone practice quiz package bundle.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="quizpack-title">
              Package Title <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="quizpack-title"
              placeholder="e.g. Grade 7 Math Practice Pack #1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              className="h-9.5 text-xs"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="quizpack-desc">
              Description
            </Label>
            <Input
              id="quizpack-desc"
              placeholder="Package details and summary..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              className="h-9.5 text-xs"
            />
          </div>

          {/* Category selection */}
          <div className="space-y-1.5">
            <Label htmlFor="quizpack-category">
              Category Alignment (Optional)
            </Label>
            <Select value={categoryId} onValueChange={setCategoryId} disabled={isLoading}>
              <SelectTrigger id="quizpack-category" className="w-full h-9.5 text-xs border border-input">
                <SelectValue placeholder="Select Category..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (General Package)</SelectItem>
                {categoriesLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading categories...
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

          {/* Pricing & Session Size */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="quizpack-price">
                Coin Price {!isFree && <span className="text-rose-500">*</span>}
              </Label>
              <Input
                id="quizpack-price"
                type="number"
                min={0}
                placeholder={isFree ? '0 (Free)' : 'e.g. 50'}
                value={isFree ? 0 : priceCoins}
                onChange={(e) => setPriceCoins(e.target.value ? Number(e.target.value) : '')}
                disabled={isLoading || isFree}
                className="h-9.5 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quizpack-session">
                Questions / Session
              </Label>
              <Input
                id="quizpack-session"
                type="number"
                min={1}
                placeholder="System default (10)"
                value={questionsPerSession}
                onChange={(e) => setQuestionsPerSession(e.target.value ? Number(e.target.value) : '')}
                disabled={isLoading}
                className="h-9.5 text-xs"
              />
            </div>
          </div>

          {/* Is Free Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted border">
            <div className="space-y-0.5">
              <Label htmlFor="quizpack-free">
                Free Package
              </Label>
              <p className="text-[11px]">
                Free packages require 0 coin unlock payment from students.
              </p>
            </div>
            <Switch
              id="quizpack-free"
              checked={isFree}
              onCheckedChange={(val) => {
                setIsFree(val)
                if (val) setPriceCoins(0)
              }}
              disabled={isLoading}
            />
          </div>

          {/* Active Status Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted border">
            <div className="space-y-0.5">
              <Label htmlFor="quizpack-status">
                Active Status
              </Label>
              <p className="text-[11px]">
                Inactive quiz packages will be hidden from mobile package shop.
              </p>
            </div>
            <Switch
              id="quizpack-status"
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
              {isEditing ? 'Save Changes' : 'Create Package'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
