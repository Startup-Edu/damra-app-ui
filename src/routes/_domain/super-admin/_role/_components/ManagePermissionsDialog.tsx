import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/ui/shared'
import {
  useRolePermissionsQuery,
  useUpdateRolePermissionsMutation,
} from '../_hooks/useRolesPermissions'
import { Loader2, ShieldAlert, CheckSquare, Square, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ManagePermissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roleId: string
  roleName: string
}

export function ManagePermissionsDialog({
  open,
  onOpenChange,
  roleId,
  roleName,
}: ManagePermissionsDialogProps) {
  const { data, isLoading, isError, refetch } = useRolePermissionsQuery(roleId, open)
  const updateMutation = useUpdateRolePermissionsMutation()

  const [permissionStates, setPermissionStates] = useState<Map<string, boolean>>(new Map())
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (data?.success && data?.data?.permissions) {
      const initialMap = new Map<string, boolean>()
      data.data.permissions.forEach((p) => {
        initialMap.set(p.id, p.is_assigned)
      })
      setPermissionStates(initialMap)
    } else {
      setPermissionStates(new Map())
    }
  }, [data])

  const handleToggle = (id: string) => {
    setPermissionStates((prev) => {
      const next = new Map(prev)
      next.set(id, !next.get(id))
      return next
    })
  }

  const handleToggleGroup = (permsInGroup: Array<{ id: string }>, targetStatus: boolean) => {
    setPermissionStates((prev) => {
      const next = new Map(prev)
      permsInGroup.forEach((p) => next.set(p.id, targetStatus))
      return next
    })
  }

  const handleSelectAll = (targetStatus: boolean) => {
    const targetPerms = search.trim() ? filteredPermissions : allPermissions
    if (targetPerms.length === 0) return
    setPermissionStates((prev) => {
      const next = new Map(prev)
      targetPerms.forEach((p) => next.set(p.id, targetStatus))
      return next
    })
  }

  const handleSave = () => {
    if (!data?.data?.permissions) return
    const payload = Array.from(permissionStates.entries()).map(([permissionId, isAssigned]) => ({
      permissionId,
      isAssigned,
    }))

    updateMutation.mutate(
      { roleId, permissions: payload },
      {
        onSuccess: (res) => {
          if (res.success) onOpenChange(false)
        },
      }
    )
  }

  const allPermissions = useMemo(() => data?.data?.permissions || [], [data?.data?.permissions])

  const filteredPermissions = useMemo(() => {
    if (!search.trim()) return allPermissions
    const searchLower = search.toLowerCase()
    return allPermissions.filter((p) => {
      const permName = (p.name || '').toLowerCase()
      const permResource = (p.resource || (p.name?.includes(':') ? p.name.split(':')[0] : '')).toLowerCase()
      const permAction = (p.action || (p.name?.includes(':') ? p.name.split(':')[1] : '')).toLowerCase()

      return (
        permName.includes(searchLower) ||
        permResource.includes(searchLower) ||
        permAction.includes(searchLower)
      )
    })
  }, [allPermissions, search])

  const groupedPermissions = useMemo(() => {
    return filteredPermissions.reduce((acc, perm) => {
      const resourceKey = perm.resource || (perm.name?.includes(':') ? perm.name.split(':')[0] : 'general')
      if (!acc[resourceKey]) acc[resourceKey] = []
      acc[resourceKey].push(perm)
      return acc
    }, {} as Record<string, typeof allPermissions>)
  }, [filteredPermissions, allPermissions])

  const totalAssignedCount = useMemo(() => {
    let count = 0
    permissionStates.forEach((val) => {
      if (val) count++
    })
    return count
  }, [permissionStates])

  const isDirty = useMemo(() => {
    if (!data?.data?.permissions) return false
    return data.data.permissions.some((p) => p.is_assigned !== !!permissionStates.get(p.id))
  }, [data?.data?.permissions, permissionStates])

  const isSaving = updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-250 lg:max-w-275 w-[95vw] h-[88vh] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="gap-1.5 px-6 pt-6">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-lg font-bold">Configure Role Permissions</DialogTitle>
            <Badge variant="warning" className="font-semibold text-[10px]">
              {roleName}
            </Badge>
          </div>
          <DialogDescription className="text-xs">
            Select the operations this role is authorized to perform across various system modules.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row items-center gap-3 px-6 py-3 border-b border-border">
          <SearchInput
            placeholder="Search permissions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            disabled={isLoading}
            containerClassName="flex-1 w-full"
            sizeVariant="default"
          />

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSelectAll(true)}
              className="flex-1 sm:flex-initial h-9.5! text-[10px] font-semibold"
              disabled={isLoading || allPermissions.length === 0}
            >
              <CheckSquare className="mr-1.5 size-3.5" /> Select All
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSelectAll(false)}
              className="flex-1 sm:flex-initial h-9.5! text-[10px] font-semibold text-muted-foreground hover:text-foreground"
              disabled={isLoading || allPermissions.length === 0}
            >
              <Square className="mr-1.5 size-3.5" /> Clear All
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0 py-3">
          {isLoading ? (
            <div className="flex h-full w-full items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="size-6 text-primary animate-spin" />
                <p className="text-[11px] font-medium text-muted-foreground">Loading system permissions...</p>
              </div>
            </div>
          ) : isError ? (
            <div className="flex h-full w-full flex-col items-center justify-center text-center p-6 bg-destructive/5 rounded-xl border border-destructive/10">
              <ShieldAlert className="size-8 text-destructive mb-2" />
              <p className="text-xs font-semibold text-destructive">Failed to load permissions</p>
              <p className="text-[10px] text-muted-foreground mt-1 mb-3">Make sure the API server is online.</p>
              <Button size="sm" variant="outline" onClick={() => refetch()} className="h-8 text-[10px]">
                Retry Loading
              </Button>
            </div>
          ) : Object.keys(groupedPermissions).length === 0 ? (
            <div className="flex h-full w-full flex-col items-center justify-center text-center text-muted-foreground gap-1.5">
              <Shield className="size-8 opacity-30" />
              <p className="text-xs font-medium">No permissions found matching search.</p>
              <p className="text-[10px]">Try searching with a different keyword.</p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-4 px-6">
                {Object.entries(groupedPermissions).map(([resourceName, perms]) => {
                  const allActive = perms.every((p) => permissionStates.get(p.id))
                  const countActive = perms.filter((p) => permissionStates.get(p.id)).length

                  return (
                    <div
                      key={resourceName}
                      className="rounded-xl border border-border bg-card overflow-hidden shadow-xs"
                    >
                      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                            {resourceName} Module
                          </span>
                          <Badge variant="secondary" className="text-[9px] font-semibold px-1.5 py-0">
                            {countActive}/{perms.length} Enabled
                          </Badge>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Label
                            htmlFor={`toggle-module-${resourceName}`}
                            className="text-[10px] font-medium text-muted-foreground cursor-pointer"
                          >
                            Toggle Group
                          </Label>
                          <Switch
                            id={`toggle-module-${resourceName}`}
                            checked={allActive}
                            onCheckedChange={(checked) => handleToggleGroup(perms, checked)}
                          />
                        </div>
                      </div>

                      <div className="p-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {perms.map((p) => {
                          const isAssigned = !!permissionStates.get(p.id)
                          return (
                            <div
                              key={p.id}
                              onClick={() => handleToggle(p.id)}
                              className={cn(
                                'flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer select-none',
                                isAssigned
                                  ? 'border-primary/30 bg-primary/5 shadow-2xs'
                                  : 'border-border/60 hover:bg-muted/40'
                              )}
                            >
                              <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                                <Label
                                  htmlFor={`perm-${p.id}`}
                                  className="text-xs font-semibold text-foreground capitalize cursor-pointer truncate"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {p.action || (p.name?.includes(':') ? p.name.split(':')[1] : p.name)}
                                </Label>
                                <span className="text-[10px] font-mono text-muted-foreground truncate">
                                  {p.name}
                                </span>
                              </div>
                              <Switch
                                id={`perm-${p.id}`}
                                checked={isAssigned}
                                onCheckedChange={() => handleToggle(p.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="shrink-0"
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="py-3 px-6 border-t border-border flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{totalAssignedCount}</span> of{' '}
            <span className="font-semibold text-foreground">{allPermissions.length}</span> permissions enabled
            {isDirty && (
              <Badge variant="secondary" className="ml-2 text-[9px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 py-0 px-1.5 animate-pulse">
                Unsaved changes
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving || isLoading}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isLoading || allPermissions.length === 0 || !isDirty}
              className="h-9 text-xs"
            >
              {isSaving && <Loader2 className="mr-2 size-3.5 animate-spin" />}
              Save Permissions
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
