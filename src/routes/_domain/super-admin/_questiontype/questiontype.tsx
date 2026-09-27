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
import { Plus } from 'lucide-react'
import { ActionButton } from '@/components/ui/action-button'
import { DeleteModal } from '@/components/ui/delete-modal'
import { TableEmptyStateRow, TableToolbar, DataTablePagination } from '@/components/ui/shared'
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
        <Button onClick={handleAdd}>
          <Plus className="mr-1.5 size-4" /> Add Type
        </Button>
      </PageHeader>

      {/* Main Content Card */}
      <Card className="py-0">
        {/* Toolbar */}
        <TableToolbar
          searchPlaceholder="Search question types by code or name..."
          searchValue={search}
          onSearchChange={(val) => {
            setSearch(val)
            setPage(1)
          }}
          onRefresh={() => {
            refetch().then(() => {
              toast.success('Question types list refreshed successfully')
            })
          }}
          isRefreshing={isFetching}
        />

        <CardContent className="p-0">
          <div className="relative w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[120px]">Code</TableHead>
                  <TableHead>English Name</TableHead>
                  <TableHead>Khmer Name</TableHead>
                  <TableHead>Description</TableHead>
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
                          <Skeleton className="size-8 rounded-md" />
                          <Skeleton className="size-8 rounded-md" />
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
                        setActiveQuestiontype(null)
                        setDialogOpen(true)
                      }}
                    />
                  )
                ) : (
                  // Data List
                  questionTypes.map((qt) => (
                    <TableRow key={qt.id}>
                      {/* Code */}
                      <TableCell>
                        <Badge variant="outline" className="font-semibold text-xs uppercase font-mono">
                          {qt.code}
                        </Badge>
                      </TableCell>

                      {/* English Name */}
                      <TableCell className="text-xs font-medium">
                        {qt.name_en}
                      </TableCell>

                      {/* Khmer Name */}
                      <TableCell className="text-xs text-muted-foreground">
                        {qt.name_kh}
                      </TableCell>

                      {/* Description */}
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {qt.description_en || <span>-</span>}
                      </TableCell>

                      {/* Sort Order */}
                      <TableCell className="text-xs font-medium">
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
                      <TableCell className="text-right">
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
          </div>

          {/* Pagination Footer */}
          {!isLoading && !isError && questionTypes.length > 0 && (
            <DataTablePagination
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={limit}
              onPageChange={setPage}
              itemLabel="question types"
            />
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
