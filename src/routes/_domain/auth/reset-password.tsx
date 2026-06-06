import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_domain/auth/reset-password')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_domain/auth/ResetPassword"!</div>
}
