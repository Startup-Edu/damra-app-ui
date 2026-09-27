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
import { SearchableSelect, TableEmptyStateRow, TableToolbar, DataTablePagination } from '@/components/ui/shared'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import {
  Plus,
  Coins,
} from 'lucide-react'
import { ActionButton } from '@/components/ui/action-button'
import { DeleteModal } from '@/components/ui/delete-modal'
import { useQuizPackagesQuery, useDeleteQuizPackageMutation } from './_hooks/useQuizpack'
import { useCategoriesQuery } from '../_category/_hooks/useCategory'
import type { QuizPackageItem } from './_types/quizpack.types'
import { QuizpackDialog } from './_components/QuizpackDialog'
import { QuizPackageQuestionsDialog } from './_components/QuizPackageQuestionsDialog'
import { toast } from 'sonner'

export const Route = createFileRoute('/_domain/super-admin/_quizpack/quizepack')({
  component: QuizPackagesPage,
})

function QuizPackagesPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 350)

  // Filter States
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')

  // Dialog triggers
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeQuizpack, setActiveQuizpack] = useState<QuizPackageItem | null>(null)

  const [questionsDialogOpen, setQuestionsDialogOpen] = useState(false)
  const [activeQuestionsQuizpack, setActiveQuestionsQuizpack] = useState<QuizPackageItem | null>(null)

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [quizpackToDelete, setQuizpackToDelete] = useState<QuizPackageItem | null>(null)

  const filterCategory = selectedCategoryId === 'all' ? undefined : selectedCategoryId

  // Fetch standalone quiz packages
  const { data, isLoading, isFetching, isError, refetch } = useQuizPackagesQuery(
    page,
    limit,
    debouncedSearch,
    filterCategory
  )

  // Fetch categories for filters (limit 100)
  const { data: categoriesResponse } = useCategoriesQuery(1, 100, '', true)
  const categories = categoriesResponse?.data || []
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map((c) => ({
      value: c.id,
      label: c.name_kh ? `${c.name_en} (${c.name_kh})` : c.name_en,
    })),
  ]

  const deleteMutation = useDeleteQuizPackageMutation()

  const packages = data?.data || []
  const totalElements = data?.total_elements || 0
  const totalPages = data?.total_pages || 1

  const handleAdd = () => {
    setActiveQuizpack(null)
    setDialogOpen(true)
  }

  const handleEdit = (pkg: QuizPackageItem) => {
    setActiveQuizpack(pkg)
    setDialogOpen(true)
  }

  const handleManageQuestions = (pkg: QuizPackageItem) => {
    setActiveQuestionsQuizpack(pkg)
    setQuestionsDialogOpen(true)
  }

  const handleDeleteTrigger = (pkg: QuizPackageItem) => {
    setQuizpackToDelete(pkg)
    setDeleteAlertOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (quizpackToDelete) {
      deleteMutation.mutate(quizpackToDelete.id, {
        onSuccess: () => {
          setDeleteAlertOpen(false)
          setQuizpackToDelete(null)
        },
      })
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Quiz Packages"
        description="Manage standalone practice quiz packages, coin pricing, and category filters."
      >
        <Button onClick={handleAdd}>
          <Plus className="mr-1.5 size-4" /> Add Package
        </Button>
      </PageHeader>

      {/* Main Content Card */}
      <Card className="py-0">
        {/* Toolbar */}
        <TableToolbar
          searchPlaceholder="Search packages by title..."
          searchValue={search}
          onSearchChange={(val) => {
            setSearch(val)
            setPage(1)
          }}
          onRefresh={() => {
            refetch().then(() => {
              toast.success('Quiz packages list refreshed successfully')
            })
          }}
          isRefreshing={isFetching}
          filters={
            <SearchableSelect
              options={categoryOptions}
              value={selectedCategoryId}
              onChange={(val) => {
                setSelectedCategoryId(val || 'all')
                setPage(1)
              }}
              placeholder="All Categories"
              searchPlaceholder="Search category..."
              triggerClassName="w-[200px]"
            />
          }
        />

        <CardContent className="p-0">
          <div className="relative w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Access Status</TableHead>
                  <TableHead>Questions / Session</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="pl-6">
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-36" />
                          <Skeleton className="h-3.5 w-24" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16 rounded-full" />
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
                    colSpan={6}
                    variant="error"
                    onAction={() => refetch()}
                  />
                ) : packages.length === 0 ? (
                  debouncedSearch ? (
                    <TableEmptyStateRow
                      colSpan={6}
                      variant="search"
                      searchQuery={debouncedSearch}
                      onClear={() => {
                        setSearch('')
                        setPage(1)
                      }}
                    />
                  ) : selectedCategoryId !== 'all' ? (
                    <TableEmptyStateRow
                      colSpan={6}
                      variant="filter"
                      title="No quiz packages found in this category"
                      description="No quiz packages match the selected category. Try selecting a different category or reset your filter."
                      onClear={() => {
                        setSelectedCategoryId('all')
                        setPage(1)
                      }}
                    />
                  ) : (
                    <TableEmptyStateRow
                      colSpan={6}
                      variant="empty"
                      title="No quiz packages created yet"
                      description="Get started by creating your first quiz package."
                      actionLabel="Create Quiz Package"
                      actionIcon={Plus}
                      onAction={() => {
                        setActiveQuizpack(null)
                        setDialogOpen(true)
                      }}
                    />
                  )
                ) : (
                  packages.map((pkg) => (
                    <TableRow key={pkg.id}>
                      {/* Title & Description */}
                      <TableCell>
                        <div className="font-semibold text-xs">
                          {pkg.title}
                        </div>
                        {pkg.description && (
                          <div className="text-[10px] text-muted-foreground max-w-[220px] truncate">
                            {pkg.description}
                          </div>
                        )}
                      </TableCell>

                      {/* Category Column */}
                      <TableCell className="text-xs font-medium">
                        {pkg.category ? (
                          <span>{pkg.category.name_en}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>

                      {/* Access Status & Price */}
                      <TableCell>
                        {pkg.is_free ? (
                          <Badge variant="success" className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-500/10">
                            Free Access
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="flex items-center gap-1 w-fit bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-500/10 font-bold">
                            <Coins className="size-3 shrink-0" />
                            {pkg.price_coins} Coins
                          </Badge>
                        )}
                      </TableCell>

                      {/* Questions per Session */}
                      <TableCell className="text-xs font-medium">
                        {pkg.questions_per_session !== null ? pkg.questions_per_session : 'Default (10)'}
                      </TableCell>

                      {/* Active Status Column */}
                      <TableCell>
                        {pkg.is_active ? (
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
                            actionType="view"
                            tooltip="Manage Questions"
                            onClick={() => handleManageQuestions(pkg)}
                          />
                          <ActionButton
                            actionType="edit"
                            tooltip="Edit Package"
                            onClick={() => handleEdit(pkg)}
                          />
                          <ActionButton
                            actionType="delete"
                            tooltip="Delete Package"
                            onClick={() => handleDeleteTrigger(pkg)}
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
          {!isLoading && !isError && packages.length > 0 && (
            <DataTablePagination
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={limit}
              onPageChange={setPage}
              itemLabel="packages"
            />
          )}
        </CardContent>
      </Card>

      {/* Quizpack Dialog Modal */}
      <QuizpackDialog open={dialogOpen} onOpenChange={setDialogOpen} quizpack={activeQuizpack} />

      {/* Manage Questions Dialog */}
      {activeQuestionsQuizpack && (
        <QuizPackageQuestionsDialog
          open={questionsDialogOpen}
          onOpenChange={setQuestionsDialogOpen}
          quizpack={activeQuestionsQuizpack}
        />
      )}

      {/* Quizpack Delete Confirmation Dialog */}
      <DeleteModal
        open={deleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
        description={
          <>
            This will permanently delete the quiz package <span className="font-semibold text-destructive">"{quizpackToDelete?.title}"</span>.
            This operation cannot be undone.
          </>
        }
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
        confirmText="Delete Package"
      />
    </div>
  )
}
