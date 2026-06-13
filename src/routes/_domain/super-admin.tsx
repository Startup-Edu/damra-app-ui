import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { DefaultLayout } from '@/components/layouts/DefaultLayout'
import { useAuthStore } from '@/store/useAuthStore'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute('/_domain/super-admin')({
  component: SuperAdminLayout,
})

function SuperAdminLayout() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuthStore()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: '/auth/login' })
    }
  }, [isAuthenticated, isLoading, navigate])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Verifying session...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <DefaultLayout>
      <Outlet />
    </DefaultLayout>
  )
}