import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react'

export const Route = createFileRoute('/_domain/auth/forget-password')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubmitted(true)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background text-foreground transition-colors duration-300 font-sans p-4 sm:p-8">
      {/* Subtle Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_30%,transparent_100%)]" />

      <Card className="w-full max-w-[440px] relative z-10 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex items-center">
            <Link 
              to="/auth/login" 
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent active:scale-[0.97]"
            >
              <ArrowLeft className="size-4" /> Back to Sign In
            </Link>
          </div>

          <div className="flex flex-col items-center gap-3 text-center">
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <KeyRound className="size-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Reset Your Password
            </h1>
            <p className="text-sm text-muted-foreground max-w-xs">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-xl border border-border bg-muted/40 p-5 text-center space-y-3">
              <div className="flex justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-8" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Check your inbox
              </p>
              <p className="text-xs text-muted-foreground">
                We've sent password reset instructions to <span className="font-semibold text-foreground">{email}</span> if an account exists.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={() => setSubmitted(false)}
              >
                Try another email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-sm font-semibold text-foreground ml-1">
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 rounded-lg pl-10.5 pr-4 transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold"
              >
                Send Reset Link
              </Button>
            </form>
          )}
        </div>
      </Card>
    </div>
  )
}
