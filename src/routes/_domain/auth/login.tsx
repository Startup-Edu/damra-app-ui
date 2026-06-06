import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input' 
import { Loader2, Mail, Lock } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'

export const Route = createFileRoute('/_domain/auth/login')({
  component: LoginPage,
})

interface LoginResponse {
  success: boolean
  status_code: number
  message: string
  message_kh: string
  data: {
    id: string
    email: string
    name: string
    role: string
    permissions: string[]
  }
}

function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })

      const result: LoginResponse = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Invalid credentials')
      }

      return result
    },
    onSuccess: (data) => {
      toast.success(data.message_kh, {
        description: data.message,
      })
      
      setAuth(data.data)
      navigate({ to: '/super-admin/check-health' }) 
    },
    onError: (error) => {
      toast.error('Authentication Failed', {
        description: error.message,
      })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate({ email, password })
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4 transition-colors">
      <div className="w-full max-w-md space-y-8">
        
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
            Welcome back
          </h1>
          <p className="text-base font-medium text-neutral-500 dark:text-neutral-400">
            Enter your credentials to access your account
          </p>
        </div>

        <Card className="border-0 bg-neutral-200/50 dark:bg-neutral-900/50 shadow-none rounded-3xl">
          <CardContent className="pt-8 px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-bold leading-none text-neutral-700 dark:text-neutral-300">
                  Email
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
                    disabled={loginMutation.isPending}
                    // Minimal styling: Relying on the Input component's base design
                    className="h-12 rounded-xl pl-12 bg-white dark:bg-neutral-950 border-0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-bold leading-none text-neutral-700 dark:text-neutral-300">
                    Password
                  </label>
                  <Link to="/auth/forget-password" className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-neutral-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loginMutation.isPending}
                    // Minimal styling: Relying on the Input component's base design
                    className="h-12 rounded-xl pl-12 bg-white dark:bg-neutral-950 border-0"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loginMutation.isPending}
                className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl !h-12 text-base font-bold shadow-none transition-all active:scale-[0.98]"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}