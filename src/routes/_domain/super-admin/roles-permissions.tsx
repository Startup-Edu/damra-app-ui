import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/ui/page-header'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { RolesTab } from './_role/_components/RolesTab'
import { PermissionsTab } from './_role/_components/PermissionsTab'
import { ShieldCheck } from 'lucide-react'

export const Route = createFileRoute('/_domain/super-admin/roles-permissions')({
  component: RolesPermissionsPage,
})

function RolesPermissionsPage() {
  return (
    <div className="text-slate-900 dark:text-slate-50">
      {/* Page Header */}
      <PageHeader
        title="Roles & Permissions"
        description="Configure application roles, define direct system permission scopes, and configure authorization matrix."
      />

      {/* Tabs Container */}
      <Tabs defaultValue="roles" className="w-full">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-px mb-4">
          <TabsList variant="line" className="h-9 gap-4">
            <TabsTrigger value="roles" className="px-1.5 pb-2 pt-1 h-9 rounded-none text-xs font-semibold">
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Roles Management
            </TabsTrigger>
            <TabsTrigger value="permissions" className="px-1.5 pb-2 pt-1 h-9 rounded-none text-xs font-semibold">
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Permissions Registry
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="roles" className="focus:outline-none">
          <RolesTab />
        </TabsContent>
        
        <TabsContent value="permissions" className="focus:outline-none">
          <PermissionsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
export default RolesPermissionsPage
