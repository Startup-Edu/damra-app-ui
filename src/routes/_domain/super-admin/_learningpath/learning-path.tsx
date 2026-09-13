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
import { DeleteModal } from '@/components/ui/delete-modal'
import { SearchableSelect, TableEmptyStateRow, SearchInput } from '@/components/ui/shared'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useLearningPathsQuery, useDeleteLearningPathMutation } from './_hooks/useLearningPath'
import { useCategoriesQuery } from '../_category/_hooks/useCategory'
import { useGradesQuery } from '../_grade/_hooks/useGrade'
import type { LearningPathItem } from './_types/learningpath.types'
import { LearningPathDialog } from './_components/LearningPathDialog'
import { PathBuilderDialog } from './_components/PathBuilderDialog'
import { toast } from 'sonner'
import { ActionButton } from '@/components/ui/action-button'

export const Route = createFileRoute('/_domain/super-admin/_learningpath/learning-path')({
  component: LearningPathPage,
})

function LearningPathPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 350)

  // Filter States
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')
  const [selectedGradeId, setSelectedGradeId] = useState<string>('all')

  // Dialog triggers
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeLearningPath, setActiveLearningPath] = useState<LearningPathItem | null>(null)

  const [builderDialogOpen, setBuilderDialogOpen] = useState(false)
  const [pathForBuilder, setPathForBuilder] = useState<LearningPathItem | null>(null)

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [learningPathToDelete, setLearningPathToDelete] = useState<LearningPathItem | null>(null)

  // Filters mapping
  const filterCategory = selectedCategoryId === 'all' ? undefined : selectedCategoryId
  const filterGrade = selectedGradeId === 'all' ? undefined : selectedGradeId

  // Fetch learning paths using React Query
  const { data, isLoading, isFetching, isError, refetch } = useLearningPathsQuery(
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

  const categoryFilterOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map((c) => ({
      value: c.id,
      label: c.name_en,
      description: c.name_kh,
    })),
  ]

  const gradeFilterOptions = [
    { value: 'all', label: 'All Grades' },
    ...grades.map((g) => ({
      value: g.id,
      label: g.name_en,
      description: g.name_kh,
    })),
  ]

  const deleteMutation = useDeleteLearningPathMutation()

  const learningPaths = data?.data || []
  const totalElements = data?.total_elements || 0
  const totalPages = data?.total_pages || 1

  const handleAdd = () => {
    setActiveLearningPath(null)
    setDialogOpen(true)
  }

  const handleEdit = (item: LearningPathItem) => {
    setActiveLearningPath(item)
    setDialogOpen(true)
  }

  const handleBuildPath = (item: LearningPathItem) => {
    setPathForBuilder(item)
    setBuilderDialogOpen(true)
  }

  const handleDeleteTrigger = (item: LearningPathItem) => {
    setLearningPathToDelete(item)
    setDeleteAlertOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (learningPathToDelete) {
      deleteMutation.mutate(learningPathToDelete.id, {
        onSuccess: () => {
          setDeleteAlertOpen(false)
          setLearningPathToDelete(null)
        },
      })
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Learning Path"
        description="Manage user-journey roadmaps, path nodes, and category/grade alignments."
      >
        <Button onClick={handleAdd} className="text-xs !h-9">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Learning Path
        </Button>
      </PageHeader>

      {/* Main Content Card */}
      <Card className="py-0">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-5 pb-0">
          <div className="flex flex-1 items-center gap-3 max-w-3xl">
            <SearchInput
              placeholder="Search learning paths by English or Khmer title..."
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
              options={categoryFilterOptions}
              value={selectedCategoryId}
              onChange={(val) => {
                setSelectedCategoryId(val || 'all')
                setPage(1)
              }}
              sortable="asc"
              placeholder="All Categories"
              searchPlaceholder="Search category..."
              triggerClassName="w-[180px]"
            />

            {/* Grade Filter */}
            <SearchableSelect
              options={gradeFilterOptions}
              value={selectedGradeId}
              onChange={(val) => {
                setSelectedGradeId(val || 'all')
                setPage(1)
              }}
              sortable="asc"
              placeholder="All Grades"
              searchPlaceholder="Search grade..."
              triggerClassName="w-[150px]"
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              refetch().then(() => {
                toast.success('Learning paths list refreshed successfully')
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
                <TableHead className="pl-6 w-[90px]">Sequence</TableHead>
                <TableHead>Learning Path Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>XP & Pass Rules</TableHead>
                <TableHead>Quiz Packages</TableHead>
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
                <TableEmptyStateRow
                  colSpan={8}
                  variant="error"
                  onAction={() => refetch()}
                />
              ) : learningPaths.length === 0 ? (
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
                ) : (selectedCategoryId !== 'all' || selectedGradeId !== 'all') ? (
                  <TableEmptyStateRow
                    colSpan={8}
                    variant="filter"
                    title="No learning paths match active filters"
                    description="No learning paths were found with the selected category or grade. Try adjusting or resetting your filters."
                    onClear={() => {
                      setSelectedCategoryId('all')
                      setSelectedGradeId('all')
                      setPage(1)
                    }}
                  />
                ) : (
                  <TableEmptyStateRow
                    colSpan={8}
                    variant="empty"
                    title="No learning paths created yet"
                    description="Create your first structured learning path with quiz packages."
                    actionLabel="Create Learning Path"
                    actionIcon={Plus}
                    onAction={() => {
                      setActiveLearningPath(null)
                      setDialogOpen(true)
                    }}
                  />
                )
              ) : (
                // Data List
                learningPaths.map((l) => {
                  const pkgs = l.quiz_packages || l.quizPackages || []
                  const xp = l.xp_reward ?? l.xpReward ?? 100
                  const pass = l.pass_score_percentage ?? l.passScorePercentage ?? 70
                  const skip = l.allow_skip ?? l.allowSkip ?? false

                  return (
                    <TableRow key={l.id}>
                      {/* Sequence */}
                      <TableCell className="pl-6 py-3.5 font-bold">
                        #{l.sequence_order ?? l.sequenceOrder ?? l.sequence ?? 1}
                      </TableCell>

                      {/* Learning Path Title */}
                      <TableCell className="space-y-1" >
                        <div className="font-semibold text-xs">
                          {l.title_en}
                        </div>
                        <div className="text-xs font-medium text-muted-foreground">
                          {l.title_kh}
                        </div>
                      </TableCell>

                      {/* Category Column */}
                      <TableCell className="text-xs font-medium">
                        {l.category ? (
                          <span>{l.category.name_en}</span>
                        ) : (
                          <span>-</span>
                        )}
                      </TableCell>

                      {/* Grade Column */}
                      <TableCell className="text-xs font-medium">
                        {l.grade ? (
                          <Badge variant="outline">
                            {l.grade.name_en}
                          </Badge>
                        ) : (
                          <span>-</span>
                        )}
                      </TableCell>

                      {/* XP & Pass Rules Column */}
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                            {xp} XP
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                            {pass}% Pass
                          </Badge>
                          {skip && (
                            <Badge variant="outline" className="text-[9px] text-blue-600 border-blue-500/30">
                              Skip Allowed
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Quiz Packages Column */}
                      <TableCell>
                        <Badge variant={pkgs.length > 0 ? "secondary" : "outline"} className="text-[10px]">
                          {pkgs.length} Package{pkgs.length === 1 ? '' : 's'}
                        </Badge>
                      </TableCell>

                      {/* Status Column */}
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          {l.is_active ? (
                            <Badge variant="success" className="text-[10px]">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[10px]">
                              Inactive
                            </Badge>
                          )}
                          {(l.is_published ?? l.isPublished) ? (
                            <Badge variant="secondary" className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                              Published
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[9px] text-neutral-400">
                              Draft
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Actions Column */}
                      <TableCell className="pr-6 text-right">
                        <div className="flex justify-end gap-1">
                          <ActionButton
                            actionType="info"
                            tooltip="Path Builder & Quiz Packages"
                            onClick={() => handleBuildPath(l)}
                          />
                          <ActionButton
                            actionType="edit"
                            tooltip="Edit Learning Path"
                            onClick={() => handleEdit(l)}
                          />
                          <ActionButton
                            actionType="delete"
                            tooltip="Delete Learning Path"
                            onClick={() => handleDeleteTrigger(l)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination Footer */}
          {!isLoading && !isError && learningPaths.length > 0 && (
            <div className="flex items-center justify-between p-4 px-6 border-t">
              <div className="text-xs">
                Showing <span className="font-semibold">{((page - 1) * limit) + 1}</span> to{" "}
                <span className="font-semibold">
                  {Math.min(page * limit, totalElements)}
                </span>{" "}
                of <span className="font-semibold">{totalElements}</span> learning paths
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

      {/* Learning Path Create/Edit Dialog Form */}
      <LearningPathDialog open={dialogOpen} onOpenChange={setDialogOpen} learningPath={activeLearningPath} />

      <PathBuilderDialog open={builderDialogOpen} onOpenChange={setBuilderDialogOpen} learningPath={pathForBuilder} />

      {/* Learning Path Delete Confirmation Dialog */}
      <DeleteModal
        open={deleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
        description={
          <>
            This will permanently delete the learning path <span className="font-semibold text-destructive">"{learningPathToDelete?.title_en}"</span> ({learningPathToDelete?.title_kh}).
            This learning path must not contain any quiz packages or questions. This operation cannot be undone.
          </>
        }
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
        confirmText="Delete Learning Path"
      />
    </div>
  )
}
