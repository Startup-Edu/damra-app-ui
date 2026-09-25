import { createFileRoute, Link } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserPlus, ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/_domain/auth/register')({
  component: RegisterPage,
})

function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 sm:p-8 text-center space-y-6 border-none">
        <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
          <UserPlus className="size-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Account Registration
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Admin accounts are provisioned by an administrator. Please reach out to your team or system administrator to request access.
          </p>
        </div>

        <div className="pt-2">
          <Button asChild className="w-full">
            <Link to="/auth/login" className="flex items-center justify-center gap-2">
              <ArrowLeft className="size-4" /> Back to Sign In
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
