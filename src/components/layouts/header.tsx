import { Link, useNavigate } from '@tanstack/react-router'
import { Menu, Bell, UserCircle, LogOut, User } from 'lucide-react' 
import { useLayoutStore } from '@/store/useLayoutStore'
import { useAuthStore } from '@/store/useAuthStore'
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
  
  const user = useAuthStore((state) => state.user) 
  const clearAuth = useAuthStore((state) => state.clearAuth)

  const handleLogout = () => {
    clearAuth() 
    navigate({ to: '/auth/login' }) 
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-neutral-200 bg-white px-4 sm:gap-x-6 sm:px-6 lg:px-8 dark:bg-neutral-950 dark:border-neutral-800">
      
      {/* Sidebar Toggle */}
      <button 
        onClick={toggleSidebar} 
        className="p-2 -m-2 text-neutral-500 hover:text-neutral-900 transition-colors dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        <span className="sr-only">Toggle sidebar</span>
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end items-center">
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          
          {/* Notifications */}
          <button className="p-2 text-neutral-400 hover:text-neutral-500 transition-colors">
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" />
          </button>
          
          <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800" aria-hidden="true" />
          
          {/* User Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-x-2 p-1.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-colors outline-none">
                <UserCircle className="h-7 w-7 text-neutral-400" />
                <span className="hidden lg:block">
                  {user?.name || 'Guest'}
                </span>
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56 rounded-xl border-neutral-200 dark:border-neutral-800">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || 'Guest'}</p>
                  <p className="text-xs leading-none text-neutral-500 dark:text-neutral-400">
                    {user?.email || 'Not logged in'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-800" />
              
              {/* Profile Link */}
              <DropdownMenuItem asChild className="cursor-pointer font-medium rounded-lg">
                <Link to="/super-admin/profile" className="flex items-center w-full">
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-800" />
              
              {/* Logout Button */}
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-500 dark:focus:text-red-500 font-medium rounded-lg"
              >
                <LogOut className="mr-2 h-4 w-4" />
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