import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2, User, Mail, Save } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'

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
      // Typically PUT or PATCH is used for updates
const response = await fetch('http://localhost:3000/api/auth/profile', {
      method: 'POST', // 👈 Make sure this matches your backend (POST or PUT)
      credentials: 'include', // 👈 THIS IS THE FIX! It forces the browser to send your auth cookie
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      const result: UpdateProfileResponse = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update profile')
      }

      return result
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
    <div className="p-6 max-w-2xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
          Account Settings
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2 font-medium">
          Manage your profile information and email preferences.
        </p>
      </div>

      <Card className="border-0 bg-neutral-200/50 dark:bg-neutral-900/50 shadow-none rounded-3xl">
        <CardHeader className="px-8 pt-8 pb-4">
          <CardTitle className="text-xl font-bold">Profile Details</CardTitle>
          <CardDescription className="font-medium text-neutral-500">
            Update your personal information. Changes will reflect across the platform immediately.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-bold leading-none text-neutral-700 dark:text-neutral-300">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-neutral-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={profileMutation.isPending}
                  className="h-12 rounded-2xl pl-12 bg-white dark:bg-neutral-950 border-0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-bold leading-none text-neutral-700 dark:text-neutral-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-neutral-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={profileMutation.isPending}
                  className="h-12 rounded-2xl pl-12 bg-white dark:bg-neutral-950 border-0"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button 
                type="submit" 
                disabled={profileMutation.isPending || (name === user?.name && email === user?.email)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl h-12 px-8 text-base font-bold shadow-none transition-all active:scale-[0.98]"
              >
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
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}