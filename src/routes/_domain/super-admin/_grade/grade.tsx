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
import { DeleteModal } from '@/components/ui/delete-modal'
import { TableEmptyStateRow, SearchInput } from '@/components/ui/shared'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import {
  RefreshCw,
  Plus,
  Loader2,
} from 'lucide-react'
import { ActionButton } from '@/components/ui/action-button'
import { useGradesQuery, useDeleteGradeMutation } from './_hooks/useGrade'
import type { GradeItem } from './_types/grade.types'
import { GradeDialog } from './_components/GradeDialog'
import { GradeCategoriesDialog } from './_components/GradeCategoriesDialog'
import { toast } from 'sonner'

export const Route = createFileRoute('/_domain/super-admin/_grade/grade')({
  component: GradesPage,
})

function GradesPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 350)

  // Dialog triggers
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeGrade, setActiveGrade] = useState<GradeItem | null>(null)

  const [categoriesDialogOpen, setCategoriesDialogOpen] = useState(false)
  const [gradeForCategories, setGradeForCategories] = useState<GradeItem | null>(null)

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [gradeToDelete, setGradeToDelete] = useState<GradeItem | null>(null)

  // Fetch grades using React Query
  const { data, isLoading, isFetching, isError, refetch } = useGradesQuery(page, limit, debouncedSearch)
  const deleteMutation = useDeleteGradeMutation()

  const grades = data?.data || []
  const totalElements = data?.total_elements || 0
  const totalPages = data?.total_pages || 1

  const handleAdd = () => {
    setActiveGrade(null)
    setDialogOpen(true)
  }

  const handleEdit = (grade: GradeItem) => {
    setActiveGrade(grade)
    setDialogOpen(true)
  }

  const handleManageCategories = (grade: GradeItem) => {
    setGradeForCategories(grade)
    setCategoriesDialogOpen(true)
  }

  const handleDeleteTrigger = (grade: GradeItem) => {
    setGradeToDelete(grade)
    setDeleteAlertOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (gradeToDelete) {
      deleteMutation.mutate(gradeToDelete.id, {
        onSuccess: () => {
          setDeleteAlertOpen(false)
          setGradeToDelete(null)
        },
      })
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Grades"
        description="Manage educational grade levels, category mappings, sort ordering, and access structures."
      >
        <Button onClick={handleAdd} className="text-xs !h-9">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Grade
        </Button>
      </PageHeader>

      {/* Main Content Card */}
      <Card className="py-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 p-5 pb-0">
          <SearchInput
            placeholder="Search grades by English or Khmer name..."
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
                toast.success('Grades list refreshed successfully')
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
                <TableHead className="pl-6 w-[120px]">Grade Number</TableHead>
                <TableHead>English Label</TableHead>
                <TableHead>Khmer Label</TableHead>
                <TableHead>Sort Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right w-[140px]">Actions</TableHead>
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
              ) : grades.length === 0 ? (
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
                ) : (
                  <TableEmptyStateRow
                    colSpan={6}
                    variant="empty"
                    title="No grades configured yet"
                    description="Create your first school grade to group categories and learning paths."
                    actionLabel="Create Grade"
                    actionIcon={Plus}
                    onAction={() => {
                      setActiveGrade(null)
                      setDialogOpen(true)
                    }}
                  />
                )
              ) : (
                // Data List
                grades.map((g) => (
                  <TableRow key={g.id}>
                    {/* Grade Number */}
                    <TableCell className="pl-6 py-3.5 font-bold">
                      {g.grade_number}
                    </TableCell>

                    {/* English Label */}
                    <TableCell className="font-semibold text-xs">
                      {g.name_en}
                    </TableCell>

                    {/* Khmer Label */}
                    <TableCell className="text-xs">
                      {g.name_kh}
                    </TableCell>

                    {/* Sort Order */}
                    <TableCell className="text-xs font-medium">
                      {g.sort_order}
                    </TableCell>

                    {/* Status Column */}
                    <TableCell>
                      {g.is_active ? (
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
                          actionType="info"
                          tooltip="Manage Categories"
                          onClick={() => handleManageCategories(g)}
                        />
                        <ActionButton
                          actionType="edit"
                          tooltip="Edit Grade"
                          onClick={() => handleEdit(g)}
                        />
                        <ActionButton
                          actionType="delete"
                          tooltip="Delete Grade"
                          onClick={() => handleDeleteTrigger(g)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Footer */}
          {!isLoading && !isError && grades.length > 0 && (
            <div className="flex items-center justify-between p-4 px-6 border-t">
              <div className="text-[10px]">
                Showing <span className="font-semibold">{((page - 1) * limit) + 1}</span> to{" "}
                <span className="font-semibold">
                  {Math.min(page * limit, totalElements)}
                </span>{" "}
                of <span className="font-semibold">{totalElements}</span> grades
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

      {/* Grade Create/Edit Dialog Form */}
      <GradeDialog open={dialogOpen} onOpenChange={setDialogOpen} grade={activeGrade} />

      {/* Grade Category Mapping Dialog */}
      <GradeCategoriesDialog open={categoriesDialogOpen} onOpenChange={setCategoriesDialogOpen} grade={gradeForCategories} />

      {/* Grade Delete Confirmation Dialog */}
      <DeleteModal
        open={deleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
        description={
          <>
            This will permanently delete the grade level <span className="font-semibold text-destructive">"{gradeToDelete?.name_en}" ({gradeToDelete?.name_kh})</span>.
            This operation cannot be undone.
          </>
        }
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
        confirmText="Delete Grade"
      />
    </div>
  )
}
