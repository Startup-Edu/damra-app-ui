import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useCategoriesQuery } from '../../_category/_hooks/useCategory'
import { useGradeCategoriesQuery, useSyncGradeCategoriesMutation } from '../_hooks/useGradeCategory'
import type { GradeItem } from '../_types/grade.types'
import { Loader2, Layers, CheckCircle2 } from 'lucide-react'

interface GradeCategoriesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  grade: GradeItem | null
}

export function GradeCategoriesDialog({ open, onOpenChange, grade }: GradeCategoriesDialogProps) {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])

  const { data: categoriesResponse, isLoading: categoriesLoading } = useCategoriesQuery(1, 100, '', true)
  const { data: currentAssignedResponse, isLoading: assignedLoading } = useGradeCategoriesQuery(grade?.id || '', open && !!grade)

  const syncMutation = useSyncGradeCategoriesMutation()

  const categories = categoriesResponse?.data || []

  useEffect(() => {
    if (open && currentAssignedResponse?.data) {
      const assignedIds = currentAssignedResponse.data.map((c) => c.id)
      setSelectedCategoryIds(assignedIds)
    }
  }, [open, currentAssignedResponse])

  const toggleCategory = (catId: string) => {
    if (selectedCategoryIds.includes(catId)) {
      setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== catId))
    } else {
      setSelectedCategoryIds([...selectedCategoryIds, catId])
    }
  }

  const handleSave = () => {
    if (!grade) return
    syncMutation.mutate(
      { gradeId: grade.id, categoryIds: selectedCategoryIds },
      {
        onSuccess: (res) => {
          if (res.success) onOpenChange(false)
        },
      }
    )
  }

  const isLoading = categoriesLoading || assignedLoading || syncMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] w-[95vw] max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-4 border-b">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <DialogTitle className="text-base font-bold">
              Category Mapping for {grade?.name_en}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Select categories allowed for this grade level. When creating questions under {grade?.name_en}, only assigned categories will be selectable.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 w-full p-4 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-xs">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading assigned categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-xs">
              No categories found in system.
            </div>
          ) : (
            <div className="space-y-2.5">
              {categories.map((cat) => {
                const isChecked = selectedCategoryIds.includes(cat.id)
                return (
                  <div
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-primary/5 border-primary/30'
                        : 'bg-muted border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleCategory(cat.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div>
                        <span className="text-xs font-semibold block">{cat.name_en}</span>
                        <span className="text-[10px] block">{cat.name_kh}</span>
                      </div>
                    </div>

                    {isChecked && (
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Assigned
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <DialogFooter className="p-4 border-t shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={syncMutation.isPending}
            className="!h-9 text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={syncMutation.isPending}
            className="!h-9 text-xs"
          >
            {syncMutation.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Save Assignments ({selectedCategoryIds.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
