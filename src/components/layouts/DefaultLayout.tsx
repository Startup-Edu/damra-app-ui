import { Outlet } from '@tanstack/react-router'
import { Sidebar } from '@/components/layouts/Sidebar'
import { Header } from '@/components/layouts/Header'
import { useLayoutStore } from '@/store/useLayoutStore'
import { cn } from '@/lib/utils'

export function DefaultLayout({ children }: { children?: React.ReactNode }) {
  const isSidebarOpen = useLayoutStore((state) => state.isSidebarOpen)

  return (
    <div className="flex min-h-screen w-full bg-neutral-50 dark:bg-neutral-900">
      <Sidebar />
      
      <div 
        className={cn(
          "flex flex-col flex-1 transition-all duration-300 ease-in-out min-w-0",
          isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
        )}
      >
        <Header />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}