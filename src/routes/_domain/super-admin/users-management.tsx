import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_domain/super-admin/users-management')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/domain/SuperAdmin/users-management"!</div>
}
