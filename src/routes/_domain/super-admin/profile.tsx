import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/ui/page-header'
import { ProfileDetailsCard } from './_profile/_components/ProfileDetailsCard'
import { ChangePasswordCard } from './_profile/_components/ChangePasswordCard'

export const Route = createFileRoute('/_domain/super-admin/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  return (
    <div className="p-6 max-w-2xl mx-auto w-full text-slate-900 dark:text-slate-50 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Account Settings"
        description="Manage your profile information and account security details."
      />

      {/* Profile Details Card */}
      <ProfileDetailsCard />

      {/* Change Password Card */}
      <ChangePasswordCard />
    </div>
  )
}

export default ProfilePage