import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/ui/page-header'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { RolesTab } from './_role/_components/RolesTab'
import { PermissionsTab } from './_role/_components/PermissionsTab'
import { ShieldCheck } from 'lucide-react'

import { useState } from 'react'

export const Route = createFileRoute('/_domain/super-admin/roles-permissions')({
  component: RolesPermissionsPage,
})

function RolesPermissionsPage() {
  const [tab, setTab] = useState<'roles' | 'permissions'>('roles')

  return (
    <div className="text-foreground">
      {/* Page Header */}
      <PageHeader
        title="Roles & Permissions"
        description="Configure application roles, define direct system permission scopes, and configure authorization matrix."
      />

      {/* Tabs Container */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as 'roles' | 'permissions')} className="w-full">
        <div className="border-b border-border mb-4">
          <TabsList variant="line" className="h-10 gap-6">
            <TabsTrigger value="roles" className="h-10 px-1 rounded-none text-xs font-medium data-active:font-semibold">
              <ShieldCheck className="mr-1.5 size-4" /> Roles Management
            </TabsTrigger>
            <TabsTrigger value="permissions" className="h-10 px-1 rounded-none text-xs font-medium data-active:font-semibold">
              <ShieldCheck className="mr-1.5 size-4" /> Permissions Registry
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="roles" className="focus:outline-none">
          <RolesTab />
        </TabsContent>
        
        <TabsContent value="permissions" className="focus:outline-none">
          <PermissionsTab active={tab === 'permissions'} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
export default RolesPermissionsPage
