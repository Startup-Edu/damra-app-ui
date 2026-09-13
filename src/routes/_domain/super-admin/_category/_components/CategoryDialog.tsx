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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { SearchableSelect } from '@/components/ui/shared'
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useRootCategoriesQuery,
} from '../_hooks/useCategory'
import type { CategoryItem } from '../_types/category.types'
import { Loader2, AlertTriangle } from 'lucide-react'

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: CategoryItem | null
}

export function CategoryDialog({ open, onOpenChange, category }: CategoryDialogProps) {
  const [nameEn, setNameEn] = useState('')
  const [nameKh, setNameKh] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')
  const [descriptionKh, setDescriptionKh] = useState('')
  const [slug, setSlug] = useState('')
  const [iconUrl, setIconUrl] = useState('')
  const [parentId, setParentId] = useState<string>('none')
  const [isActive, setIsActive] = useState(true)
  const [sortOrder, setSortOrder] = useState<number>(0)

  const [validationError, setValidationError] = useState('')

  const createMutation = useCreateCategoryMutation()
  const updateMutation = useUpdateCategoryMutation()

  // Fetch active root categories when dialog is open
  const { data: rootCategoriesResponse, isLoading: rootsLoading } = useRootCategoriesQuery(open)
  const rootCategories = rootCategoriesResponse?.data || []

  const isEditing = !!category
  const isLoading = createMutation.isPending || updateMutation.isPending || rootsLoading

  useEffect(() => {
    if (open) {
      if (category) {
        setNameEn(category.name_en)
        setNameKh(category.name_kh)
        setDescriptionEn(category.description_en || '')
        setDescriptionKh(category.description_kh || '')
        setSlug(category.slug)
        setIconUrl(category.icon_url || '')
        setParentId(category.parent_id || 'none')
        setIsActive(category.is_active)
        setSortOrder(category.sort_order)
      } else {
        setNameEn('')
        setNameKh('')
        setDescriptionEn('')
        setDescriptionKh('')
        setSlug('')
        setIconUrl('')
        setParentId('none')
        setIsActive(true)
        setSortOrder(0)
      }
      setValidationError('')
    }
  }, [open, category])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    if (!nameEn.trim() || !nameKh.trim()) {
      setValidationError('Both English and Khmer names are required')
      return
    }

    const payload = {
      nameEn: nameEn.trim(),
      nameKh: nameKh.trim(),
      descriptionEn: descriptionEn.trim() || null,
      descriptionKh: descriptionKh.trim() || null,
      slug: slug.trim() || undefined,
      iconUrl: iconUrl.trim() || null,
      parentId: parentId === 'none' ? null : parentId,
      isActive,
      sortOrder,
    }

    if (isEditing && category) {
      updateMutation.mutate(
        { id: category.id, data: payload },
        {
          onSuccess: (res) => {
            if (res.success) onOpenChange(false)
          },
          onError: (err: any) => {
            if (err?.error?.details?.[0]?.message) {
              setValidationError(err.error.details[0].message)
            }
          },
        }
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: (res) => {
          if (res.success) onOpenChange(false)
        },
        onError: (err: any) => {
          if (err?.error?.details?.[0]?.message) {
            setValidationError(err.error.details[0].message)
          }
        },
      })
    }
  }

  // Filter out the category itself when editing (a category cannot be its own parent)
  const parentCandidates = useMemo(() => {
    return isEditing && category
      ? rootCategories.filter((c) => c.id !== category.id)
      : rootCategories
  }, [isEditing, category, rootCategories])

  const parentOptions = useMemo(() => {
    const sorted = [...parentCandidates].sort((a, b) => (a.name_en || '').localeCompare(b.name_en || ''))
    return [
      { value: 'none', label: 'None (Root Category)', description: 'Top-level category' },
      ...sorted.map((c) => ({
        value: c.id,
        label: c.name_en,
        description: c.name_kh || undefined,
      })),
    ]
  }, [parentCandidates])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader className="space-y-1.5 border-b pb-3">
          <DialogTitle className="text-lg font-bold">
            {isEditing ? 'Modify Category' : 'Create New Category'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing
              ? 'Update the category details, hierarchy associations, and status.'
              : 'Add a new category to organize quizzes, levels, and content.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="category-name-en" className="text-[11px] font-semibold">
                English Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="category-name-en"
                placeholder="e.g. Science"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                disabled={isLoading}
                className="h-9.5 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category-name-kh" className="text-[11px] font-semibold">
                Khmer Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="category-name-kh"
                placeholder="e.g. វិទ្យាសាស្ត្រ"
                value={nameKh}
                onChange={(e) => setNameKh(e.target.value)}
                disabled={isLoading}
                className="h-9.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="category-desc-en" className="text-[11px] font-semibold">
                English Description
              </Label>
              <Input
                id="category-desc-en"
                placeholder="Science category description"
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                disabled={isLoading}
                className="h-9.5 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category-desc-kh" className="text-[11px] font-semibold">
                Khmer Description
              </Label>
              <Input
                id="category-desc-kh"
                placeholder="ការពិពណ៌នាអំពីវិទ្យាសាស្ត្រ"
                value={descriptionKh}
                onChange={(e) => setDescriptionKh(e.target.value)}
                disabled={isLoading}
                className="h-9.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="category-slug" className="text-[11px] font-semibold">
                Custom Slug
              </Label>
              <Input
                id="category-slug"
                placeholder="Auto-generated if empty"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                disabled={isLoading}
                className="h-9.5 text-xs"
              />
              <p className="text-[9px]">Must be unique, lowercase, URL-friendly.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category-icon" className="text-[11px] font-semibold">
                Icon URL
              </Label>
              <Input
                id="category-icon"
                placeholder="https://example.com/icon.svg"
                value={iconUrl}
                onChange={(e) => setIconUrl(e.target.value)}
                disabled={isLoading}
                className="h-9.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="category-parent" className="text-[11px] font-semibold">
                Parent Category (Hierarchy)
              </Label>
              <SearchableSelect
                id="category-parent"
                options={parentOptions}
                value={parentId}
                onChange={(val) => setParentId(val || 'none')}
                placeholder="Select a parent..."
                searchPlaceholder="Search parent category..."
                emptyMessage={rootsLoading ? 'Loading root categories...' : 'No parent categories found.'}
                disabled={isLoading}
                clearable={true}
                triggerClassName="w-full h-9.5 text-xs"
                contentClassName="w-[var(--radix-popover-trigger-width)] min-w-[240px]"
              />
              <p className="text-[9px] text-muted-foreground">Maximum of 2 hierarchy levels allowed.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category-sort" className="text-[11px] font-semibold">
                Sort Order
              </Label>
              <Input
                id="category-sort"
                type="number"
                min={0}
                placeholder="0"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                disabled={isLoading}
                className="h-9.5 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded-lg border mt-2">
            <div className="space-y-0.5">
              <Label htmlFor="category-status" className="text-[11px] font-semibold">
                Active Status
              </Label>
              <p className="text-[10px]">
                Inactive categories will be hidden from mobile clients.
              </p>
            </div>
            <Switch
              id="category-status"
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={isLoading}
            />
          </div>

          {validationError && (
            <div className="flex items-start gap-2 p-3 rounded-lg border border-rose-500/10 bg-rose-500/5 text-rose-500">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="text-xs font-medium leading-tight">{validationError}</p>
            </div>
          )}

          <DialogFooter className="pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="!h-9 text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="!h-9 text-xs">
              {isLoading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
