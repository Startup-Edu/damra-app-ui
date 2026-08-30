import * as React from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"

export interface DeleteModalProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  setOpen?: (open: boolean) => void
  title?: string
  description: React.ReactNode
  onConfirm: () => void
  isPending?: boolean
  confirmText?: string
  cancelText?: string
}

export function DeleteModal({
  open,
  onOpenChange: propOnOpenChange,
  setOpen: propSetOpen,
  title = "Are you absolutely sure?",
  description,
  onConfirm,
  isPending = false,
  confirmText = "Delete",
  cancelText = "Cancel",
}: DeleteModalProps) {
  const onOpenChange = propOnOpenChange || propSetOpen || (() => {})
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isPending}
            variant="destructive"
          >
            {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
