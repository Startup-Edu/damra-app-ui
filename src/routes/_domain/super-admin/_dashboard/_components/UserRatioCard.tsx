import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, UserCheck, UserX } from 'lucide-react'

interface UserRatioCardProps {
  total: number
  active: number
  inactive: number
  isLoading?: boolean
}

export function UserRatioCard({
  total,
  active,
  inactive,
  isLoading = false,
}: UserRatioCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="flex flex-col gap-6 pt-2">
          <Skeleton className="h-3 w-full rounded-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const activePercent = total > 0 ? Math.round((active / total) * 100) : 0
  const inactivePercent = total > 0 ? 100 - activePercent : 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="size-4 text-primary" />
              User Engagement & Activity Ratio
            </CardTitle>
            <CardDescription className="text-xs">
              Distribution of active authenticated accounts versus dormant or inactive accounts
            </CardDescription>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            {total.toLocaleString()} Users
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-5 pt-2">
        {/* Segmented Progress Bar */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-foreground flex items-center gap-1.5">
              <UserCheck className="size-3.5 text-primary" />
              Active ({activePercent}%)
            </span>
            <span className="text-muted-foreground flex items-center gap-1.5">
              <UserX className="size-3.5" />
              Inactive ({inactivePercent}%)
            </span>
          </div>

          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden flex p-0.5 border border-border/60">
            <div
              style={{ width: `${activePercent}%` }}
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              title={`Active: ${active} users (${activePercent}%)`}
            />
            <div
              style={{ width: `${inactivePercent}%` }}
              className="h-full rounded-full bg-muted-foreground/30 transition-all duration-500 ease-out"
              title={`Inactive: ${inactive} users (${inactivePercent}%)`}
            />
          </div>
        </div>

        {/* Comparison Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl border border-border bg-card flex items-center gap-3">
            <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <UserCheck className="size-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium">Active Accounts</span>
              <span className="text-xl font-bold font-mono text-foreground">
                {active.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-card flex items-center gap-3">
            <div className="size-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0">
              <UserX className="size-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium">Inactive Accounts</span>
              <span className="text-xl font-bold font-mono text-foreground">
                {inactive.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
