import { Link } from '@tanstack/react-router'
import { LayoutDashboard, Users, GraduationCap, Shield, ShieldCheck, X, PanelsTopLeft, FolderTree, Layers, BookOpen, FileQuestion, HelpCircle, UserCheck, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLayoutStore } from '@/store/useLayoutStore'
import { ScrollArea } from '@/components/ui/scroll-area'

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

interface NavGroup {
  groupName?: string
  items: NavItem[]
}

const navigationGroups: NavGroup[] = [
  {
    items: [
      { name: 'Dashboard', href: '/super-admin', icon: LayoutDashboard },
    ]
  },
  {
    groupName: 'Data and Set-Up',
    items: [
      { name: 'Category', href: '/super-admin/category', icon: FolderTree },
      { name: 'Grade', href: '/super-admin/grade', icon: GraduationCap },
      { name: 'Question Type', href: '/super-admin/questiontype', icon: FileQuestion },
      { name: 'Question', href: '/super-admin/question', icon: HelpCircle },
      { name: 'Quiz Package', href: '/super-admin/quizepack', icon: BookOpen },
      { name: 'Learning Path', href: '/super-admin/learning-path', icon: Layers },
    ]
  },
  {
    groupName: 'Authentication',
    items: [
      { name: 'Users Management', href: '/super-admin/users-management', icon: Users },
      { name: 'Student Verifications', href: '/super-admin/student-verification', icon: UserCheck },
      { name: 'Roles & Permission', href: '/super-admin/roles-permissions', icon: ShieldCheck },
    ]
  },
  {
    groupName: 'System',
    items: [
      { name: 'Admin Portal', href: '/admin', icon: Shield },
      { name: 'Check Health', href: '/super-admin/check-health', icon: Shield },
      { name: 'Teacher Portal', href: '/teacher', icon: GraduationCap },
    ]
  }
]

export function Sidebar() {
  const { isSidebarOpen, setSidebarOpen } = useLayoutStore()

  return (
    <>
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-neutral-900/50 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-200 ease-[var(--ease-out)]",
          "bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
          isSidebarOpen ? "w-64 translate-x-0" : "-translate-x-full lg:w-20 lg:translate-x-0"
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2.5 text-sidebar-foreground">
            <PanelsTopLeft className="size-6 text-primary" />
            {isSidebarOpen && <span className="font-semibold text-lg tracking-tight">Damra App</span>}
          </Link>
          
          <button 
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden p-1.5 rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-[transform,colors] duration-160 ease-[var(--ease-out)] active:scale-[0.95]"
          >
            <X className="size-5" />
          </button>
        </div>

        <ScrollArea className="flex-1 px-3">
          <nav className="flex flex-col gap-y-3 py-4">
            {navigationGroups.map((group, groupIdx) => (
              <div key={group.groupName || groupIdx} className="flex flex-col gap-y-1">
                {groupIdx > 0 && (
                  <div className="my-1 border-t border-sidebar-border/60" />
                )}
                {group.groupName && isSidebarOpen && (
                  <div className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                    {group.groupName}
                  </div>
                )}
                {group.items.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href as any}
                    activeOptions={{ exact: item.href === '/super-admin' }}
                    className={cn(
                      "group flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-[transform,background-color,color,border-color,box-shadow] duration-160 ease-[var(--ease-out)] active:scale-[0.98]",
                      !isSidebarOpen && "lg:justify-center lg:px-2"
                    )}
                    activeProps={{
                      className: "bg-white text-foreground font-semibold border border-border/80 dark:bg-white/[0.08] dark:text-white dark:border-white/[0.08]"
                    }}
                    inactiveProps={{
                      className: "text-muted-foreground hover:bg-neutral-500/10 hover:text-foreground border border-transparent"
                    }}
                    title={!isSidebarOpen ? item.name : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon 
                          className={cn(
                            "size-5 shrink-0 transition-colors", 
                            isActive 
                              ? "text-primary" 
                              : "text-muted-foreground group-hover:text-foreground"
                          )} 
                        />
                        {isSidebarOpen && (
                          <span className="truncate">
                            {item.name}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </ScrollArea>
      </aside>
    </>
  )
}
