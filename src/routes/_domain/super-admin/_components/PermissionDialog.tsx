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
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
} from '../_hooks/useRolesPermissions'
import type { PermissionItem } from '../_types/rolesPermissions.types'
import { Loader2 } from 'lucide-react'

interface PermissionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  permission: PermissionItem | null
}

export function PermissionDialog({ open, onOpenChange, permission }: PermissionDialogProps) {
  const [action, setAction] = useState('')
  const [moduleName, setModuleName] = useState('')
  const [status, setStatus] = useState(true)
  const [validationError, setValidationError] = useState('')

  const createMutation = useCreatePermissionMutation()
  const updateMutation = useUpdatePermissionMutation()

  const isEditing = !!permission
  const isLoading = createMutation.isPending || updateMutation.isPending

  // Sync state when permission changes or modal opens
  useEffect(() => {
    if (open) {
      if (permission) {
        setAction(permission.action)
        setModuleName(permission.module)
        setStatus(permission.status)
      } else {
        setAction('')
        setModuleName('')
        setStatus(true)
      }
      setValidationError('')
    }
  }, [open, permission])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    if (!action.trim() || !moduleName.trim()) {
      setValidationError('Both Action and Module Name are required')
      return
    }

    const cleanAction = action.trim().toLowerCase()
    const cleanModule = moduleName.trim().toLowerCase()

    if (isEditing && permission) {
      updateMutation.mutate(
        {
          id: permission.id,
          data: { action: cleanAction, module: cleanModule, status },
        },
        {
          onSuccess: (res) => {
            if (res.success) onOpenChange(false)
          },
        }
      )
    } else {
      // Bulk creation syntax is array [{ action, module }]
      createMutation.mutate([{ action: cleanAction, module: cleanModule }], {
        onSuccess: (res) => {
          if (res.success) onOpenChange(false)
        },
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-6 text-slate-900 dark:text-slate-50 border border-slate-100 dark:border-slate-800 shadow-lg">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-lg font-bold">
            {isEditing ? 'Edit System Permission' : 'Create New Permission'}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            {isEditing
              ? 'Modify the action and module mapping for this system permission.'
              : 'Add a new action-module permission definition to the database.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="perm-action" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Action
              </Label>
              <Input
                id="perm-action"
                placeholder="e.g. read, create"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                disabled={isLoading}
                className="h-10 text-xs focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="perm-module" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Module Name
              </Label>
              <Input
                id="perm-module"
                placeholder="e.g. user, role"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                disabled={isLoading}
                className="h-10 text-xs focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-mono">
            Generated Permission Name:{' '}
            <span className="font-bold text-primary dark:text-primary-foreground">
              {action.trim() && moduleName.trim()
                ? `${action.trim().toLowerCase()}:${moduleName.trim().toLowerCase()}`
                : 'action:module'}
            </span>
          </div>

          {validationError && (
            <p className="text-xs text-rose-500 font-medium">{validationError}</p>
          )}

          {isEditing && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <Label htmlFor="perm-status" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Active Status
                </Label>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Toggling inactive will revoke access check bypass.
                </p>
              </div>
              <Switch
                id="perm-status"
                checked={status}
                onCheckedChange={setStatus}
                disabled={isLoading}
              />
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="h-9 text-xs">
              {isLoading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Permission'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
