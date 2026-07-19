import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
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
  PaginationEllipsis,
} from '@/components/ui/pagination'
import { DeleteModal } from '@/components/ui/delete-modal'
import {
  Search,
  RefreshCw,
  Plus,
  Loader2,
  User as UserIcon,
} from 'lucide-react'
import { ActionButton } from '@/components/ui/action-button'
import { useUsersQuery, useDeleteUserMutation } from './_user/_hooks/useUsers'
import type { UserItem } from './_user/_types/users.types'
import { UserDialog } from './_user/_components/UserDialog'
import { toast } from 'sonner'

export const Route = createFileRoute('/_domain/super-admin/users-management')({
  component: UsersManagementPage,
})

function UsersManagementPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Dialog triggers
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeUser, setActiveUser] = useState<UserItem | null>(null)

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null)

  // Debounce search query to prevent excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1) // Reset to first page on new search
    }, 400)

    return () => clearTimeout(handler)
  }, [search])

  // Fetch users with React Query
  const { data, isLoading, isFetching, isError, refetch } = useUsersQuery(page, limit, debouncedSearch)
  const deleteMutation = useDeleteUserMutation()

  const response = data
  const users = response?.data || []
  const totalElements = response?.total_elements || 0
  const totalPages = response?.total_pages || 1

  const handleAdd = () => {
    setActiveUser(null)
    setDialogOpen(true)
  }

  const handleEdit = (user: UserItem) => {
    setActiveUser(user)
    setDialogOpen(true)
  }

  const handleDeleteTrigger = (user: UserItem) => {
    setUserToDelete(user)
    setDeleteAlertOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete.id, {
        onSuccess: () => {
          setDeleteAlertOpen(false)
          setUserToDelete(null)
        },
      })
    }
  }

  return (
    <div className="text-slate-900 dark:text-slate-50">
      
      {/* Page Header */}
      <PageHeader
        title="Users Management"
        description="Manage system access, user roles, authentication status, and details."
      >
        {/* Add User button */}
        <Button onClick={handleAdd} className="text-xs !h-9">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add User
        </Button>
      </PageHeader>

      {/* Main Content Card */}
      <Card className="py-0">
        
        {/* Toolbar */}
        <div className="flex items-center gap-3 p-6 pb-4">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 text-xs"
            />
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              refetch().then(() => {
                toast.success('User list refreshed successfully')
              })
            }}
            disabled={isFetching}
            className="h-10 w-10"
          >
            {isFetching ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <RefreshCw className="h-4.5 w-4.5" />
            )}
          </Button>
        </div>

        <CardContent className="p-0">
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
                    <TableCell colSpan={5} className="py-12 text-center text-rose-500 font-medium text-xs">
                      Failed to fetch users. Please make sure the API server is online.
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  // Empty state
                  <TableRow>
                    <TableCell colSpan={5} className="py-16 text-center ">
                      <div className="flex flex-col items-center gap-2">
                        <UserIcon className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                        <p className="text-xs font-semibold">No users found matching your search</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  // Data state
                  users.map((user) => (
                    <TableRow key={user.id}>
                      {/* User Column with Avatar */}
                      <TableCell className="pl-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} />
                          <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                            {user.name}
                            {user.default_data && (
                              <Badge variant="outline" className="ml-1.5 font-medium text-[9px] px-1.5 py-0 h-4 rounded-sm">
                                Default
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      {/* Email Column */}
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      
                      {/* Roles Column */}
                      <TableCell>
                        <div className="flex gap-1.5 flex-wrap">
                          {user.roles && user.roles.map((role) => (
                            <Badge key={role.id} variant="warning">
                              {role.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      
                      {/* Status Column */}
                      <TableCell>
                        {user.is_active ? (
                          <Badge variant="success">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      
                      {/* Actions Column */}
                      <TableCell className="pr-6 text-right">
                        <div className="flex justify-end gap-1">
                          <ActionButton
                            actionType="edit"
                            tooltip="Edit User"
                            onClick={() => handleEdit(user)}
                          />
                          <ActionButton
                            actionType="delete"
                            tooltip="Delete User"
                            onClick={() => handleDeleteTrigger(user)}
                            disabled={user.default_data}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          {/* Pagination Footer */}
          {!isLoading && !isError && users.length > 0 && (
            <div className="flex items-center justify-between p-4 px-6 border-t bg-slate-50/30 dark:bg-slate-950/10">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
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
                      className={page === 1 ? "pointer-events-none opacity-50" : undefined}
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
                          <PaginationEllipsis />
                        </PaginationItem>
                      )
                    }
                    if (pageNum === totalPages - 1 && page < totalPages - 2) {
                      return (
                        <PaginationItem key="ellipsis-end">
                          <PaginationEllipsis />
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
                      className={page === totalPages || totalPages === 0 ? "pointer-events-none opacity-50" : undefined}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Create/Edit Dialog Form */}
      <UserDialog open={dialogOpen} onOpenChange={setDialogOpen} user={activeUser} />

      {/* User Delete Confirmation Dialog */}
      <DeleteModal
        open={deleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
        description={
          <>
            This will permanently delete the user <span className="font-semibold text-slate-800 dark:text-slate-200">"{userToDelete?.name}"</span> ({userToDelete?.email}). 
            All their profile data will be removed and their active sessions invalidated. This operation cannot be undone.
          </>
        }
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
        confirmText="Delete User"
      />
    </div>
  )
}
