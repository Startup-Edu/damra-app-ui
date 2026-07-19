import { useState, useEffect, useRef } from 'react'
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
import { useCreateUserMutation, useUpdateUserMutation, useRolesDropdownQuery } from '../_hooks/useUsers'
import type { UserItem } from '../_types/users.types'
import { Loader2, Camera, User, KeyRound, AlertTriangle } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserItem | null
}

export function UserDialog({ open, onOpenChange, user }: UserDialogProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [roleId, setRoleId] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [resetPassword, setResetPassword] = useState(false)
  const [avatarBase64, setAvatarBase64] = useState<string | undefined>(undefined)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const [validationError, setValidationError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const createMutation = useCreateUserMutation()
  const updateMutation = useUpdateUserMutation()
  
  // Fetch active roles list when modal opens
  const { data: rolesResponse, isLoading: rolesLoading } = useRolesDropdownQuery(open)
  const roles = rolesResponse?.data || []

  const isEditing = !!user
  const isLoading = createMutation.isPending || updateMutation.isPending || rolesLoading

  useEffect(() => {
    if (open) {
      if (user) {
        setEmail(user.email)
        setName(user.name)
        setPassword('')
        setRoleId(user.roles?.[0]?.id || '')
        setIsActive(user.is_active)
        setResetPassword(false)
        setAvatarBase64(undefined)
        setImagePreview(null)
      } else {
        setEmail('')
        setName('')
        setPassword('')
        setRoleId('')
        setIsActive(true)
        setResetPassword(false)
        setAvatarBase64(undefined)
        setImagePreview(null)
      }
      setValidationError('')
    }
  }, [open, user])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setValidationError('Image size must be less than 2MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setAvatarBase64(base64String)
      setImagePreview(base64String)
    }
    reader.readAsDataURL(file)
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  const validatePasswordStrength = (pass: string) => {
    if (pass.length < 8) return 'Password must be at least 8 characters long.'
    if (!/[A-Z]/.test(pass)) return 'Password must contain at least one uppercase letter.'
    if (!/[a-z]/.test(pass)) return 'Password must contain at least one lowercase letter.'
    if (!/\d/.test(pass)) return 'Password must contain at least one number.'
    if (!/[^A-Za-z0-9]/.test(pass)) return 'Password must contain at least one special character.'
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    if (!email.trim() || !name.trim() || !roleId) {
      setValidationError('Email, Name, and Role are required')
      return
    }

    if (!isEditing) {
      if (!password) {
        setValidationError('Password is required for new users')
        return
      }
      const passwordError = validatePasswordStrength(password)
      if (passwordError) {
        setValidationError(passwordError)
        return
      }
    }

    if (isEditing && user) {
      const payload = {
        email: email.trim(),
        name: name.trim(),
        roleIds: [roleId],
        isActive,
      }
      updateMutation.mutate(
        { id: user.id, data: payload },
        {
          onSuccess: (res) => {
            if (res.success) onOpenChange(false)
          },
        }
      )
    } else {
      const payload = {
        email: email.trim(),
        name: name.trim(),
        password,
        roleIds: [roleId],
        isActive,
      }
      createMutation.mutate(payload, {
        onSuccess: (res) => {
          if (res.success) onOpenChange(false)
        },
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] text-slate-900 dark:text-slate-50 shadow-xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-lg font-bold">
            {isEditing ? 'Modify User Profile' : 'Register New User'}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            {isEditing
              ? 'Update account information, modify roles, or toggle access permissions.'
              : 'Add a new member to the admin system. Fill in their authentication details.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isEditing && (
            <div className="flex flex-col items-center gap-2 pb-2">
              <div className="relative group cursor-pointer" onClick={triggerFileSelect}>
                <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center bg-slate-100 dark:bg-slate-900">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Avatar Preview" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-8 w-8 text-slate-400" />
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-4 w-4 text-white" />
                </div>
              </div>
              <span className="text-[10px] text-slate-400">Click to upload photo</span>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                disabled={isLoading}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="user-name" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Full Name
              </Label>
              <Input
                id="user-name"
                placeholder="e.g. Phun Koko"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="h-9.5 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user-email" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </Label>
              <Input
                id="user-email"
                type="email"
                placeholder="e.g. name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-9.5 text-xs"
              />
            </div>
          </div>

          {!isEditing && (
            <div className="space-y-1.5">
              <Label htmlFor="user-pass" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Temporary Password
              </Label>
              <Input
                id="user-pass"
                type="password"
                placeholder="Must include A-Z, a-z, 0-9 & special character"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-9.5 text-xs"
              />
              <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-tight">
                Requires minimum 8 characters with at least one uppercase, lowercase, number, and symbol.
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="user-role" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              Assigned Role
            </Label>
            <Select value={roleId} onValueChange={setRoleId} disabled={isLoading}>
              <SelectTrigger id="user-role" className="w-full h-9.5 text-xs border border-input">
                <SelectValue placeholder="Select a role..." />
              </SelectTrigger>
              <SelectContent>
                {rolesLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading system roles...
                  </SelectItem>
                ) : roles.length === 0 ? (
                  <SelectItem value="no-roles" disabled>
                    No active roles found
                  </SelectItem>
                ) : (
                  roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3.5 pt-1.5">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <Label htmlFor="user-status" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Allow System Access
                </Label>
                <p className="text-[9px] text-slate-400">
                  Inactive users will be blocked from logging into the portal.
                </p>
              </div>
              <Switch
                id="user-status"
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={isLoading}
              />
            </div>
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
              {isEditing ? 'Save Profile' : 'Register User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
