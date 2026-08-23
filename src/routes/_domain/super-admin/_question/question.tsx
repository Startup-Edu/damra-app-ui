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
  Search,
  RefreshCw,
  Plus,
  Loader2,
  HelpCircle,
  UploadCloud,
} from 'lucide-react'
import { ActionButton } from '@/components/ui/action-button'
import { DeleteModal } from '@/components/ui/delete-modal'
import { SearchableSelect } from '@/components/ui/shared/SearchableSelect'
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
  const [debouncedSearch, setDebouncedSearch] = useState('')

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

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)

    return () => clearTimeout(handler)
  }, [search])

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
  const availableCategories = selectedGradeId !== 'all' && gradeCategoriesResponse?.data
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
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs max-w-[320px] truncate">
              {cleanText(q.question_text_en)}
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 max-w-[320px] truncate">
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
          <Badge variant="outline" className="bg-slate-50 dark:bg-slate-900 border">
            {grade.name_en}
          </Badge>
        ) : (
          <span className="text-slate-300 dark:text-slate-700">-</span>
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
        <Badge variant="secondary" className="font-bold text-[10px] uppercase bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
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
      header: () => <div className="text-right pr-6 w-[120px]">Actions</div>,
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
    <div className="text-slate-900 dark:text-slate-50 animate-fade-in">
      <QuestionDialog open={dialogOpen} setOpen={setDialogOpen} question={activeQuestion} />
      <QuestionDetailDialog open={detailDialogOpen} setOpen={setDetailDialogOpen} question={questionForDetail} />
      <QuestionImportDialog open={importDialogOpen} setOpen={setImportDialogOpen} />
      <DeleteModal
        open={deleteAlertOpen}
        setOpen={setDeleteAlertOpen}
        title="Delete Question"
        description="Are you sure you want to delete this question? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
      />
      
      {/* Page Header */}
      <PageHeader
        title="Questions"
        description="Manage the study question repository database, formats validation, difficulty levels, and categories."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setImportDialogOpen(true)} className="text-xs !h-9">
            <UploadCloud className="mr-1.5 h-3.5 w-3.5" /> Import Questions
          </Button>
          <Button onClick={handleAdd} className="text-xs !h-9">
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Question
          </Button>
        </div>
      </PageHeader>

      {/* Main Content Card */}
      <Card className="py-0">
        {/* Toolbar Filters */}
        <div className="flex flex-col gap-3 p-5 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-xs min-w-[240px] group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search questions by text..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-9.5 text-xs"
              />
            </div>

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

            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                refetch().then(() => {
                  toast.success('Questions database refreshed')
                })
              }}
              disabled={isFetching}
              className="h-9.5 w-9.5 shrink-0 ml-auto"
            >
              {isFetching ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : (
                <RefreshCw className="h-4.5 w-4.5" />
              )}
            </Button>
          </div>
        </div>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={
                        header.id === 'question_text_en'
                          ? 'pl-6'
                          : header.id === 'actions'
                            ? 'pr-6 text-right w-[120px]'
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
                    Failed to fetch questions. Please make sure the API server is online.
                  </TableCell>
                </TableRow>
              ) : questions.length === 0 ? (
                // Empty State
                <TableRow>
                  <TableCell colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <HelpCircle className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                      <p className="text-xs font-semibold">No questions found matching your filter options</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // Data List rendered via TanStack Table
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={
                          cell.column.id === 'question_text_en'
                            ? 'pl-6 py-3'
                            : cell.column.id === 'actions'
                              ? 'pr-6 text-right'
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

          {/* Pagination Footer */}
          {!isLoading && !isError && questions.length > 0 && (
            <div className="flex items-center justify-between p-4 px-6 border-t bg-slate-50/30 dark:bg-slate-950/10">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{((page - 1) * limit) + 1}</span> to{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {Math.min(page * limit, totalElements)}
                </span>{" "}
                of <span className="font-semibold text-slate-900 dark:text-slate-100">{totalElements}</span> questions
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

      {/* Question Form Dialog Modal */}
      <QuestionDialog open={dialogOpen} onOpenChange={setDialogOpen} question={activeQuestion} />

      {/* Question Import Dialog Modal */}
      <QuestionImportDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} />

      {/* Question Detail View Dialog Modal */}
      <QuestionDetailDialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen} questionId={activeQuestionId} />

      {/* Question Delete Confirmation Dialog (using reusable DeleteModal) */}
      <DeleteModal
        open={deleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
        description={
          <>
            This will permanently delete the question <span className="font-semibold text-slate-800 dark:text-slate-200">"{questionToDelete?.question_text_en}"</span>.
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
