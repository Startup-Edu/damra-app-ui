import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/useAuthStore'
import { useUpdateProfileMutation } from '../_hooks/useProfile'
import { Loader2, User, Mail, Save } from 'lucide-react'

export function ProfileDetailsCard() {
  const user = useAuthStore((state) => state.user)
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')

  const updateMutation = useUpdateProfileMutation()

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
    }
  }, [user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    updateMutation.mutate({ name: name.trim(), email: email.trim() })
  }

  const isPending = updateMutation.isPending
  const isUnchanged = name === user?.name && email === user?.email

  return (
    <Card className="overflow-hidden transition-all duration-300">
      <CardHeader className="px-6 pt-6 pb-4">
        <CardTitle className="text-base font-bold">
          Profile Details
        </CardTitle>
        <CardDescription className="text-xs font-medium">
          Update your personal name and email mapping across the platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold leading-none text-foreground">
              Full Name
            </Label>
            <div className="relative group">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isPending}
                className="h-10 rounded-lg pl-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold leading-none text-foreground">
              Email Address
            </Label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isPending}
                className="h-10 rounded-lg pl-10"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={isPending || isUnchanged}
              className="relative overflow-hidden bg-primary hover:bg-primary/90 text-white rounded-lg h-9 px-6 text-xs font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none group"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>

              <span className="relative flex items-center justify-center gap-1.5">
                {isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                    Save Changes
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
