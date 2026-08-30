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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import { SearchableSelect, TableEmptyStateRow, SearchInput } from '@/components/ui/shared'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import {
  RefreshCw,
  Plus,
  Loader2,
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
        <Button onClick={handleAdd} className="text-xs !h-9">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Package
        </Button>
      </PageHeader>

      {/* Main Content Card */}
      <Card className="py-0">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-5 pb-0">
          <div className="flex flex-1 items-center gap-3 max-w-2xl">
            <SearchInput
              placeholder="Search packages by title..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              onClear={() => {
                setSearch('')
                setPage(1)
              }}
              containerClassName="flex-1"
              sizeVariant="default"
            />

            {/* Category Filter */}
            <SearchableSelect
              options={categoryOptions}
              value={selectedCategoryId}
              onChange={(val) => {
                setSelectedCategoryId(val)
                setPage(1)
              }}
              placeholder="All Categories"
              searchPlaceholder="Search category..."
              className="w-[200px]"
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              refetch().then(() => {
                toast.success('Quiz packages list refreshed successfully')
              })
            }}
            disabled={isFetching}
            className="h-9.5 w-9.5 shrink-0"
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
                <TableHead className="pl-6">Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Access Status</TableHead>
                <TableHead>Questions / Session</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right w-[120px]">Actions</TableHead>
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
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
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
                    <TableCell className="pl-6 py-3.5">
                      <div className="font-semibold text-xs">
                        {pkg.title}
                      </div>
                      {pkg.description && (
                        <div className="text-[10px] max-w-[220px] truncate">
                          {pkg.description}
                        </div>
                      )}
                    </TableCell>

                    {/* Category Column */}
                    <TableCell className="text-xs font-medium">
                      {pkg.category ? (
                        <span>{pkg.category.name_en}</span>
                      ) : (
                        <span>-</span>
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
                          <Coins className="h-3 w-3 shrink-0" />
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
                    <TableCell className="pr-6 text-right">
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

          {/* Pagination Footer */}
          {!isLoading && !isError && packages.length > 0 && (
            <div className="flex items-center justify-between p-4 px-6 border-t ">
              <div className="text-[10px] ">
                Showing <span className="font-semibold">{((page - 1) * limit) + 1}</span> to{" "}
                <span className="font-semibold">
                  {Math.min(page * limit, totalElements)}
                </span>{" "}
                of <span className="font-semibold">{totalElements}</span> packages
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
