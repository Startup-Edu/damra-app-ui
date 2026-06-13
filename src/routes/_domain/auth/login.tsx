import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input' 
import { Loader2, Mail, Lock, Sun, Moon, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { Label } from '@/components/ui/label'
import { authApi } from '@/api/auth'

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
  const [isDark, setIsDark] = useState(false);
  const [greeting, setGreeting] = useState('Welcome back');

  // Dynamic Greeting Logic
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Good morning');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good afternoon');
    } else if (hour >= 17 && hour < 22) {
      setGreeting('Good evening');
    } else {
      setGreeting('Welcome back'); // Late night fallback
    }
  }, []);

  // Match Landing Page Theme Logic
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.key === 'd' || e.key === 'D') {
        toggleTheme();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const nextTheme = !prev;
      if (nextTheme) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return nextTheme;
    });
  };

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      return authApi.login(credentials)
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
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300 font-sans p-4 sm:p-8 selection:bg-amber-500/30">
      
      {/* Subtle Grid Background (From the Center) */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_30%,transparent_100%)]"></div>
      
      {/* PARENT CARD WRAPPER */}
      <Card className="w-full max-w-[460px] relative z-10 bg-white/70 dark:bg-slate-900/30 backdrop-blur-2xl shadow-[0_8px_40px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.2)] rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">

        <div className="p-6 sm:p-8 flex flex-col gap-8">
          
          {/* Action Buttons (Integrated into the card) */}
          <div className="flex justify-between items-center w-full">
            <Link 
              to="/" 
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
            >
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
              aria-label="Toggle theme (Press D)"
              title="Toggle theme (Press 'd')"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col gap-6">
            
            {/* Dynamic Header */}
            <div className="flex flex-col items-center gap-2 text-center mb-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {greeting}
              </h1>
              <p className="text-base text-slate-500 dark:text-slate-400">
                Enter your credentials to access your account
              </p>
            </div>

            {/* Inner Form Container */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* EMAIL INPUT */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
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
                      disabled={loginMutation.isPending}
                      className="h-12 rounded-lg pl-11 bg-slate-50/50 dark:bg-slate-900/20  transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* PASSWORD INPUT */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </Label>
                    <Link to="/auth/forget-password" className="text-sm font-semibold text-primary dark:text-primary hover:text-primary/80 dark:hover:text-primary/80 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors duration-300" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loginMutation.isPending}
                      className="h-12 rounded-lg pl-11 bg-slate-50/50 dark:bg-slate-900/20 transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <Button 
                  type="submit" 
                  disabled={loginMutation.isPending}
                  className="w-full mt-2 relative overflow-hidden bg-primary hover:bg-primary/90 text-white rounded-lg !h-12 text-base font-semibold transition-all active:scale-[0.98] group"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  
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
            </div>

            {/* Footer Text */}
            <div className="text-center mt-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Don't have an account?{' '}
                <Link to="/auth/register" className="font-semibold text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
                  Sign up
                </Link>
              </p>
            </div>

          </div>
        </div>
      </Card>

      {/* Global styles for the button shimmer effect */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>

    </div>
  )
}