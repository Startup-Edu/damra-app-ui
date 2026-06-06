import { createFileRoute } from '@tanstack/react-router'
import { BlankLayout } from '@/components/layouts/BlankLayout'

// This creates a layout for the entire /auth folder
export const Route = createFileRoute('/_domain/auth')({
  component: AuthLayout,
})

function AuthLayout() {
  return <BlankLayout />
}