import { Link } from '@tanstack/react-router'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import {
  FolderTree,
  BookOpen,
  Layers,
  Users,
  ShieldCheck,
  Activity,
  ArrowRight,
} from 'lucide-react'

const actions = [
  {
    title: 'Category Setup',
    description: 'Organize subjects, levels & taxonomies',
    href: '/super-admin/category',
    icon: FolderTree,
  },
  {
    title: 'Quiz Packages',
    description: 'Configure package bundles & economy',
    href: '/super-admin/quizepack',
    icon: BookOpen,
  },
  {
    title: 'Learning Paths',
    description: 'Curate learning nodes & sequence stages',
    href: '/super-admin/learning-path',
    icon: Layers,
  },
  {
    title: 'Users Management',
    description: 'Manage admin accounts & mobile players',
    href: '/super-admin/users-management',
    icon: Users,
  },
  {
    title: 'Roles & Permissions',
    description: 'Fine-tune RBAC authorization policies',
    href: '/super-admin/roles-permissions',
    icon: ShieldCheck,
  },
  {
    title: 'System Health',
    description: 'Verify API endpoints & server status',
    href: '/super-admin/check-health',
    icon: Activity,
  },
]

export function QuickActionsCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Management Launchpad</CardTitle>
        <CardDescription className="text-xs">
          Direct navigation to core platform services and configurations
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.title}
                to={action.href as any}
                className="group p-3 rounded-xl border border-border bg-card hover:bg-accent/50 hover:text-accent-foreground transition-all duration-200 flex items-start gap-3 hover:-translate-y-0.5"
              >
                <div className="size-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  <Icon className="size-4.5" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                      {action.title}
                    </span>
                    <ArrowRight className="size-3 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </div>
                  <span className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {action.description}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
