import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import { DeleteModal } from '@/components/ui/delete-modal'
import {
  Search,
  RefreshCw,
  Plus,
  Loader2,
  FolderTree,
  Folder,
  Tag,
} from 'lucide-react'
import { ActionButton } from '@/components/ui/action-button'
import { useCategoriesQuery, useDeleteCategoryMutation } from '../_hooks/useCategory'
import type { CategoryItem } from '../_types/category.types'
import { CategoryDialog } from '../_components/CategoryDialog'
import { toast } from 'sonner'

export const Route = createFileRoute('/_domain/super-admin/_category/category')({
  component: CategoriesPage,
})

function CategoriesPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Dialog triggers
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<CategoryItem | null>(null)

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null)

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1) // Reset to first page on search change
    }, 400)

    return () => clearTimeout(handler)
  }, [search])

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
    <div className="text-slate-900 dark:text-slate-50 animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Categories"
        description="Organize content and quizzes into structured, 2-level taxonomy configurations."
      >
        <Button onClick={handleAdd} className="text-xs !h-9">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Category
        </Button>
      </PageHeader>

      {/* Main Content Card */}
      <Card className="py-0">
        {/* Toolbar */}
        <div className="flex items-center gap-3 p-6 pb-4">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search categories by English or Khmer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 text-xs"
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              refetch().then(() => {
                toast.success('Categories list refreshed successfully')
              })
            }}
            disabled={isFetching}
            className="h-10 w-10"
          >
            {isFetching ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <RefreshCw className="h-4.5 w-4.5" />
            )}
          </Button>
        </div>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 w-[80px]">Icon</TableHead>
                <TableHead>Category Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Hierarchy</TableHead>
                <TableHead>Sort Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                // Loading Skeletons
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="pl-6">
                      <Skeleton className="h-8 w-8 rounded-md" />
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
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                // Error State
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-rose-500 font-medium text-xs">
                    Failed to fetch categories. Please make sure the API server is online.
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                // Empty State
                <TableRow>
                  <TableCell colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <FolderTree className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                      <p className="text-xs font-semibold">No categories found matching your query</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // Data List
                categories.map((cat) => (
                  <TableRow key={cat.id}>
                    {/* Icon Column */}
                    <TableCell className="pl-6 py-3.5">
                      <div className="h-8 w-8 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                        {cat.icon_url ? (
                          <img src={cat.icon_url} alt={cat.name_en} className="h-5 w-5 object-contain" />
                        ) : cat.parent_id ? (
                          <Tag className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Folder className="h-4 w-4 text-blue-500 fill-blue-500/10" />
                        )}
                      </div>
                    </TableCell>

                    {/* Name Column */}
                    <TableCell>
                      <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                        {cat.name_en}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        {cat.name_kh}
                      </div>
                    </TableCell>

                    {/* Description Column */}
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {cat.description_en || <span className="text-slate-300 dark:text-slate-700">-</span>}
                      {cat.description_kh && (
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">
                          {cat.description_kh}
                        </div>
                      )}
                    </TableCell>

                    {/* Slug Column */}
                    <TableCell className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {cat.slug}
                    </TableCell>

                    {/* Hierarchy Level Column */}
                    <TableCell>
                      {cat.parent ? (
                        <Badge variant="outline" className="bg-slate-50 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-emerald-500/10 text-[10px] px-2 py-0.5 rounded-sm font-medium">
                          Subcategory of {cat.parent.name_en}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-500/10 text-[10px] px-2 py-0.5 rounded-sm font-medium">
                          Root Category
                        </Badge>
                      )}
                    </TableCell>

                    {/* Sort Order Column */}
                    <TableCell className="text-xs text-slate-600 dark:text-slate-400 font-medium">
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
                    <TableCell className="pr-6 text-right">
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

          {/* Pagination Footer */}
          {!isLoading && !isError && categories.length > 0 && (
            <div className="flex items-center justify-between p-4 px-6 border-t bg-slate-50/30 dark:bg-slate-950/10">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{((page - 1) * limit) + 1}</span> to{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {Math.min(page * limit, totalElements)}
                </span>{" "}
                of <span className="font-semibold text-slate-900 dark:text-slate-100">{totalElements}</span> categories
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
                      className={page === 1 ? "pointer-events-none opacity-50" : undefined}
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
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    }
                    if (pageNum === 2 && page > 3) {
                      return (
                        <PaginationItem key="ellipsis-start">
                          <PaginationEllipsis />
                        </PaginationItem>
                      )
                    }
                    if (pageNum === totalPages - 1 && page < totalPages - 2) {
                      return (
                        <PaginationItem key="ellipsis-end">
                          <PaginationEllipsis />
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
                      className={page === totalPages || totalPages === 0 ? "pointer-events-none opacity-50" : undefined}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
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
            This will permanently delete the category <span className="font-semibold text-slate-800 dark:text-slate-200">"{categoryToDelete?.name_en}"</span> ({categoryToDelete?.name_kh}).
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
