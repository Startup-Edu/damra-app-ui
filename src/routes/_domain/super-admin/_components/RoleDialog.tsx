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
import { useCreateRoleMutation, useUpdateRoleMutation } from '../_hooks/useRolesPermissions'
import type { RoleItem } from '../_types/rolesPermissions.types'
import { Loader2 } from 'lucide-react'

interface RoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: RoleItem | null
}

export function RoleDialog({ open, onOpenChange, role }: RoleDialogProps) {
  const [name, setName] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [validationError, setValidationError] = useState('')

  const createMutation = useCreateRoleMutation()
  const updateMutation = useUpdateRoleMutation()

  const isEditing = !!role
  const isLoading = createMutation.isPending || updateMutation.isPending

  // Sync state when role changes or modal opens
  useEffect(() => {
    if (open) {
      if (role) {
        setName(role.name)
        setIsActive(role.is_active)
      } else {
        setName('')
        setIsActive(true)
      }
      setValidationError('')
    }
  }, [open, role])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    if (!name.trim()) {
      setValidationError('Role name is required')
      return
    }

    const payload = {
      name: name.trim().toUpperCase(), // standardizing to uppercase
      isActive,
    }

    if (isEditing && role) {
      updateMutation.mutate(
        { id: role.id, data: payload },
        {
          onSuccess: (res) => {
            if (res.success) onOpenChange(false)
          },
        }
      )
    } else {
      createMutation.mutate(payload, {
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
            {isEditing ? 'Edit System Role' : 'Create New Role'}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            {isEditing
              ? 'Update the name or toggle the status of this system role.'
              : 'Add a new administrative or standard user role to the system.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="role-name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Role Name
            </Label>
            <Input
              id="role-name"
              placeholder="e.g. EDITOR, SUPPORT"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="h-10 text-xs focus:ring-2 focus:ring-primary/20"
            />
            {validationError && (
              <p className="text-xs text-rose-500 font-medium mt-1">{validationError}</p>
            )}
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
            <div className="space-y-0.5">
              <Label htmlFor="role-status" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Active Status
              </Label>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Inactive roles will prevent assigned users from authentication.
              </p>
            </div>
            <Switch
              id="role-status"
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={isLoading}
            />
          </div>

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
              {isEditing ? 'Save Changes' : 'Create Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
