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
  const [resource, setResource] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [validationError, setValidationError] = useState('')

  const createMutation = useCreatePermissionMutation()
  const updateMutation = useUpdatePermissionMutation()

  const isEditing = !!permission
  const isLoading = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (open) {
      if (permission) {
        const permName = permission.name || ''
        const parts = permName.includes(':') ? permName.split(':') : []
        const resName = permission.resource || (parts.length > 0 ? parts[0] : permName)
        const actName = permission.action || (parts.length > 1 ? parts[1] : '')

        setAction(actName || '')
        setResource(resName || '')
        setIsActive(permission.is_active ?? true)
      } else {
        setAction('')
        setResource('')
        setIsActive(true)
      }
      setValidationError('')
    }
  }, [open, permission])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    const actStr = (action || '').trim()
    const resStr = (resource || '').trim()

    if (!actStr || !resStr) {
      setValidationError('Both Action and Resource are required')
      return
    }

    const cleanAction = actStr.toLowerCase()
    const cleanResource = resStr.toLowerCase()
    const name = `${cleanResource}:${cleanAction}`

    if (isEditing && permission) {
      updateMutation.mutate(
        {
          id: permission.id,
          data: { name, action: cleanAction, resource: cleanResource, isActive },
        },
        {
          onSuccess: (res) => {
            if (res.success) onOpenChange(false)
          },
        }
      )
    } else {
      createMutation.mutate([{ name, action: cleanAction, resource: cleanResource }], {
        onSuccess: (res) => {
          if (res.success) onOpenChange(false)
        },
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] text-slate-900 dark:text-slate-50 border border-slate-100 dark:border-slate-800 shadow-lg">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-lg font-bold">
            {isEditing ? 'Edit System Permission' : 'Create New Permission'}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            {isEditing
              ? 'Modify the action and resource mapping for this system permission.'
              : 'Add a new action-resource permission definition to the database.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="perm-resource" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Resource Name
              </Label>
              <Input
                id="perm-resource"
                placeholder="e.g. user, questions"
                value={resource}
                onChange={(e) => setResource(e.target.value)}
                disabled={isLoading}
                className="h-10 text-xs focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="perm-action" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Action
              </Label>
              <Input
                id="perm-action"
                placeholder="e.g. read, create, delete"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                disabled={isLoading}
                className="h-10 text-xs focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-mono">
            Generated Permission Name:{' '}
            <span className="font-bold text-primary dark:text-primary-foreground">
              {(action || '').trim() && (resource || '').trim()
                ? `${(resource || '').trim().toLowerCase()}:${(action || '').trim().toLowerCase()}`
                : 'resource:action'}
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
                checked={isActive}
                onCheckedChange={setIsActive}
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
