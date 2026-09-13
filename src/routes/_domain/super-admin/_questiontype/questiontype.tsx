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
import {
  RefreshCw,
  Plus,
  Loader2,
} from 'lucide-react'
import { ActionButton } from '@/components/ui/action-button'
import { DeleteModal } from '@/components/ui/delete-modal'
import { TableEmptyStateRow, SearchInput } from '@/components/ui/shared'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useQuestionTypesQuery, useDeleteQuestionTypeMutation } from './_hooks/useQuestiontype'
import type { QuestionTypeConfigItem as QuestionTypeItem } from './_types/questiontype.types'
import { QuestiontypeDialog } from './_components/QuestiontypeDialog'
import { toast } from 'sonner'

export const Route = createFileRoute('/_domain/super-admin/_questiontype/questiontype')({
  component: QuestionTypesPage,
})

function QuestionTypesPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 350)

  // Dialog triggers
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeQuestiontype, setActiveQuestiontype] = useState<QuestionTypeItem | null>(null)

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [questiontypeToDelete, setQuestiontypeToDelete] = useState<QuestionTypeItem | null>(null)

  // Fetch question types
  const { data, isLoading, isFetching, isError, refetch } = useQuestionTypesQuery(page, limit, debouncedSearch)
  const deleteMutation = useDeleteQuestionTypeMutation()

  const questionTypes = data?.data || []
  const totalElements = data?.total_elements || 0
  const totalPages = data?.total_pages || 1

  const handleAdd = () => {
    setActiveQuestiontype(null)
    setDialogOpen(true)
  }

  const handleEdit = (qt: QuestionTypeItem) => {
    setActiveQuestiontype(qt)
    setDialogOpen(true)
  }

  const handleDeleteTrigger = (qt: QuestionTypeItem) => {
    setQuestiontypeToDelete(qt)
    setDeleteAlertOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (questiontypeToDelete) {
      deleteMutation.mutate(questiontypeToDelete.id, {
        onSuccess: () => {
          setDeleteAlertOpen(false)
          setQuestiontypeToDelete(null)
        },
      })
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Question Types"
        description="Manage the configuration of study question formats, translation labels, and order sequences."
      >
        <Button onClick={handleAdd} className="text-xs !h-9">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Type
        </Button>
      </PageHeader>

      {/* Main Content Card */}
      <Card className="py-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 p-5 pb-0">
          <SearchInput
            placeholder="Search question types by code or name..."
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

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              refetch().then(() => {
                toast.success('Question types list refreshed successfully')
              })
            }}
            disabled={isFetching}
            className="h-9.5 w-9.5"
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
                <TableHead className="pl-6 w-[120px]">Code</TableHead>
                <TableHead>English Name</TableHead>
                <TableHead>Khmer Name</TableHead>
                <TableHead>Description</TableHead>
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
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
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
                  colSpan={7}
                  variant="error"
                  onAction={() => refetch()}
                />
              ) : questionTypes.length === 0 ? (
                debouncedSearch ? (
                  <TableEmptyStateRow
                    colSpan={7}
                    variant="search"
                    searchQuery={debouncedSearch}
                    onClear={() => {
                      setSearch('')
                      setPage(1)
                    }}
                  />
                ) : (
                  <TableEmptyStateRow
                    colSpan={7}
                    variant="empty"
                    title="No question types configured"
                    description="Configure your question types and validation schemas."
                    actionLabel="Add Question Type"
                    actionIcon={Plus}
                    onAction={() => {
                      setActiveQuestionType(null)
                      setDialogOpen(true)
                    }}
                  />
                )
              ) : (
                // Data List
                questionTypes.map((qt) => (
                  <TableRow key={qt.id}>
                    {/* Code */}
                    <TableCell className="pl-6 py-3.5">
                      <Badge variant="outline" className="font-semibold text-xs uppercase">
                        {qt.code}
                      </Badge>
                    </TableCell>

                    {/* English Name */}
                    <TableCell className="text-xs">
                      {qt.name_en}
                    </TableCell>

                    {/* Khmer Name */}
                    <TableCell className="text-xs">
                      {qt.name_kh}
                    </TableCell>

                    {/* Description */}
                    <TableCell className="text-xs">
                      {qt.description_en || <span>-</span>}
                    </TableCell>

                    {/* Sort Order */}
                    <TableCell className="text-xs">
                      {qt.sort_order}
                    </TableCell>

                    {/* Status Column */}
                    <TableCell>
                      {qt.is_active ? (
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
                          tooltip="Edit Type"
                          onClick={() => handleEdit(qt)}
                        />
                        <ActionButton
                          actionType="delete"
                          tooltip="Delete Type"
                          onClick={() => handleDeleteTrigger(qt)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Footer */}
          {!isLoading && !isError && questionTypes.length > 0 && (
            <div className="flex items-center justify-between p-4 px-6 border-t bg-muted/30">
              <div className="text-xs">
                Showing <span className="font-semibold">{((page - 1) * limit) + 1}</span> to{" "}
                <span className="font-semibold">
                  {Math.min(page * limit, totalElements)}
                </span>{" "}
                of <span className="font-semibold">{totalElements}</span> question types
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

      {/* Question Type Create/Edit Dialog Form */}
      <QuestiontypeDialog open={dialogOpen} onOpenChange={setDialogOpen} questiontype={activeQuestiontype} />

      {/* Question Type Delete Confirmation Dialog */}
      <DeleteModal
        open={deleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
        description={
          <>
            This will permanently delete the question type <span className="font-semibold text-destructive">"{questiontypeToDelete?.name_en}"</span> ({questiontypeToDelete?.code}).
            All questions of this type will be affected. This operation cannot be undone.
          </>
        }
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
        confirmText="Delete Type"
      />
    </div>
  )
}
