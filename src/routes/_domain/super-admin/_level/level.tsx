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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  RefreshCw,
  Plus,
  Loader2,
  Layers,
} from 'lucide-react'
import { ActionButton } from '@/components/ui/action-button'
import { DeleteModal } from '@/components/ui/delete-modal'
import { useLevelsQuery, useDeleteLevelMutation } from '../_hooks/useLevel'
import { useCategoriesQuery } from '../_hooks/useCategory'
import { useGradesQuery } from '../_hooks/useGrade'
import type { LevelItem } from '../_types/level.types'
import { LevelDialog } from '../_components/LevelDialog'
import { toast } from 'sonner'

export const Route = createFileRoute('/_domain/super-admin/_level/level')({
  component: LevelsPage,
})

function LevelsPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Filter States
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')
  const [selectedGradeId, setSelectedGradeId] = useState<string>('all')

  // Dialog triggers
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeLevel, setActiveLevel] = useState<LevelItem | null>(null)

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [levelToDelete, setLevelToDelete] = useState<LevelItem | null>(null)

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1) // Reset on search change
    }, 400)

    return () => clearTimeout(handler)
  }, [search])

  // Filters mapping
  const filterCategory = selectedCategoryId === 'all' ? undefined : selectedCategoryId
  const filterGrade = selectedGradeId === 'all' ? undefined : selectedGradeId

  // Fetch levels using React Query
  const { data, isLoading, isFetching, isError, refetch } = useLevelsQuery(
    page,
    limit,
    debouncedSearch,
    filterCategory,
    filterGrade
  )

  // Fetch categories and grades for toolbar filters
  const { data: categoriesResponse } = useCategoriesQuery(1, 100, '', true)
  const { data: gradesResponse } = useGradesQuery(1, 100, '')

  const categories = categoriesResponse?.data || []
  const grades = gradesResponse?.data || []

  const deleteMutation = useDeleteLevelMutation()

  const levels = data?.data || []
  const totalElements = data?.total_elements || 0
  const totalPages = data?.total_pages || 1

  const handleAdd = () => {
    setActiveLevel(null)
    setDialogOpen(true)
  }

  const handleEdit = (level: LevelItem) => {
    setActiveLevel(level)
    setDialogOpen(true)
  }

  const handleDeleteTrigger = (level: LevelItem) => {
    setLevelToDelete(level)
    setDeleteAlertOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (levelToDelete) {
      deleteMutation.mutate(levelToDelete.id, {
        onSuccess: () => {
          setDeleteAlertOpen(false)
          setLevelToDelete(null)
        },
      })
    }
  }

  return (
    <div className="text-slate-900 dark:text-slate-50 animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Levels"
        description="Manage difficulty roadmaps, sequencing indexes, and category/grade alignments."
      >
        <Button onClick={handleAdd} className="text-xs !h-9">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Level
        </Button>
      </PageHeader>

      {/* Main Content Card */}
      <Card className="py-0">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-6 pb-4">
          <div className="flex flex-1 items-center gap-3 max-w-2xl">
            {/* Search Input */}
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search levels by English or Khmer title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 text-xs"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategoryId} onValueChange={(val) => { setSelectedCategoryId(val); setPage(1); }}>
              <SelectTrigger className="w-[180px] h-10 text-xs border border-input">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Grade Filter */}
            <Select value={selectedGradeId} onValueChange={(val) => { setSelectedGradeId(val); setPage(1); }}>
              <SelectTrigger className="w-[150px] h-10 text-xs border border-input">
                <SelectValue placeholder="All Grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {grades.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              refetch().then(() => {
                toast.success('Levels list refreshed successfully')
              })
            }}
            disabled={isFetching}
            className="h-10 w-10 shrink-0"
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
                <TableHead className="pl-6 w-[120px]">Sequence</TableHead>
                <TableHead>Level Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Grade</TableHead>
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
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3.5 w-24" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
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
                    Failed to fetch levels. Please make sure the API server is online.
                  </TableCell>
                </TableRow>
              ) : levels.length === 0 ? (
                // Empty State
                <TableRow>
                  <TableCell colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Layers className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                      <p className="text-xs font-semibold">No levels found matching your filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // Data List
                levels.map((l) => (
                  <TableRow key={l.id}>
                    {/* Sequence */}
                    <TableCell className="pl-6 py-3.5 font-bold text-slate-700 dark:text-slate-300">
                      {l.sequence}
                    </TableCell>

                    {/* Level Title */}
                    <TableCell>
                      <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                        {l.title_en}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        {l.title_kh}
                      </div>
                    </TableCell>

                    {/* Category Column */}
                    <TableCell className="text-xs font-medium">
                      {l.category ? (
                        <span>{l.category.name_en}</span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-700">-</span>
                      )}
                    </TableCell>

                    {/* Grade Column */}
                    <TableCell className="text-xs font-medium">
                      {l.grade ? (
                        <Badge variant="outline" className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                          {l.grade.name_en}
                        </Badge>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-700">-</span>
                      )}
                    </TableCell>

                    {/* Status Column */}
                    <TableCell>
                      {l.is_active ? (
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
                          tooltip="Edit Level"
                          onClick={() => handleEdit(l)}
                        />
                        <ActionButton
                          actionType="delete"
                          tooltip="Delete Level"
                          onClick={() => handleDeleteTrigger(l)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Footer */}
          {!isLoading && !isError && levels.length > 0 && (
            <div className="flex items-center justify-between p-4 px-6 border-t bg-slate-50/30 dark:bg-slate-950/10">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{((page - 1) * limit) + 1}</span> to{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {Math.min(page * limit, totalElements)}
                </span>{" "}
                of <span className="font-semibold text-slate-900 dark:text-slate-100">{totalElements}</span> levels
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

      {/* Level Create/Edit Dialog Form */}
      <LevelDialog open={dialogOpen} onOpenChange={setDialogOpen} level={activeLevel} />

      {/* Level Delete Confirmation Dialog (using Reusable DeleteModal) */}
      <DeleteModal
        open={deleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
        description={
          <>
            This will permanently delete the level <span className="font-semibold text-slate-800 dark:text-slate-200">"{levelToDelete?.title_en}"</span> ({levelToDelete?.title_kh}).
            This level must not contain any quiz packages or questions. This operation cannot be undone.
          </>
        }
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
        confirmText="Delete Level"
      />
    </div>
  )
}
