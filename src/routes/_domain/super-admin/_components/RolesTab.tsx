import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
  Search,
  RefreshCw,
  Plus,
  Loader2,
  Shield,
} from 'lucide-react'
import { ActionButton } from '@/components/ui/action-button'
import { useRolesQuery, useDeleteRoleMutation } from '../_hooks/useRolesPermissions'
import type { RoleItem } from '../_types/rolesPermissions.types'
import { RoleDialog } from './RoleDialog'
import { ManagePermissionsDialog } from './ManagePermissionsDialog'

export function RolesTab() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Modal triggers
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeRole, setActiveRole] = useState<RoleItem | null>(null)
  
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false)
  const [permissionsRole, setPermissionsRole] = useState<{ id: string; name: string } | null>(null)

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<RoleItem | null>(null)

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(handler)
  }, [search])

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
      {/* Main Content Card */}
      <Card className="py-0">
        {/* Toolbar */}
        <div className="flex items-center gap-3 p-6 pb-4">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

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
              <Plus className="mr-1.5 h-4 w-4" /> Add Role
            </Button>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Role Name
                  </TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Created By
                  </TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Created Date
                  </TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </TableHead>
                  <TableHead className="pr-6 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Actions
                  </TableHead>
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
                        <Skeleton className="h-4 w-24 rounded" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20 rounded" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-14 rounded-full" />
                      </TableCell>
                      <TableCell className="pr-6">
                        <div className="flex justify-end gap-1.5">
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-rose-500 font-medium text-xs">
                      Failed to fetch system roles. Please check connection.
                    </TableCell>
                  </TableRow>
                ) : roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-600">
                        <Shield className="h-8 w-8 opacity-60" />
                        <p className="text-xs font-semibold">No system roles found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="pl-6 py-3.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200 tracking-wide text-xs">
                          {role.name}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400 text-xs">
                        {role.user?.name || 'System / Default'}
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs">
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
                      <TableCell className="pr-6 text-right">
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

          {/* Pagination Footer */}
          {!isLoading && !isError && roles.length > 0 && (
            <div className="flex items-center justify-between p-4 px-6 border-t bg-slate-50/30 dark:bg-slate-950/10">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{((page - 1) * limit) + 1}</span> to{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {Math.min(page * limit, totalElements)}
                </span>{" "}
                of <span className="font-semibold text-slate-900 dark:text-slate-100">{totalElements}</span> roles
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
                          <span className="px-2 text-slate-400 text-xs">...</span>
                        </PaginationItem>
                      )
                    }
                    if (pageNum === totalPages - 1 && page < totalPages - 2) {
                      return (
                        <PaginationItem key="ellipsis-end">
                          <span className="px-2 text-slate-400 text-xs">...</span>
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

      {/* Add/Edit Role Modal Dialog */}
      <RoleDialog open={dialogOpen} onOpenChange={setDialogOpen} role={activeRole} />

      {/* Manage Role Permissions Modal Dialog */}
      {permissionsRole && (
        <ManagePermissionsDialog
          open={permissionsDialogOpen}
          onOpenChange={setPermissionsDialogOpen}
          roleId={permissionsRole.id}
          roleName={permissionsRole.name}
        />
      )}

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent className="max-w-md p-6 text-slate-900 dark:text-slate-50 border border-slate-100 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              This will soft-delete the role <span className="font-semibold text-slate-800 dark:text-slate-200">"{roleToDelete?.name}"</span>. 
              Users currently assigned to this role might experience authentication issues.
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
              className="h-9 text-xs bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
