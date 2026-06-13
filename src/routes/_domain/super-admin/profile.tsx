import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, User, Mail, Save } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { authApi } from '@/api/auth'
import { PageHeader } from '@/components/ui/page-header'

export const Route = createFileRoute('/_domain/super-admin/profile')({
  component: ProfilePage,
})

interface UpdateProfileResponse {
  success: boolean
  status_code: number
  message: string
  message_kh: string
  data: {
    id: string
    email: string
    name: string
    // ... other backend fields
  }
}

function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const setAuth = useAuthStore((state) => state.setAuth)

  // Initialize state with current user data
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')

  // Keep state in sync if the user object loads slightly after mount
  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
    }
  }, [user])

  const profileMutation = useMutation({
    mutationFn: async (payload: { name: string; email: string }) => {
      return authApi.updateProfile(payload)
    },
    onSuccess: (result) => {
      toast.success(result.message, {
        description: result.message_kh,
      })
      
      // Crucial: Merge the new name and email with the existing user object
      // so we don't lose the role and permissions arrays!
      if (user) {
        setAuth({
          ...user,
          name: result.data.name,
          email: result.data.email,
        })
      }
    },
    onError: (error) => {
      toast.error('Update Failed', {
        description: error.message,
      })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    profileMutation.mutate({ name, email })
  }

  return (
    <div className="p-6 max-w-2xl mx-auto w-full text-slate-900 dark:text-slate-50">
      {/* Page Header */}
      <PageHeader
        title="Account Settings"
        description="Manage your profile information and email preferences."
        className="mb-8"
      />

      <Card className="border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/30 backdrop-blur-2xl shadow-[0_8px_40px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.2)] rounded-2xl overflow-hidden transition-all duration-300">
        <CardHeader className="px-8 pt-8 pb-4">
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">Profile Details</CardTitle>
          <CardDescription className="font-medium text-slate-500 dark:text-slate-400">
            Update your personal information. Changes will reflect across the platform immediately.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold leading-none text-slate-700 dark:text-slate-300 ml-1">
                Full Name
              </Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors duration-300" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={profileMutation.isPending}
                  className="h-12 rounded-lg pl-11 bg-slate-50/50 dark:bg-slate-900/20 transition-all shadow-inner border border-slate-200/50 dark:border-slate-800/50 focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold leading-none text-slate-700 dark:text-slate-300 ml-1">
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors duration-300" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={profileMutation.isPending}
                  className="h-12 rounded-lg pl-11 bg-slate-50/50 dark:bg-slate-900/20 transition-all shadow-inner border border-slate-200/50 dark:border-slate-800/50 focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button 
                type="submit" 
                disabled={profileMutation.isPending || (name === user?.name && email === user?.email)}
                className="relative overflow-hidden bg-primary hover:bg-primary/90 text-white rounded-lg !h-12 px-8 text-base font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none group"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                
                <span className="relative flex items-center justify-center gap-2">
                  {profileMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Save Profile
                    </>
                  )}
                </span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}