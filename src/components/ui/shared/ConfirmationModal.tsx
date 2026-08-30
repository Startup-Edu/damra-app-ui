import * as React from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Loader2, AlertTriangle, Info, HelpCircle } from 'lucide-react'

export type ConfirmationModalVariant = 'destructive' | 'warning' | 'info' | 'default'

export interface ConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description: React.ReactNode
  variant?: ConfirmationModalVariant
  icon?: React.ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  isPending?: boolean
}

export function ConfirmationModal({
  open,
  onOpenChange,
  title = 'Confirm Action',
  description,
  variant = 'warning',
  icon,
  confirmText,
  cancelText = 'Cancel',
  onConfirm,
  isPending = false,
}: ConfirmationModalProps) {
  // Determine variant styling and default text/icons
  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return {
          icon: icon || <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />,
          iconBg: 'bg-rose-500/10 border-rose-500/20',
          buttonVariant: 'destructive' as const,
          defaultConfirmText: 'Delete',
        }
      case 'warning':
        return {
          icon: icon || <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
          iconBg: 'bg-amber-500/10 border-amber-500/20',
          buttonVariant: 'destructive' as const,
          defaultConfirmText: 'Confirm',
        }
      case 'info':
        return {
          icon: icon || <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
          iconBg: 'bg-blue-500/10 border-blue-500/20',
          buttonVariant: 'default' as const,
          defaultConfirmText: 'Confirm',
        }
      default:
        return {
          icon: icon || <HelpCircle className="h-5 w-5 text-primary" />,
          iconBg: 'bg-primary/10 border-primary/20',
          buttonVariant: 'default' as const,
          defaultConfirmText: 'Confirm',
        }
    }
  }

  const { icon: defaultIcon, iconBg, buttonVariant, defaultConfirmText } = getVariantStyles()
  const finalConfirmText = confirmText || defaultConfirmText

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[440px]">
        <AlertDialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${iconBg}`}>
              {defaultIcon}
            </div>
            <AlertDialogTitle className="text-base font-bold">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="pt-3 border-t">
          <AlertDialogCancel disabled={isPending} className="h-9 text-xs">
            {cancelText}
          </AlertDialogCancel>
          <Button
            variant={buttonVariant}
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isPending}
            className="h-9 text-xs"
          >
            {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            {finalConfirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
