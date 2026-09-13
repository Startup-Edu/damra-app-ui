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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import {
  RefreshCw,
  Plus,
  Loader2,
} from 'lucide-react'
import { ActionButton } from '@/components/ui/action-button'
import { TableEmptyStateRow, SearchInput } from '@/components/ui/shared'
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
        <div className="flex items-center gap-3 p-5 pb-4">
          <SearchInput
            placeholder="Search permissions..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            onClear={() => {
              setSearch('')
              setPage(1)
            }}
            containerClassName="flex-1 max-w-md"
            sizeVariant="default"
          />

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isLoading}
              className="h-9 w-9"
            >
              {isLoading ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : (
                <RefreshCw className="h-4.5 w-4.5" />
              )}
            </Button>
            <Button onClick={handleAdd} className="h-10 text-xs">
              <Plus className="mr-1.5 h-4 w-4" /> Add Permission
            </Button>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Resource
                  </TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Action
                  </TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Full Name / Key
                  </TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="pr-6 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </TableHead>
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
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <Skeleton className="h-8 w-8 rounded-md" />
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
                      <TableCell className="pl-6 py-3 text-foreground capitalize font-medium text-xs">
                        {permission.resource || (permission.name?.includes(':') ? permission.name.split(':')[0] : permission.name || '-')}
                      </TableCell>
                      <TableCell className="text-muted-foreground capitalize text-xs">
                        {permission.action || (permission.name?.includes(':') ? permission.name.split(':')[1] : '-')}
                      </TableCell>
                      <TableCell className="py-3">
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
                      <TableCell className="pr-6 text-right">
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
            <div className="flex items-center justify-between p-4 px-6 border-t bg-muted/30">
              <div className="text-xs text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{((page - 1) * limit) + 1}</span> to{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(page * limit, totalElements)}
                </span>{" "}
                of <span className="font-semibold text-foreground">{totalElements}</span> permissions
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
                      className={page === 1 ? "pointer-events-none opacity-50 h-8 text-[11px]" : "h-8 text-[11px]"}
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
                            className="h-8 w-8 text-[11px]"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    }
                    if (pageNum === 2 && page > 3) {
                      return (
                        <PaginationItem key="ellipsis-start">
                          <span className="px-2 text-muted-foreground text-xs">...</span>
                        </PaginationItem>
                      )
                    }
                    if (pageNum === totalPages - 1 && page < totalPages - 2) {
                      return (
                        <PaginationItem key="ellipsis-end">
                          <span className="px-2 text-muted-foreground text-xs">...</span>
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
                      className={page === totalPages || totalPages === 0 ? "pointer-events-none opacity-50 h-8 text-[11px]" : "h-8 text-[11px]"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <PermissionDialog open={dialogOpen} onOpenChange={setDialogOpen} permission={activePermission} />

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent className="max-w-md p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              This will permanently delete the permission <span className="font-semibold text-foreground">"{permissionToDelete?.name}"</span>. 
              This operation cannot be undone and roles using this permission will lose access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={deleteMutation.isPending} className="h-9 text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteConfirm()
              }}
              disabled={deleteMutation.isPending}
              className="h-9 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 size-3.5 animate-spin" />}
              Delete Permission
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
