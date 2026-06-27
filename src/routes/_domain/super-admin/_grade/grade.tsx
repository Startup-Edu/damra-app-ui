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
  GraduationCap,
} from 'lucide-react'
import { ActionButton } from '@/components/ui/action-button'
import { useGradesQuery, useDeleteGradeMutation } from '../_hooks/useGrade'
import type { GradeItem } from '../_types/grade.types'
import { GradeDialog } from '../_components/GradeDialog'
import { toast } from 'sonner'

export const Route = createFileRoute('/_domain/super-admin/_grade/grade')({
  component: GradesPage,
})

function GradesPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Dialog triggers
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeGrade, setActiveGrade] = useState<GradeItem | null>(null)

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [gradeToDelete, setGradeToDelete] = useState<GradeItem | null>(null)

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1) // Reset to first page on search change
    }, 400)

    return () => clearTimeout(handler)
  }, [search])

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
    <div className="text-slate-900 dark:text-slate-50 animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Grades"
        description="Manage educational grade levels, sort ordering, sequence indexes, and access structures."
      >
        <Button onClick={handleAdd} className="text-xs !h-9">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Grade
        </Button>
      </PageHeader>

      {/* Main Content Card */}
      <Card className="py-0">
        {/* Toolbar */}
        <div className="flex items-center gap-3 p-6 pb-4">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search grades by English or Khmer name..."
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
                toast.success('Grades list refreshed successfully')
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
                <TableHead className="pl-6 w-[120px]">Grade Number</TableHead>
                <TableHead>English Label</TableHead>
                <TableHead>Khmer Label</TableHead>
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
                  <TableCell colSpan={6} className="py-12 text-center text-rose-500 font-medium text-xs">
                    Failed to fetch grades. Please make sure the API server is online.
                  </TableCell>
                </TableRow>
              ) : grades.length === 0 ? (
                // Empty State
                <TableRow>
                  <TableCell colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <GraduationCap className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                      <p className="text-xs font-semibold">No grades found matching your query</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // Data List
                grades.map((g) => (
                  <TableRow key={g.id}>
                    {/* Grade Number */}
                    <TableCell className="pl-6 py-3.5 font-bold text-slate-700 dark:text-slate-300">
                      {g.grade_number}
                    </TableCell>

                    {/* English Label */}
                    <TableCell className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                      {g.name_en}
                    </TableCell>

                    {/* Khmer Label */}
                    <TableCell className="text-xs text-slate-600 dark:text-slate-400">
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
            <div className="flex items-center justify-between p-4 px-6 border-t bg-slate-50/30 dark:bg-slate-950/10">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{((page - 1) * limit) + 1}</span> to{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {Math.min(page * limit, totalElements)}
                </span>{" "}
                of <span className="font-semibold text-slate-900 dark:text-slate-100">{totalElements}</span> grades
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

      {/* Grade Delete Confirmation Dialog */}
      <DeleteModal
        open={deleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
        description={
          <>
            This will permanently delete the grade level <span className="font-semibold text-slate-800 dark:text-slate-200">"{gradeToDelete?.name_en}"</span> ({gradeToDelete?.name_kh}).
            This grade level must not contain any levels or dependencies assigned to it. This operation cannot be undone.
          </>
        }
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
        confirmText="Delete Grade"
      />
    </div>
  )
}
