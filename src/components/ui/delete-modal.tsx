import * as React from "react"
import { ConfirmationModal } from "@/components/ui/shared/ConfirmationModal"

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
    <ConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      variant="destructive"
      confirmText={confirmText}
      cancelText={cancelText}
      onConfirm={onConfirm}
      isPending={isPending}
    />
  )
}
