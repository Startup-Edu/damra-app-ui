import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
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
import {
  Plus,
  Folder,
  Tag,
} from 'lucide-react'
import { ActionButton } from '@/components/ui/action-button'
import { useCategoriesQuery, useDeleteCategoryMutation } from './_hooks/useCategory'
import type { CategoryItem } from './_types/category.types'
import { CategoryDialog } from './_components/CategoryDialog'
import { toast } from 'sonner'

export const Route = createFileRoute('/_domain/super-admin/_category/category')({
  component: CategoriesPage,
})

function CategoryIconCell({
  iconUrl,
  name,
  isSub,
}: {
  iconUrl?: string | null
  name: string
  isSub?: boolean
}) {
  const [hasError, setHasError] = useState(false)

  if (iconUrl && !hasError) {
    return (
      <img
        src={iconUrl}
        alt={name}
        className="size-5 object-contain"
        onError={() => setHasError(true)}
      />
    )
  }

  return isSub ? (
    <Tag className="size-4 text-emerald-500" />
  ) : (
    <Folder className="size-4 text-blue-500 fill-blue-500/10" />
  )
}

function CategoriesPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 350)

  // Dialog triggers
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<CategoryItem | null>(null)

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null)

  // Fetch categories using React Query
  const { data, isLoading, isFetching, isError, refetch } = useCategoriesQuery(page, limit, debouncedSearch)
  const deleteMutation = useDeleteCategoryMutation()

  const categories = data?.data || []
  const totalElements = data?.total_elements || 0
  const totalPages = data?.total_pages || 1

  const handleAdd = () => {
    setActiveCategory(null)
    setDialogOpen(true)
  }

  const handleEdit = (category: CategoryItem) => {
    setActiveCategory(category)
    setDialogOpen(true)
  }

  const handleDeleteTrigger = (category: CategoryItem) => {
    setCategoryToDelete(category)
    setDeleteAlertOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete.id, {
        onSuccess: () => {
          setDeleteAlertOpen(false)
          setCategoryToDelete(null)
        },
      })
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Categories"
        description="Organize content and quizzes into structured, 2-level taxonomy configurations."
      >
        <Button onClick={handleAdd}>
          <Plus className="mr-1.5 size-4" /> Add Category
        </Button>
      </PageHeader>

      {/* Main Content Card */}
      <Card className="py-0">
        {/* Toolbar */}
        <TableToolbar
          searchPlaceholder="Search categories by English or Khmer name..."
          searchValue={search}
          onSearchChange={(val) => {
            setSearch(val)
            setPage(1)
          }}
          onRefresh={() => {
            refetch().then(() => {
              toast.success('Categories list refreshed successfully')
            })
          }}
          isRefreshing={isFetching}
        />

        <CardContent className="p-0">
          <div className="relative w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[80px]">Icon</TableHead>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Hierarchy</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  // Loading Skeletons
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="pl-6">
                        <Skeleton className="size-8 rounded-md" />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3.5 w-24" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-48" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-8" />
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
                    colSpan={8}
                    variant="error"
                    onAction={() => refetch()}
                  />
                ) : categories.length === 0 ? (
                  debouncedSearch ? (
                    <TableEmptyStateRow
                      colSpan={8}
                      variant="search"
                      searchQuery={debouncedSearch}
                      onClear={() => {
                        setSearch('')
                        setPage(1)
                      }}
                    />
                  ) : (
                    <TableEmptyStateRow
                      colSpan={8}
                      variant="empty"
                      title="No categories created yet"
                      description="Create your first quiz category to organize your question bank."
                      actionLabel="Create Category"
                      actionIcon={Plus}
                      onAction={() => {
                        setActiveCategory(null)
                        setDialogOpen(true)
                      }}
                    />
                  )
                ) : (
                  // Data List
                  categories.map((cat) => (
                    <TableRow key={cat.id}>
                      {/* Icon Column */}
                      <TableCell>
                        <div className="size-8 rounded-md bg-muted/40 border border-border flex items-center justify-center overflow-hidden shrink-0">
                          <CategoryIconCell
                            iconUrl={cat.icon_url}
                            name={cat.name_en}
                            isSub={Boolean(cat.parent_id)}
                          />
                        </div>
                      </TableCell>

                      {/* Name Column */}
                      <TableCell>
                        <div className="font-semibold text-xs">
                          {cat.name_en}
                        </div>
                        <div className="text-[10px] font-medium text-muted-foreground">
                          {cat.name_kh}
                        </div>
                      </TableCell>

                      {/* Description Column */}
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {cat.description_en || <span className="">-</span>}
                        {cat.description_kh && (
                          <div className="text-[10px] font-medium truncate text-muted-foreground">
                            {cat.description_kh}
                          </div>
                        )}
                      </TableCell>

                      {/* Slug Column */}
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {cat.slug}
                      </TableCell>

                      {/* Hierarchy Level Column */}
                      <TableCell>
                        {cat.parent ? (
                          <Badge variant="outline" className="bg-muted/40 text-emerald-600 dark:text-emerald-400 border-emerald-500/10 text-[10px] px-2 py-0.5 rounded-sm font-medium">
                            Subcategory of {cat.parent.name_en}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-500/10 text-[10px] px-2 py-0.5 rounded-sm font-medium">
                            Root Category
                          </Badge>
                        )}
                      </TableCell>

                      {/* Sort Order Column */}
                      <TableCell className="text-xs font-medium">
                        {cat.sort_order}
                      </TableCell>

                      {/* Status Column */}
                      <TableCell>
                        {cat.is_active ? (
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
                            tooltip="Edit Category"
                            onClick={() => handleEdit(cat)}
                          />
                          <ActionButton
                            actionType="delete"
                            tooltip="Delete Category"
                            onClick={() => handleDeleteTrigger(cat)}
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
          {!isLoading && !isError && categories.length > 0 && (
            <DataTablePagination
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={limit}
              onPageChange={setPage}
              itemLabel="categories"
            />
          )}
        </CardContent>
      </Card>

      {/* Category Create/Edit Dialog Form */}
      <CategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} category={activeCategory} />

      {/* Category Delete Confirmation Dialog */}
      <DeleteModal
        open={deleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
        description={
          <>
            This will permanently delete the category <span className="font-semibold">"{categoryToDelete?.name_en}"</span> ({categoryToDelete?.name_kh}).
            This category must not contain any subcategories, levels, or questions. This operation cannot be undone.
          </>
        }
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
        confirmText="Delete Category"
      />
    </div>
  )
}
