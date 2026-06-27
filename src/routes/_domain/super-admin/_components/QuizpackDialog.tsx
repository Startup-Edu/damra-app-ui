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
import { useLevelsQuery } from '../_hooks/useLevel'
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
  const [levelId, setLevelId] = useState('')
  const [isFree, setIsFree] = useState(true)
  const [priceCoins, setPriceCoins] = useState<number | ''>(0)
  const [questionsPerSession, setQuestionsPerSession] = useState<number | ''>('')
  const [isActive, setIsActive] = useState(true)

  const [validationError, setValidationError] = useState('')

  const createMutation = useCreateQuizPackageMutation()
  const updateMutation = useUpdateQuizPackageMutation()

  // Fetch all levels for dropdown (limit 100 to get them all)
  const { data: levelsResponse, isLoading: levelsLoading } = useLevelsQuery(1, 100, '')
  const levels = levelsResponse?.data || []

  const isEditing = !!quizpack
  const isLoading = createMutation.isPending || updateMutation.isPending || levelsLoading

  useEffect(() => {
    if (open) {
      if (quizpack) {
        setTitle(quizpack.title)
        setDescription(quizpack.description || '')
        setLevelId(quizpack.level_id || '')
        setIsFree(quizpack.is_free)
        setPriceCoins(quizpack.price_coins)
        setQuestionsPerSession(quizpack.questions_per_session || '')
        setIsActive(quizpack.is_active)
      } else {
        setTitle('')
        setDescription('')
        setLevelId('')
        setIsFree(true)
        setPriceCoins(0)
        setQuestionsPerSession('')
        setIsActive(true)
      }
      setValidationError('')
    }
  }, [open, quizpack])

  // Automatically normalize price coins when isFree state transitions
  useEffect(() => {
    if (isFree) {
      setPriceCoins(0)
    } else if (priceCoins === 0) {
      setPriceCoins(1) // Paid packages must be >= 1 coin
    }
  }, [isFree])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    if (!title.trim()) {
      setValidationError('Title is required')
      return
    }

    if (!levelId || levelId === 'none') {
      setValidationError('Please select an associated Level')
      return
    }

    // Validate economy rules
    if (!isFree && (priceCoins === '' || isNaN(priceCoins) || priceCoins < 1)) {
      setValidationError('Paid packages must cost at least 1 coin')
      return
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      levelId,
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
      <DialogContent className="sm:max-w-[500px] text-slate-900 dark:text-slate-50 border border-slate-100 dark:border-slate-800 shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-lg font-bold">
            {isEditing ? 'Modify Quiz Package' : 'Create New Quiz Package'}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            {isEditing
              ? 'Update title, coins configuration, or session question size limits.'
              : 'Add a new quiz package to bundle questions under a difficulty level.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pkg-title" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              Package Title <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="pkg-title"
              placeholder="e.g. Algebra Starter Pack"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              className="h-9.5 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pkg-desc" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              Description
            </Label>
            <Input
              id="pkg-desc"
              placeholder="e.g. Intro package covering functions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              className="h-9.5 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="pkg-level" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Associated Level <span className="text-rose-500">*</span>
              </Label>
              <Select value={levelId} onValueChange={setLevelId} disabled={isLoading}>
                <SelectTrigger id="pkg-level" className="w-full h-9.5 text-xs border border-input">
                  <SelectValue placeholder="Select a level..." />
                </SelectTrigger>
                <SelectContent>
                  {levelsLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading levels...
                    </SelectItem>
                  ) : levels.length === 0 ? (
                    <SelectItem value="no-levels" disabled>
                      No active levels found
                    </SelectItem>
                  ) : (
                    levels.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.title_en} ({l.grade?.name_en || 'No Grade'})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pkg-session-q" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Questions per Session
              </Label>
              <Input
                id="pkg-session-q"
                type="number"
                min={1}
                placeholder="Defaults to 10"
                value={questionsPerSession}
                onChange={(e) => setQuestionsPerSession(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={isLoading}
                className="h-9.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Economy switch */}
            <div className="space-y-1.5 flex flex-col justify-end">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 h-9.5">
                <Label htmlFor="pkg-free" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Free Package
                </Label>
                <Switch
                  id="pkg-free"
                  checked={isFree}
                  onCheckedChange={setIsFree}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Price coins */}
            <div className="space-y-1.5">
              <Label htmlFor="pkg-price" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Price (Coins) {!isFree && <span className="text-rose-500">*</span>}
              </Label>
              <Input
                id="pkg-price"
                type="number"
                min={0}
                value={priceCoins}
                onChange={(e) => setPriceCoins(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={isFree || isLoading}
                placeholder="0"
                className="h-9.5 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 mt-2">
            <div className="space-y-0.5">
              <Label htmlFor="pkg-status" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Active Status
              </Label>
              <p className="text-[9px] text-slate-400">
                Inactive packages will be hidden from mobile quiz catalogs.
              </p>
            </div>
            <Switch
              id="pkg-status"
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
              {isEditing ? 'Save Changes' : 'Create Package'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
