import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { DeleteModal } from '@/components/ui/delete-modal'
import { TableEmptyStateRow, TableToolbar, DataTablePagination } from '@/components/ui/shared'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { Plus } from 'lucide-react'
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
  const debouncedSearch = useDebouncedValue(search, 350)

  // Dialog triggers
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeUser, setActiveUser] = useState<UserItem | null>(null)

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null)

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
    <div className="text-foreground">
      
      {/* Page Header */}
      <PageHeader
        title="Users Management"
        description="Manage system access, user roles, authentication status, and details."
      >
        {/* Add User button */}
        <Button onClick={handleAdd}>
          <Plus className="mr-1.5 size-4" /> Add User
        </Button>
      </PageHeader>

      {/* Main Content Card */}
      <Card className="py-0">
        
        {/* Toolbar */}
        <TableToolbar
          searchPlaceholder="Search users by name or email..."
          searchValue={search}
          onSearchChange={(val) => {
            setSearch(val)
            setPage(1)
          }}
          onRefresh={() => {
            refetch().then(() => {
              toast.success('User list refreshed successfully')
            })
          }}
          isRefreshing={isFetching}
        />

        <CardContent className="p-0">
          <div className="relative w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>User</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {isLoading ? (
                  // Loading state using Skeleton components
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <Skeleton className="size-9 rounded-full" />
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
                          <Skeleton className="size-8 rounded-md" />
                          <Skeleton className="size-8 rounded-md" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableEmptyStateRow
                    colSpan={5}
                    variant="error"
                    onAction={() => refetch()}
                  />
                ) : users.length === 0 ? (
                  debouncedSearch ? (
                    <TableEmptyStateRow
                      colSpan={5}
                      variant="search"
                      searchQuery={debouncedSearch}
                      onClear={() => {
                        setSearch('')
                        setPage(1)
                      }}
                    />
                  ) : (
                    <TableEmptyStateRow
                      colSpan={5}
                      variant="empty"
                      title="No users registered yet"
                      description="Create your first administrative or system user to get started."
                      actionLabel="Add User"
                      actionIcon={Plus}
                      onAction={handleAdd}
                    />
                  )
                ) : (
                  // Data state
                  users.map((user) => (
                    <TableRow key={user.id}>
                      {/* User Column with Avatar */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} />
                          <div className="font-semibold text-foreground text-xs">
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
                      <TableCell className="text-right">
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
          </div>

          {/* Pagination Footer */}
          {!isLoading && !isError && users.length > 0 && (
            <DataTablePagination
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={limit}
              onPageChange={setPage}
              itemLabel="users"
            />
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
            This will permanently delete the user <span className="font-semibold text-foreground">"{userToDelete?.name}"</span> ({userToDelete?.email}). 
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
