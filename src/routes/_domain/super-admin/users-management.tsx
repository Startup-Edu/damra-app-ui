import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
import { Avatar } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Search,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Loader2,
  User,
} from 'lucide-react'
import { usersApi } from '@/api/users'

export const Route = createFileRoute('/_domain/super-admin/users-management')({
  component: UsersManagementPage,
})

function UsersManagementPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search query to prevent excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1) // Reset to first page on new search
    }, 400)

    return () => clearTimeout(handler)
  }, [search])

  // Fetch users with React Query
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['users', page, limit, debouncedSearch],
    queryFn: () => usersApi.listUsers(page, limit, debouncedSearch),
  })

  const response = data
  const users = response?.data || []
  const totalElements = response?.total_elements || 0
  const totalPages = response?.total_pages || 1

  return (
    <div className="p-6 mx-auto w-full max-w-6xl space-y-6 text-slate-900 dark:text-slate-50">
      
      {/* Page Header */}
      <PageHeader
        title="Users Management"
        description="Manage system access, user roles, authentication status, and details."
      >
        {/* Add User button */}
        <Button className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </PageHeader>

      {/* Main Content Card */}
      <Card variant="glass">
        
        {/* Toolbar */}
        <div className="flex items-center gap-3 p-6 pb-4">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading}
            className="h-10 w-10"
          >
            {isLoading ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <RefreshCw className="h-4.5 w-4.5" />
            )}
          </Button>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">User</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {isLoading ? (
                  // Loading state using Skeleton components
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-full" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-14 rounded-full" />
                      </TableCell>
                      <TableCell className="pr-6">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  // Error state
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-rose-500 font-medium">
                      Failed to fetch users. Please make sure the API server is online.
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  // Empty state
                  <TableRow>
                    <TableCell colSpan={5} className="py-16 text-center ">
                      <div className="flex flex-col items-center gap-2">
                        <User className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                        <p className="text-sm font-medium">No users found matching your search</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  // Data state
                  users.map((user) => (
                    <TableRow key={user.id}>
                      {/* User Column with Avatar */}
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} />
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {user.name}
                            {user.default_data && (
                              <span className="ml-1.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      {/* Email Column */}
                      <TableCell className="text-slate-600 dark:text-slate-300">
                        {user.email}
                      </TableCell>
                      
                      {/* Roles Column */}
                      <TableCell className="py-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {user.roles.map((role) => (
                            <Badge
                              key={role.id}
                              variant="warning"
                              className="font-semibold"
                            >
                              {role.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      
                      {/* Status Column */}
                      <TableCell>
                        {user.is_active ? (
                          <Badge variant="success" className="font-semibold">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="font-semibold">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      
                      {/* Actions Column */}
                      <TableCell className="pr-6 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          {!isLoading && !isError && users.length > 0 && (
            <div className="flex items-center justify-between p-4 px-6 border-t bg-slate-50/30 dark:bg-slate-950/10">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{((page - 1) * limit) + 1}</span> to{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {Math.min(page * limit, totalElements)}
                </span>{" "}
                of <span className="font-semibold text-slate-900 dark:text-slate-100">{totalElements}</span> users
              </div>
              
              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (page > 1) setPage(page - 1)
                      }}
                      className={page === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1
                    if (pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - page) <= 1) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              setPage(pageNum)
                            }}
                            isActive={page === pageNum}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    }
                    if (pageNum === 2 && page > 3) {
                      return (
                        <PaginationItem key="ellipsis-start">
                          <span className="px-2 text-slate-400">...</span>
                        </PaginationItem>
                      )
                    }
                    if (pageNum === totalPages - 1 && page < totalPages - 2) {
                      return (
                        <PaginationItem key="ellipsis-end">
                          <span className="px-2 text-slate-400">...</span>
                        </PaginationItem>
                      )
                    }
                    return null
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (page < totalPages) setPage(page + 1)
                      }}
                      className={page === totalPages || totalPages === 0 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
