import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Plus } from 'lucide-react'
import { ActionButton } from '@/components/ui/action-button'
import { TableEmptyStateRow, TableToolbar, DataTablePagination, ConfirmationModal } from '@/components/ui/shared'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useRolesQuery, useDeleteRoleMutation } from '../_hooks/useRolesPermissions'
import type { RoleItem } from '../_types/rolesPermissions.types'
import { RoleDialog } from './RoleDialog'
import { ManagePermissionsDialog } from './ManagePermissionsDialog'

export function RolesTab() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 350)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeRole, setActiveRole] = useState<RoleItem | null>(null)
  
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false)
  const [permissionsRole, setPermissionsRole] = useState<{ id: string; name: string } | null>(null)

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<RoleItem | null>(null)

  const { data, isLoading, isError, refetch } = useRolesQuery(page, limit, debouncedSearch)
  const deleteMutation = useDeleteRoleMutation()

  const response = data
  const roles = response?.data || []
  const totalElements = response?.total_elements || 0
  const totalPages = response?.total_pages || 1

  const handleEdit = (role: RoleItem) => {
    setActiveRole(role)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setActiveRole(null)
    setDialogOpen(true)
  }

  const handleManagePermissions = (role: RoleItem) => {
    setPermissionsRole({ id: role.id, name: role.name })
    setPermissionsDialogOpen(true)
  }

  const handleDeleteTrigger = (role: RoleItem) => {
    setRoleToDelete(role)
    setDeleteAlertOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (roleToDelete) {
      deleteMutation.mutate(roleToDelete.id, {
        onSuccess: () => {
          setDeleteAlertOpen(false)
          setRoleToDelete(null)
        },
      })
    }
  }

  return (
    <div className="space-y-4">
      <Card className="py-0">
        <TableToolbar
          searchPlaceholder="Search roles..."
          searchValue={search}
          onSearchChange={(val) => {
            setSearch(val)
            setPage(1)
          }}
          onRefresh={() => refetch()}
          isRefreshing={isLoading}
          actions={
            <Button onClick={handleAdd}>
              <Plus className="mr-1.5 size-4" /> Add Role
            </Button>
          }
        />

        <CardContent className="p-0">
          <div className="relative w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Role Name</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="pl-6">
                        <Skeleton className="h-4 w-28 rounded" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20 rounded" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-14 rounded-full" />
                      </TableCell>
                      <TableCell className="pr-6">
                        <div className="flex justify-end gap-1.5">
                          <Skeleton className="size-8 rounded-md" />
                          <Skeleton className="size-8 rounded-md" />
                          <Skeleton className="size-8 rounded-md" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableEmptyStateRow
                    colSpan={4}
                    variant="error"
                    onAction={() => refetch()}
                  />
                ) : roles.length === 0 ? (
                  debouncedSearch ? (
                    <TableEmptyStateRow
                      colSpan={4}
                      variant="search"
                      searchQuery={debouncedSearch}
                      onClear={() => {
                        setSearch('')
                        setPage(1)
                      }}
                    />
                  ) : (
                    <TableEmptyStateRow
                      colSpan={4}
                      variant="empty"
                      title="No roles created yet"
                      description="Create a role to manage user permissions and access levels."
                      actionLabel="Create Role"
                      actionIcon={Plus}
                      onAction={() => {
                        setActiveRole(null)
                        setDialogOpen(true)
                      }}
                    />
                  )
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <span className="font-bold text-foreground tracking-wide text-xs">
                          {role.name}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {role.created_at}
                      </TableCell>
                      <TableCell>
                        {role.is_active ? (
                          <Badge variant="success" className="font-semibold text-[9px]">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="font-semibold text-[9px]">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <ActionButton
                            actionType="key"
                            tooltip="Manage Permissions"
                            onClick={() => handleManagePermissions(role)}
                          />
                          <ActionButton
                            actionType="edit"
                            tooltip="Edit Role"
                            onClick={() => handleEdit(role)}
                          />
                          <ActionButton
                            actionType="delete"
                            tooltip="Delete Role"
                            onClick={() => handleDeleteTrigger(role)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {!isLoading && !isError && roles.length > 0 && (
            <DataTablePagination
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={limit}
              onPageChange={setPage}
              itemLabel="roles"
            />
          )}
        </CardContent>
      </Card>

      <RoleDialog open={dialogOpen} onOpenChange={setDialogOpen} role={activeRole} />

      {permissionsRole && (
        <ManagePermissionsDialog
          open={permissionsDialogOpen}
          onOpenChange={setPermissionsDialogOpen}
          roleId={permissionsRole.id}
          roleName={permissionsRole.name}
        />
      )}

      <ConfirmationModal
        open={deleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
        title="Delete Role"
        description={
          <>
            This will soft-delete the role <span className="font-semibold text-foreground">"{roleToDelete?.name}"</span>. 
            Users currently assigned to this role might experience authentication issues.
          </>
        }
        confirmText="Delete Role"
        variant="destructive"
        isPending={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
