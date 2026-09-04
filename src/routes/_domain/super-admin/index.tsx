import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription, AlertAction } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import {
  Users,
  FolderTree,
  BookOpen,
  Layers,
  RefreshCw,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useDashboardStatsQuery } from './_dashboard/_hooks/useDashboard'
import { StatCard } from './_dashboard/_components/StatCard'
import { UserRatioCard } from './_dashboard/_components/UserRatioCard'
import { QuickActionsCard } from './_dashboard/_components/QuickActionsCard'

export const Route = createFileRoute('/_domain/super-admin/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { user } = useAuthStore()
  const { data, isLoading, isFetching, isError, refetch } = useDashboardStatsQuery()

  const [greeting, setGreeting] = useState('Welcome back')
  const [lastRefreshed, setLastRefreshed] = useState<string>('')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) setGreeting('Good morning')
    else if (hour >= 12 && hour < 17) setGreeting('Good afternoon')
    else if (hour >= 17 && hour < 22) setGreeting('Good evening')
    else setGreeting('Welcome back')

    setLastRefreshed(new Date().toLocaleTimeString())
  }, [])

  const handleRefresh = async () => {
    await refetch()
    setLastRefreshed(new Date().toLocaleTimeString())
  }

  const stats = data?.data

  const usersData = stats?.users || { total: 0, active: 0, inactive: 0 }
  const categoriesData = stats?.categories || { total: 0, active: 0, inactive: 0 }
  const quizPackagesData = stats?.quiz_packages || { total: 0, active: 0, inactive: 0 }
  const learningPathsData = stats?.learning_paths || { total: 0, active: 0, inactive: 0 }

  return (
    <div className="flex flex-col gap-6 text-foreground pb-8">
      {/* Header Banner */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8">
          <div className="flex flex-col gap-2">
            <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {greeting}, {user?.name || 'Administrator'}!
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              Real-time monitoring of Damra learning ecosystem, user engagement, and curriculum assets.
            </CardDescription>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {lastRefreshed && (
              <Badge variant="outline" className="hidden sm:inline-flex gap-1.5 font-mono text-xs py-1.5 px-3">
                <Clock className="size-3 text-muted-foreground" />
                Updated {lastRefreshed}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isFetching}
            >
              {isFetching ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <RefreshCw data-icon="inline-start" />
              )}
              {isFetching ? 'Syncing...' : 'Refresh Stats'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Error Callout using shadcn Alert */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Connection Issue</AlertTitle>
          <AlertDescription>
            Failed to load live statistics. The service might be temporarily unavailable.
          </AlertDescription>
          <AlertAction>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
            >
              Retry
            </Button>
          </AlertAction>
        </Alert>
      )}

      {/* 4 Core Platform Metric Cards */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight uppercase text-muted-foreground">
            Platform Metrics
          </h2>
          <span className="text-xs text-muted-foreground">
            Live database counts
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          {/* Total Users */}
          <StatCard
            title="Total Users"
            total={usersData.total}
            active={usersData.active}
            inactive={usersData.inactive}
            icon={Users}
            href="/super-admin/users-management"
            linkText="Manage Users"
            isLoading={isLoading}
          />

          {/* Total Category */}
          <StatCard
            title="Total Categories"
            total={categoriesData.total}
            active={categoriesData.active}
            inactive={categoriesData.inactive}
            icon={FolderTree}
            href="/super-admin/category"
            linkText="View Categories"
            isLoading={isLoading}
          />

          {/* Total Quiz Package */}
          <StatCard
            title="Total Quiz Packages"
            total={quizPackagesData.total}
            active={quizPackagesData.active}
            inactive={quizPackagesData.inactive}
            icon={BookOpen}
            href="/super-admin/quizepack"
            linkText="Manage Packages"
            isLoading={isLoading}
          />

          {/* Total Learning Path */}
          <StatCard
            title="Total Learning Paths"
            total={learningPathsData.total}
            active={learningPathsData.active}
            inactive={learningPathsData.inactive}
            icon={Layers}
            href="/super-admin/learning-path"
            linkText="Explore Paths"
            isLoading={isLoading}
          />
        </div>
      </section>

      {/* Detailed Insights & Quick Actions Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Activity Ratio Breakdown */}
        <div className="lg:col-span-6 xl:col-span-5">
          <UserRatioCard
            total={usersData.total}
            active={usersData.active}
            inactive={usersData.inactive}
            isLoading={isLoading}
          />
        </div>

        {/* Quick Launchpad Shortcuts */}
        <div className="lg:col-span-6 xl:col-span-7">
          <QuickActionsCard />
        </div>
      </section>
    </div>
  )
}
