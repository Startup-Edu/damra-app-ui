import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Loader2 } from 'lucide-react'
import type { StudentVerificationItem } from '../_types/studentVerification.types'

interface RejectVerificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: StudentVerificationItem | null
  onConfirm: (reason: string) => void
  isLoading?: boolean
}

const PRESET_REASONS = [
  'Image is blurry or student ID card is unreadable.',
  'Student ID card is expired.',
  'Full name does not match the identity card provided.',
  'Grade selection does not match the grade on ID card.',
  'Invalid document or not an accredited student ID card.',
]

export function RejectVerificationModal({
  open,
  onOpenChange,
  item,
  onConfirm,
  isLoading = false,
}: RejectVerificationModalProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setReason('')
      setError('')
    }
  }, [open])

  if (!item) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = reason.trim()
    if (!trimmed) {
      setError('Please provide a reason for rejecting this verification.')
      return
    }
    if (trimmed.length > 500) {
      setError('Rejection reason cannot exceed 500 characters.')
      return
    }
    setError('')
    onConfirm(trimmed)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="size-11 rounded-full bg-destructive/15 text-destructive flex items-center justify-center mb-2">
            <AlertCircle className="size-6" />
          </div>
          <DialogTitle className="text-lg font-bold">
            Reject Verification Request
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Specify the reason for rejection. This explanation will be provided to{' '}
            <span className="font-semibold text-foreground">{item.full_name}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-1">
          {/* Preset Quick Chips */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">
              Quick Suggestions
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_REASONS.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => {
                    setReason(preset)
                    setError('')
                  }}
                  className="text-left"
                >
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-muted text-[11px] font-normal py-0.5 px-2 transition-colors border-border/80"
                  >
                    {preset}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Reason Input Area */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reject-reason" className="text-xs font-semibold">
              Rejection Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reject-reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                if (error) setError('')
              }}
              placeholder="e.g. The uploaded student card is expired or unreadable..."
              className="min-h-[100px] text-xs resize-none"
              disabled={isLoading}
              maxLength={500}
            />
            <div className="flex justify-between items-center text-[11px]">
              {error ? (
                <span className="text-destructive font-medium">{error}</span>
              ) : (
                <span className="text-muted-foreground">Clear and professional explanation</span>
              )}
              <span className="text-muted-foreground font-mono">{reason.length}/500</span>
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isLoading || !reason.trim()}
              className="font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Reject Verification'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
