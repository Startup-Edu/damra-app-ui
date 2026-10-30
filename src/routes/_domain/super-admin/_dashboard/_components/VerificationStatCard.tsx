import { Link } from '@tanstack/react-router'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowUpRight, GraduationCap } from 'lucide-react'

interface VerificationStatCardProps {
  total: number
  pending: number
  approved: number
  rejected: number
  isLoading?: boolean
}

export function VerificationStatCard({
  total,
  pending,
  approved,
  rejected,
  isLoading = false,
}: VerificationStatCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="size-9 rounded-lg" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-9 w-20" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Skeleton className="h-4 w-24" />
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="group transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Student Verifications
        </CardTitle>
        <div className="size-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center transition-colors group-hover:bg-primary/10 group-hover:text-primary">
          <GraduationCap className="size-4.5" />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {/* Total & Pending Alert Pill */}
        <div className="flex items-baseline gap-2.5">
          <span className="text-3xl font-extrabold tracking-tight text-foreground font-mono">
            {total.toLocaleString()}
          </span>
          {pending > 0 ? (
            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[11px] font-semibold animate-pulse">
              {pending} Pending Review
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[11px] font-medium text-muted-foreground">
              Queue Clear
            </Badge>
          )}
        </div>

        {/* Breakdown Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="gap-1.5 py-0.5 text-xs font-normal border-amber-500/30 text-amber-700 dark:text-amber-300">
            <span className="size-1.5 rounded-full bg-amber-500" />
            {pending.toLocaleString()} Pending
          </Badge>
          <Badge variant="outline" className="gap-1.5 py-0.5 text-xs font-normal border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            {approved.toLocaleString()} Approved
          </Badge>
          <Badge variant="secondary" className="gap-1.5 py-0.5 text-xs font-normal">
            <span className="size-1.5 rounded-full bg-muted-foreground" />
            {rejected.toLocaleString()} Rejected
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="pt-2 flex items-center justify-between border-t border-border/60">
        <Link
          to="/super-admin/student-verification"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group-hover:text-primary"
        >
          <span>Review Queue</span>
          <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
        <span className="text-[11px] font-mono text-muted-foreground">
          Total {total}
        </span>
      </CardFooter>
    </Card>
  )
}
