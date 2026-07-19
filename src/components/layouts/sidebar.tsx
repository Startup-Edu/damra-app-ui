import { Link } from '@tanstack/react-router'
import { LayoutDashboard, Users, GraduationCap, Shield, ShieldCheck, X, PanelsTopLeft, FolderTree, Layers, BookOpen, FileQuestion, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLayoutStore } from '@/store/useLayoutStore'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  // Example for the SuperAdmin route you created
  { name: 'User Management', href: '/super-admin/users-management', icon: Users },
  { name: 'Roles & Permissions', href: '/super-admin/roles-permissions', icon: ShieldCheck },
  { name: 'Categories', href: '/super-admin/category', icon: FolderTree },
  { name: 'Grades', href: '/super-admin/grade', icon: GraduationCap },
  { name: 'Learning Path', href: '/super-admin/learning-path', icon: Layers },
  { name: 'Quiz Packages', href: '/super-admin/quizepack', icon: BookOpen },
  { name: 'Question Types', href: '/super-admin/questiontype', icon: FileQuestion },
  { name: 'Questions', href: '/super-admin/question', icon: HelpCircle },
  // Example if you have an Admin dashboard
  { name: 'Admin Portal', href: '/admin', icon: Shield },
  { name: 'Check Health', href: '/super-admin/check-health', icon: Shield },
  // Example for the Teacher index route
  { name: 'Teacher Portal', href: '/teacher', icon: GraduationCap },
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
          "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out",
          "bg-white border-r border-border dark:bg-neutral-950",
          isSidebarOpen ? "w-64 translate-x-0" : "-translate-x-full lg:w-20 lg:translate-x-0"
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2 text-neutral-900 dark:text-white">
            <PanelsTopLeft className="h-6 w-6 text-neutral-700 dark:text-neutral-100" />
            {isSidebarOpen && <span className="font-semibold text-lg tracking-tight">System</span>}
          </Link>
          
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden p-1 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-y-2 p-4 overflow-y-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              // Cast it to any temporarily if TS complains while you are still building the route tree
              to={item.href as any}
              className={cn(
                "group flex items-center gap-x-3 rounded-md p-2 text-sm font-medium transition-all duration-200",
                !isSidebarOpen && "lg:justify-center"
              )}
              activeProps={{
                className: "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white"
              }}
              inactiveProps={{
                className: "hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800/50 dark:hover:text-white"
              }}
              title={!isSidebarOpen ? item.name : undefined}
            >
              {({ isActive }) => (
                <>
                  <item.icon 
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors", 
                      isActive 
                        ? "text-neutral-900 dark:text-white" 
                        : "text-neutral-500 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-white"
                    )} 
                  />
                  {isSidebarOpen && <span>{item.name}</span>}
                </>
              )}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}