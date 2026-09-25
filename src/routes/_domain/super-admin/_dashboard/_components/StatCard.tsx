import { Link } from '@tanstack/react-router'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowUpRight, type LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  total: number
  active: number
  inactive: number
  icon: LucideIcon
  href: string
  linkText?: string
  isLoading?: boolean
}

export function StatCard({
  title,
  total,
  active,
  inactive,
  icon: Icon,
  href,
  linkText = 'Manage',
  isLoading = false,
}: StatCardProps) {
  const activePercent = total > 0 ? Math.round((active / total) * 100) : 0

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-4 w-28" />
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
          {title}
        </CardTitle>
        <div className="size-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center transition-colors group-hover:bg-primary/10 group-hover:text-primary">
          <Icon className="size-4.5" />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {/* Counter & Percentage */}
        <div className="flex items-baseline gap-2.5">
          <span className="text-3xl font-extrabold tracking-tight text-foreground font-mono">
            {total.toLocaleString()}
          </span>
          {total > 0 && (
            <Badge variant="secondary" className="text-[11px] font-medium">
              {activePercent}% Active
            </Badge>
          )}
        </div>

        {/* Active & Inactive Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1.5 py-0.5 text-xs font-normal">
            <span className="size-1.5 rounded-full bg-primary" />
            {active.toLocaleString()} Active
          </Badge>
          <Badge variant="secondary" className="gap-1.5 py-0.5 text-xs font-normal">
            <span className="size-1.5 rounded-full bg-muted-foreground" />
            {inactive.toLocaleString()} Inactive
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="pt-2 flex items-center justify-between border-t border-border/60">
        <Link
          to={href as any}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group-hover:text-primary"
        >
          <span>{linkText}</span>
          <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
        <span className="text-[11px] font-mono text-muted-foreground">
          Total {total}
        </span>
      </CardFooter>
      
    </Card>
  )
}
