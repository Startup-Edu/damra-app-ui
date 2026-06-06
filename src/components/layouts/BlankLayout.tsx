import { Outlet } from '@tanstack/react-router'

export function BlankLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-neutral-50 dark:bg-neutral-900 transition-colors">
      {/* Renders whatever page is matched inside this layout */}
      {children || <Outlet />}
    </div>
  )
}