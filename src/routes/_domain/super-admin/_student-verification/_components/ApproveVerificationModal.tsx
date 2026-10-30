import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Loader2, GraduationCap } from 'lucide-react'
import type { StudentVerificationItem } from '../_types/studentVerification.types'

interface ApproveVerificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: StudentVerificationItem | null
  onConfirm: () => void
  isLoading?: boolean
}

export function ApproveVerificationModal({
  open,
  onOpenChange,
  item,
  onConfirm,
  isLoading = false,
}: ApproveVerificationModalProps) {
  if (!item) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="size-11 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
            <CheckCircle2 className="size-6" />
          </div>
          <AlertDialogTitle className="text-lg font-bold">
            Approve Student Verification?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Approving this request will verify the student status and grant access to grade-restricted exams.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Verification Summary Card */}
        <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 flex flex-col gap-2.5 my-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Student Name:</span>
            <span className="font-semibold text-foreground">{item.full_name}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">User Account:</span>
            <span className="font-medium text-foreground">{item.user?.email || 'N/A'}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Target Grade:</span>
            <Badge variant="outline" className="gap-1 font-medium text-primary border-primary/30 py-0.5">
              <GraduationCap className="size-3" />
              {item.grade?.name_en || item.grade?.name_kh || 'N/A'}
            </Badge>
          </div>
        </div>

        <AlertDialogFooter className="mt-2">
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Approving...
              </>
            ) : (
              'Confirm Approval'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
