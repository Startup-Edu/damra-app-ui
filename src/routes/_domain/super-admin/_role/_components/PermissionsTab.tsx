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
import { usePermissionsQuery, useDeletePermissionMutation } from '../_hooks/useRolesPermissions'
import type { PermissionItem } from '../_types/rolesPermissions.types'
import { PermissionDialog } from './PermissionDialog'

interface PermissionsTabProps {
  active?: boolean
}

export function PermissionsTab({ active = true }: PermissionsTabProps) {
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 350)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [activePermission, setActivePermission] = useState<PermissionItem | null>(null)

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [permissionToDelete, setPermissionToDelete] = useState<PermissionItem | null>(null)

  const { data, isLoading, isError, refetch } = usePermissionsQuery(page, limit, debouncedSearch, active)
  const deleteMutation = useDeletePermissionMutation()

  const response = data
  const permissions = response?.data || []
  const totalElements = response?.total_elements || 0
  const totalPages = response?.total_pages || 1

  const handleEdit = (permission: PermissionItem) => {
    setActivePermission(permission)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setActivePermission(null)
    setDialogOpen(true)
  }

  const handleDeleteTrigger = (permission: PermissionItem) => {
    setPermissionToDelete(permission)
    setDeleteAlertOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (permissionToDelete) {
      deleteMutation.mutate(permissionToDelete.id, {
        onSuccess: () => {
          setDeleteAlertOpen(false)
          setPermissionToDelete(null)
        },
      })
    }
  }

  return (
    <div className="space-y-4">
      <Card className="py-0">
        <TableToolbar
          searchPlaceholder="Search permissions..."
          searchValue={search}
          onSearchChange={(val) => {
            setSearch(val)
            setPage(1)
          }}
          onRefresh={() => refetch()}
          isRefreshing={isLoading}
          actions={
            <Button onClick={handleAdd}>
              <Plus className="mr-1.5 size-4" /> Add Permission
            </Button>
          }
        />

        <CardContent className="p-0">
          <div className="relative w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Resource</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Full Name / Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="pl-6">
                        <Skeleton className="h-4 w-16 rounded" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20 rounded" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-14 rounded-full" />
                      </TableCell>
                      <TableCell className="pr-6">
                        <div className="flex justify-end gap-1.5">
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
                ) : permissions.length === 0 ? (
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
                      title="No permissions registered"
                      description="Create system permissions for resource operations."
                      actionLabel="Create Permission"
                      actionIcon={Plus}
                      onAction={() => {
                        setActivePermission(null)
                        setDialogOpen(true)
                      }}
                    />
                  )
                ) : (
                  permissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="text-foreground capitalize font-medium text-xs">
                        {permission.module || permission.resource || (permission.name?.includes(':') ? permission.name.split(':')[1] : permission.name || '-')}
                      </TableCell>
                      <TableCell className="text-muted-foreground capitalize text-xs">
                        {permission.action || (permission.name?.includes(':') ? permission.name.split(':')[0] : '-')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-[9px] bg-muted/50 border-border">
                          {permission.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {permission.is_active ? (
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
                            actionType="edit"
                            tooltip="Edit Permission"
                            onClick={() => handleEdit(permission)}
                          />
                          <ActionButton
                            actionType="delete"
                            tooltip="Delete Permission"
                            onClick={() => handleDeleteTrigger(permission)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {!isLoading && !isError && permissions.length > 0 && (
            <DataTablePagination
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={limit}
              onPageChange={setPage}
              itemLabel="permissions"
            />
          )}
        </CardContent>
      </Card>

      <PermissionDialog open={dialogOpen} onOpenChange={setDialogOpen} permission={activePermission} />

      <ConfirmationModal
        open={deleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
        title="Delete Permission"
        description={
          <>
            This will permanently delete the permission <span className="font-semibold text-foreground">"{permissionToDelete?.name}"</span>. 
            This operation cannot be undone and roles using this permission will lose access.
          </>
        }
        confirmText="Delete Permission"
        variant="destructive"
        isPending={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
