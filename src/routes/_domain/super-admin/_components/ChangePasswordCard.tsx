import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useChangePasswordMutation } from '../_hooks/useProfile'
import { Loader2, KeyRound, Lock, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react'

export function ChangePasswordCard() {
  const [password, setPassword] = useState('')
  const [confirmedPassword, setConfirmedPassword] = useState('')
  const [validationError, setValidationError] = useState('')

  const passwordMutation = useChangePasswordMutation()

  // Password requirements checklist state
  const checklist = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }

  const isPasswordValid = Object.values(checklist).every(Boolean)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    if (!password || !confirmedPassword) {
      setValidationError('Both fields are required.')
      return
    }

    if (!isPasswordValid) {
      setValidationError('Password does not meet the complexity requirements.')
      return
    }

    if (password !== confirmedPassword) {
      setValidationError('Passwords do not match.')
      return
    }

    passwordMutation.mutate(
      { password, confirmedPassword },
      {
        onSuccess: (res) => {
          if (res.success) {
            setPassword('')
            setConfirmedPassword('')
            setValidationError('')
          }
        },
      }
    )
  }

  const isPending = passwordMutation.isPending

  return (
    <Card className="border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/30 backdrop-blur-2xl shadow-[0_8px_40px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.2)] rounded-2xl overflow-hidden transition-all duration-300">
      <CardHeader className="px-6 pt-6 pb-4">
        <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <KeyRound className="h-4.5 w-4.5 text-primary" /> Update Password
        </CardTitle>
        <CardDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Secure your administrative account by changing your login credentials.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-password" className="text-xs font-semibold leading-none text-slate-700 dark:text-slate-300">
              New Password
            </Label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors duration-300" />
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isPending}
                className="h-10 rounded-lg pl-10 bg-slate-50/50 dark:bg-slate-900/20 text-xs transition-all shadow-inner border border-slate-200/50 dark:border-slate-800/50 focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-password" className="text-xs font-semibold leading-none text-slate-700 dark:text-slate-300">
              Confirm New Password
            </Label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors duration-300" />
              <Input
                id="confirm-password"
                type="password"
                placeholder="Retype new password"
                value={confirmedPassword}
                onChange={(e) => setConfirmedPassword(e.target.value)}
                required
                disabled={isPending}
                className="h-10 rounded-lg pl-10 bg-slate-50/50 dark:bg-slate-900/20 text-xs transition-all shadow-inner border border-slate-200/50 dark:border-slate-800/50 focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
          </div>

          {/* Password Checklist UI */}
          {password && (
            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/10 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Complexity Checklist
              </span>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <ChecklistItem label="8+ Characters" checked={checklist.length} />
                <ChecklistItem label="Uppercase Letter" checked={checklist.uppercase} />
                <ChecklistItem label="Lowercase Letter" checked={checklist.lowercase} />
                <ChecklistItem label="Number" checked={checklist.number} />
                <ChecklistItem label="Special Character" checked={checklist.special} className="col-span-2" />
              </div>
            </div>
          )}

          {validationError && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg border border-rose-500/15 bg-rose-500/5 text-rose-500">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="text-[11px] font-medium leading-normal">{validationError}</p>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={isPending || !password || !confirmedPassword || !isPasswordValid || password !== confirmedPassword}
              className="relative overflow-hidden bg-primary hover:bg-primary/90 text-white rounded-lg h-9 px-6 text-xs font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none group"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>

              <span className="relative flex items-center justify-center gap-1.5">
                {isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-1.5 h-3.5 w-3.5" />
                    Save Password
                  </>
                )}
              </span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

interface ChecklistItemProps {
  label: string
  checked: boolean
  className?: string
}

function ChecklistItem({ label, checked, className }: ChecklistItemProps) {
  return (
    <div className={`flex items-center gap-1.5 text-[10px] ${className || ''}`}>
      {checked ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
      ) : (
        <XCircle className="h-3.5 w-3.5 text-slate-300 dark:text-slate-700 shrink-0" />
      )}
      <span className={checked ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-400'}>
        {label}
      </span>
    </div>
  )
}
