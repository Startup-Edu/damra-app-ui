import { createFileRoute, Outlet } from '@tanstack/react-router'
import { DefaultLayout } from '@/components/layouts/DefaultLayout'

export const Route = createFileRoute('/_domain/super-admin')({
  component: SuperAdminLayout,
})

function SuperAdminLayout() {
  return (
    <DefaultLayout>
      <Outlet />
    </DefaultLayout>
  )
}