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
  Plus,
  UploadCloud,
} from 'lucide-react'
import { ActionButton } from '@/components/ui/action-button'
import { DeleteModal } from '@/components/ui/delete-modal'
import { SearchableSelect, TableEmptyStateRow, TableToolbar, DataTablePagination } from '@/components/ui/shared'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useQuestionsQuery, useDeleteQuestionMutation } from './_hooks/useQuestion'
import { useCategoriesQuery } from '../_category/_hooks/useCategory'
import { useGradesQuery } from '../_grade/_hooks/useGrade'
import { useGradeCategoriesQuery } from '../_grade/_hooks/useGradeCategory'
import type { QuestionItem, DifficultyEnum } from './_types/question.types'
import { QuestionDialog } from './components/QuestionDialog'
import { QuestionDetailDialog } from './components/QuestionDetailDialog'
import { QuestionImportDialog } from './components/QuestionImportDialog'
import { toast } from 'sonner'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'

import { cleanText } from '@/lib/utils'

export const Route = createFileRoute('/_domain/super-admin/_question/question')({
  component: QuestionsPage,
})

function QuestionsPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 350)

  // Filter States
  const [selectedGradeId, setSelectedGradeId] = useState<string>('all')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')

  // Dialog triggers
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeQuestion, setActiveQuestion] = useState<QuestionItem | null>(null)

  const [importDialogOpen, setImportDialogOpen] = useState(false)

  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null)
  const [questionForDetail, setQuestionForDetail] = useState<QuestionItem | null>(null)

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<QuestionItem | null>(null)

  const filterGrade = selectedGradeId === 'all' ? undefined : selectedGradeId
  const filterCategory = selectedCategoryId === 'all' ? undefined : selectedCategoryId
  const filterType = selectedType === 'all' ? undefined : selectedType
  const filterDifficulty = selectedDifficulty === 'all' ? undefined : selectedDifficulty

  // Fetch Questions
  const { data, isLoading, isFetching, isError, refetch } = useQuestionsQuery(
    page,
    limit,
    debouncedSearch,
    filterCategory,
    filterGrade,
    filterType,
    filterDifficulty
  )

  // Fetch grades and categories for filters
  const { data: gradesResponse } = useGradesQuery(1, 100, '')
  const { data: allCategoriesResponse } = useCategoriesQuery(1, 100, '', true)
  const { data: gradeCategoriesResponse } = useGradeCategoriesQuery(selectedGradeId, selectedGradeId !== 'all')

  const grades = gradesResponse?.data || []
  const allCategories = allCategoriesResponse?.data || []
  const availableCategories =
    selectedGradeId !== 'all' && gradeCategoriesResponse?.data && gradeCategoriesResponse.data.length > 0
      ? gradeCategoriesResponse.data
      : allCategories

  const gradeFilterOptions = [
    { value: 'all', label: 'All Grades' },
    ...grades.map((g) => ({
      value: g.id,
      label: g.name_en,
      description: g.name_kh,
    })),
  ]

  const categoryFilterOptions = [
    { value: 'all', label: 'All Categories' },
    ...availableCategories.map((c) => ({
      value: c.id,
      label: c.name_en,
      description: c.name_kh,
    })),
  ]

  const typeFilterOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'MCQ', label: 'MCQ' },
    { value: 'MULTI_SELECT', label: 'Multi-Select' },
    { value: 'TRUE_FALSE', label: 'True / False' },
    { value: 'FILL_BLANK', label: 'Fill Blank' },
    { value: 'MATCHING', label: 'Matching' },
    { value: 'ORDER', label: 'Reordering' },
  ]

  const difficultyFilterOptions = [
    { value: 'all', label: 'All Difficulties' },
    { value: 'EASY', label: 'Easy' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HARD', label: 'Hard' },
  ]

  const deleteMutation = useDeleteQuestionMutation()

  const questions = data?.data || []
  const totalElements = data?.total_elements || 0
  const totalPages = data?.total_pages || 1

  const handleAdd = () => {
    setActiveQuestion(null)
    setDialogOpen(true)
  }

  const handleEdit = (q: QuestionItem) => {
    setActiveQuestion(q)
    setDialogOpen(true)
  }

  const handleViewDetail = (q: QuestionItem) => {
    setQuestionForDetail(q)
    setActiveQuestionId(q.id)
    setDetailDialogOpen(true)
  }

  const handleDeleteTrigger = (q: QuestionItem) => {
    setQuestionToDelete(q)
    setDeleteAlertOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (questionToDelete) {
      deleteMutation.mutate(questionToDelete.id, {
        onSuccess: () => {
          setDeleteAlertOpen(false)
          setQuestionToDelete(null)
        },
      })
    }
  }

  const getDifficultyBadge = (diff: DifficultyEnum) => {
    switch (diff) {
      case 'EASY':
        return <Badge className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-500/10">Easy</Badge>
      case 'MEDIUM':
        return <Badge className="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-500/10">Medium</Badge>
      case 'HARD':
        return <Badge className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-500/10">Hard</Badge>
      default:
        return <Badge variant="outline">{diff}</Badge>
    }
  }

  // TanStack Table Column Definitions
  const columnHelper = createColumnHelper<QuestionItem>()
  const columns = [
    columnHelper.accessor('question_text_en', {
      header: 'Question Text Preview',
      cell: (info) => {
        const q = info.row.original
        return (
          <div className="space-y-1">
            <div className="font-semibold text-foreground text-xs max-w-[320px] truncate">
              {cleanText(q.question_text_en)}
            </div>
            <div className="text-xs text-muted-foreground max-w-[320px] truncate">
              {cleanText(q.question_text_kh)}
            </div>
          </div>
        )
      },
    }),
    columnHelper.accessor('grade', {
      header: 'Grade',
      cell: (info) => {
        const grade = info.getValue()
        return grade ? (
          <Badge variant="outline" className="bg-muted/50 border">
            {grade.name_en}
          </Badge>
        ) : (
          <span className="text-muted-foreground/60">-</span>
        )
      },
    }),
    columnHelper.accessor('category', {
      header: 'Category',
      cell: (info) => info.getValue()?.name_en || '-',
    }),
    columnHelper.accessor('question_type', {
      header: 'Type',
      cell: (info) => (
        <Badge variant="secondary" className="font-bold text-[10px] uppercase">
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('difficulty_level', {
      header: 'Difficulty',
      cell: (info) => getDifficultyBadge(info.getValue()),
    }),
    columnHelper.accessor('xp_value', {
      header: 'XP Value',
      cell: (info) => `${info.getValue()} XP`,
    }),
    columnHelper.accessor('is_active', {
      header: 'Status',
      cell: (info) => (
        info.getValue() ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="destructive">Inactive</Badge>
        )
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: (info) => {
        const q = info.row.original
        return (
          <div className="flex justify-end gap-1">
            <ActionButton
              actionType="info"
              tooltip="View Details"
              onClick={() => handleViewDetail(q)}
            />
            <ActionButton
              actionType="edit"
              tooltip="Edit Question"
              onClick={() => handleEdit(q)}
            />
            <ActionButton
              actionType="delete"
              tooltip="Delete Question"
              onClick={() => handleDeleteTrigger(q)}
            />
          </div>
        )
      },
    }),
  ]

  // Setup table instance
  const table = useReactTable({
    data: questions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="text-foreground animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Questions"
        description="Manage the study question repository database, formats validation, difficulty levels, and categories."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
            <UploadCloud className="mr-1.5 size-4" /> Import Questions
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="mr-1.5 size-4" /> Add Question
          </Button>
        </div>
      </PageHeader>

      {/* Main Content Card */}
      <Card className="py-0">
        {/* Toolbar Filters */}
        <TableToolbar
          searchPlaceholder="Search questions by text..."
          searchValue={search}
          onSearchChange={(val) => {
            setSearch(val)
            setPage(1)
          }}
          onRefresh={() => {
            refetch().then(() => {
              toast.success('Questions database refreshed')
            })
          }}
          isRefreshing={isFetching}
          filters={
            <>
              {/* Grade Filter */}
              <SearchableSelect
                options={gradeFilterOptions}
                value={selectedGradeId}
                onChange={(val) => {
                  setSelectedGradeId(val || 'all')
                  setSelectedCategoryId('all')
                  setPage(1)
                }}
                sortable="asc"
                placeholder="All Grades"
                searchPlaceholder="Search grade..."
                triggerClassName="w-[140px]"
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
                triggerClassName="w-[160px]"
              />

              {/* Type Filter */}
              <SearchableSelect
                options={typeFilterOptions}
                value={selectedType}
                onChange={(val) => {
                  setSelectedType(val || 'all')
                  setPage(1)
                }}
                placeholder="All Types"
                searchPlaceholder="Search type..."
                triggerClassName="w-[140px]"
              />

              {/* Difficulty Filter */}
              <SearchableSelect
                options={difficultyFilterOptions}
                value={selectedDifficulty}
                onChange={(val) => {
                  setSelectedDifficulty(val || 'all')
                  setPage(1)
                }}
                placeholder="All Difficulties"
                searchPlaceholder="Search difficulty..."
                triggerClassName="w-[130px]"
              />
            </>
          }
        />

        <CardContent className="p-0">
          <div className="relative w-full overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={
                          header.id === 'actions'
                            ? 'text-right w-[120px]'
                            : undefined
                        }
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  // Loading Skeletons
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="pl-6">
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-64" />
                          <Skeleton className="h-3.5 w-48" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-14 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-14 rounded-full" />
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
                ) : questions.length === 0 ? (
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
                  ) : (selectedGradeId !== 'all' || selectedCategoryId !== 'all' || selectedType !== 'all' || selectedDifficulty !== 'all') ? (
                    <TableEmptyStateRow
                      colSpan={8}
                      variant="filter"
                      title="No questions match active filters"
                      description="No questions were found with the selected filter criteria. Try adjusting or clearing your filters."
                      onClear={() => {
                        setSelectedGradeId('all')
                        setSelectedCategoryId('all')
                        setSelectedType('all')
                        setSelectedDifficulty('all')
                        setPage(1)
                      }}
                    />
                  ) : (
                    <TableEmptyStateRow
                      colSpan={8}
                      variant="empty"
                      title="No questions found"
                      description="Get started by creating a question or importing questions in bulk."
                      actionLabel="Create Question"
                      actionIcon={Plus}
                      onAction={() => {
                        setActiveQuestion(null)
                        setDialogOpen(true)
                      }}
                    />
                  )
                ) : (
                  // Data List rendered via TanStack Table
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={
                            cell.column.id === 'actions'
                              ? 'text-right'
                              : undefined
                          }
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          {!isLoading && !isError && questions.length > 0 && (
            <DataTablePagination
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={limit}
              onPageChange={setPage}
              itemLabel="questions"
            />
          )}
        </CardContent>
      </Card>

      {/* Question Form Dialog Modal */}
      <QuestionDialog open={dialogOpen} onOpenChange={setDialogOpen} question={activeQuestion} />

      {/* Question Import Dialog Modal */}
      <QuestionImportDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} />

      {/* Question Detail View Dialog Modal */}
      <QuestionDetailDialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen} questionId={activeQuestionId} question={questionForDetail} />

      {/* Question Delete Confirmation Dialog (using reusable DeleteModal) */}
      <DeleteModal
        open={deleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
        description={
          <>
            This will permanently delete the question <span className="font-semibold text-foreground">"{questionToDelete?.question_text_en}"</span>.
            This action cannot be undone.
          </>
        }
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
        confirmText="Delete Question"
      />
    </div>
  )
}
