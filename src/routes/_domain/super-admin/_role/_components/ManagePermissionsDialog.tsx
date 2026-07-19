import { useState, useEffect } from 'react'
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
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  useRolePermissionsQuery,
  useUpdateRolePermissionsMutation,
} from '../_hooks/useRolesPermissions'
import { Loader2, ShieldAlert, Search, CheckSquare, Square } from 'lucide-react'

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
    if (!data?.data?.permissions) return
    setPermissionStates((prev) => {
      const next = new Map(prev)
      data.data.permissions.forEach((p) => next.set(p.id, targetStatus))
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

  const allPermissions = data?.data?.permissions || []
  const filteredPermissions = allPermissions.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.resource.toLowerCase().includes(search.toLowerCase()) ||
    p.action.toLowerCase().includes(search.toLowerCase())
  )

  const groupedPermissions = filteredPermissions.reduce((acc, perm) => {
    const resourceKey = perm.resource || 'general'
    if (!acc[resourceKey]) acc[resourceKey] = []
    acc[resourceKey].push(perm)
    return acc
  }, {} as Record<string, typeof allPermissions>)

  const isSaving = updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col p-6 text-slate-900 dark:text-slate-50 border border-slate-100 dark:border-slate-800 shadow-xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-lg font-bold">Configure Role Permissions</DialogTitle>
            <Badge variant="warning" className="font-semibold text-[10px]">
              {roleName}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Select the operations this role is authorized to perform across various system modules.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row items-center gap-3 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search permissions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectAll(true)}
              className="flex-1 sm:flex-initial h-8 text-[10px] font-semibold"
              disabled={isLoading || allPermissions.length === 0}
            >
              <CheckSquare className="mr-1.5 h-3.5 w-3.5" /> Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectAll(false)}
              className="flex-1 sm:flex-initial h-8 text-[10px] font-semibold text-slate-500 hover:text-slate-700"
              disabled={isLoading || allPermissions.length === 0}
            >
              <Square className="mr-1.5 h-3.5 w-3.5" /> Clear All
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0 py-4">
          {isLoading ? (
            <div className="flex h-full w-full items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
                <p className="text-[11px] font-medium text-slate-500">Loading system permissions...</p>
              </div>
            </div>
          ) : isError ? (
            <div className="flex h-full w-full flex-col items-center justify-center text-center p-6 bg-rose-500/5 rounded-xl border border-rose-500/10">
              <ShieldAlert className="h-8 w-8 text-rose-500 mb-2" />
              <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">Failed to load permissions</p>
              <p className="text-[10px] text-slate-500 mt-1 mb-3">Make sure the API server is online.</p>
              <Button size="sm" variant="outline" onClick={() => refetch()} className="h-8 text-[10px]">
                Retry Loading
              </Button>
            </div>
          ) : Object.keys(groupedPermissions).length === 0 ? (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              <p className="text-xs">No permissions found matching search.</p>
            </div>
          ) : (
            <ScrollArea className="h-full pr-3">
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([resourceName, perms]) => {
                  const allActive = perms.every((p) => permissionStates.get(p.id))
                  const countActive = perms.filter((p) => permissionStates.get(p.id)).length

                  return (
                    <div
                      key={resourceName}
                      className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 overflow-hidden shadow-xs"
                    >
                      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            {resourceName} Module
                          </span>
                          <span className="text-[9px] font-semibold bg-slate-200/50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-full">
                            {countActive}/{perms.length} Enabled
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <Label
                            htmlFor={`toggle-module-${resourceName}`}
                            className="text-[10px] font-medium text-slate-500 cursor-pointer"
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

                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {perms.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100/70 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all"
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 capitalize">
                                {p.action}
                              </span>
                              <span className="text-[9px] font-mono text-slate-400">
                                {p.name}
                              </span>
                            </div>
                            <Switch
                              checked={!!permissionStates.get(p.id)}
                              onCheckedChange={() => handleToggle(p.id)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800">
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
            onClick={handleSave}
            disabled={isSaving || isLoading || allPermissions.length === 0}
            className="h-9 text-xs"
          >
            {isSaving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Save Permissions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
