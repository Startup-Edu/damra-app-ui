import { Link, useNavigate } from '@tanstack/react-router'
import { Bell, UserCircle, LogOut, User, PanelLeft, Sun, Moon } from 'lucide-react' 
import { useLayoutStore } from '@/store/useLayoutStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useTheme } from '@/components/theme-provider'
import { authApi } from '@/api/auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// 1. Named Export
export function Header() {
  const navigate = useNavigate()
  const toggleSidebar = useLayoutStore((state) => state.toggleSidebar)
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'
  
  const user = useAuthStore((state) => state.user) 
  const clearAuth = useAuthStore((state) => state.clearAuth)

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Backend logout failed:', error)
    }
    clearAuth() 
    navigate({ to: '/auth/login' }) 
  }

  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark')

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background px-4 sm:gap-x-6 sm:px-6">
      
      {/* Sidebar Toggle */}
      <button 
        type="button"
        onClick={toggleSidebar} 
        aria-label="Toggle sidebar"
        className="p-2 -m-2 text-muted-foreground hover:text-foreground transition-[transform,color] duration-160 ease-[var(--ease-out)] active:scale-[0.95] rounded-md"
      >
        <span className="sr-only">Toggle sidebar</span>
        <PanelLeft className="size-5" />
      </button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end items-center">
        <div className="flex items-center gap-x-2 sm:gap-x-3">
          
          {/* Theme Toggle */}
          <button 
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            className="p-2 text-muted-foreground hover:text-foreground transition-[transform,color] duration-160 ease-[var(--ease-out)] active:scale-[0.95] rounded-md"
          >
            {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>

          {/* Notifications */}
          <button 
            type="button"
            aria-label="View notifications"
            className="p-2 text-muted-foreground hover:text-foreground transition-[transform,color] duration-160 ease-[var(--ease-out)] active:scale-[0.95] rounded-md"
          >
            <Bell className="size-5" />
          </button>
          
          <div className="h-6 w-px bg-border" aria-hidden="true" />
          
          {/* User Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                type="button"
                className="flex items-center gap-x-2 p-1.5 text-sm font-medium text-foreground/90 hover:text-foreground transition-[transform,color] duration-160 ease-[var(--ease-out)] active:scale-[0.98] outline-none rounded-md"
              >
                <UserCircle className="size-7 text-muted-foreground" />
                <span className="hidden lg:block">
                  {user?.name || 'Guest'}
                </span>
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || 'Guest'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || 'Not logged in'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Profile Link */}
              <DropdownMenuItem asChild className="cursor-pointer font-medium">
                <Link to="/super-admin/profile" className="flex items-center w-full">
                  <User className="mr-2 size-4" />
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Logout Button */}
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 font-medium"
              >
                <LogOut className="mr-2 size-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  )
}

// 2. Default Export (This prevents the "Uncaught SyntaxError" in Vite)
export default Header;