import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar } from '@/components/ui/avatar'
import { ActionButton } from '@/components/ui/action-button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import {
  TableEmptyStateRow,
  TableToolbar,
  DataTablePagination,
  SearchableSelect,
} from '@/components/ui/shared'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import {
  Check,
  X,
  GraduationCap,
  Image as ImageIcon,
  AlertCircle,
  RotateCcw,
  Eye,
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useStudentVerificationsQuery,
  useStudentVerificationStatsQuery,
  useApproveVerificationMutation,
  useRejectVerificationMutation,
} from './_hooks/useStudentVerification'
import { useGradesQuery } from '../_grade/_hooks/useGrade'
import type { StudentVerificationItem, StudentVerificationStatus } from './_types/studentVerification.types'
import { StudentIdCardLightbox } from './_components/StudentIdCardLightbox'
import { ApproveVerificationModal } from './_components/ApproveVerificationModal'
import { RejectVerificationModal } from './_components/RejectVerificationModal'
import { DateRangeFilter, type DateRangeValue } from './_components/DateRangeFilter'

export const Route = createFileRoute('/_domain/super-admin/_student-verification/student-verification')({
  component: StudentVerificationPage,
})

function formatDateTime(dateStr: string) {
  if (!dateStr) return { date: '—', time: '' }

  // Check if DD-MM-YYYY format
  const dmyMatch = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{2}):(\d{2}))?/)
  let d: Date
  let hasExplicitTime = false

  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10)
    const month = parseInt(dmyMatch[2], 10) - 1
    const year = parseInt(dmyMatch[3], 10)
    const hours = dmyMatch[4] ? parseInt(dmyMatch[4], 10) : 0
    const minutes = dmyMatch[5] ? parseInt(dmyMatch[5], 10) : 0
    hasExplicitTime = Boolean(dmyMatch[4])
    d = new Date(year, month, day, hours, minutes)
  } else {
    d = new Date(dateStr)
    hasExplicitTime = true
  }

  if (isNaN(d.getTime())) return { date: dateStr, time: '' }

  const date = d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const time = hasExplicitTime
    ? d.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : ''
  return { date, time }
}

function StudentVerificationPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [statusTab, setStatusTab] = useState<string>('ALL')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 350)

  // Filters State
  const [selectedGradeId, setSelectedGradeId] = useState<string>('all')
  const [dateRange, setDateRange] = useState<DateRangeValue | undefined>(undefined)

  // Modals state
  const [previewItem, setPreviewItem] = useState<StudentVerificationItem | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const [approveItem, setApproveItem] = useState<StudentVerificationItem | null>(null)
  const [approveOpen, setApproveOpen] = useState(false)

  const [rejectItem, setRejectItem] = useState<StudentVerificationItem | null>(null)
  const [rejectOpen, setRejectOpen] = useState(false)

  // Queries
  const { data: statsData } = useStudentVerificationStatsQuery()
  const stats = statsData?.data || { total: 0, pending: 0, approved: 0, rejected: 0 }

  const { data: gradesResponse } = useGradesQuery(1, 100, '')
  const grades = gradesResponse?.data || []

  const gradeFilterOptions = [
    { value: 'all', label: 'All Grades' },
    ...grades.map((g) => ({
      value: g.id,
      label: g.name_en,
      description: g.name_kh,
    })),
  ]

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useStudentVerificationsQuery({
    page,
    limit,
    status: statusTab,
    search: debouncedSearch,
    gradeId: selectedGradeId === 'all' ? undefined : selectedGradeId,
    startDate: dateRange?.startDate,
    endDate: dateRange?.endDate,
  })

  const approveMutation = useApproveVerificationMutation()
  const rejectMutation = useRejectVerificationMutation()

  const items = data?.data || []
  const totalElements = data?.total_elements || 0
  const totalPages = data?.total_pages || 1

  const handleOpenLightbox = (item: StudentVerificationItem) => {
    setPreviewItem(item)
    setLightboxOpen(true)
  }

  const handleOpenApprove = (item: StudentVerificationItem) => {
    setApproveItem(item)
    setApproveOpen(true)
  }

  const handleOpenReject = (item: StudentVerificationItem) => {
    setRejectItem(item)
    setRejectOpen(true)
  }

  const handleConfirmApprove = () => {
    if (!approveItem) return
    approveMutation.mutate(approveItem.id, {
      onSuccess: () => {
        setApproveOpen(false)
        setApproveItem(null)
      },
    })
  }

  const handleConfirmReject = (reason: string) => {
    if (!rejectItem) return
    rejectMutation.mutate(
      { id: rejectItem.id, data: { rejectReason: reason } },
      {
        onSuccess: () => {
          setRejectOpen(false)
          setRejectItem(null)
        },
      }
    )
  }

  const hasActiveFilters = Boolean(
    debouncedSearch || selectedGradeId !== 'all' || dateRange
  )

  const handleResetFilters = () => {
    setSearch('')
    setSelectedGradeId('all')
    setDateRange(undefined)
    setPage(1)
  }

  const renderStatusBadge = (status: StudentVerificationStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="warning" className="gap-1 font-medium">
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending Review
          </Badge>
        )
      case 'APPROVED':
        return (
          <Badge variant="success" className="gap-1 font-medium">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Approved
          </Badge>
        )
      case 'REJECTED':
        return (
          <Badge variant="destructive" className="gap-1 font-medium">
            <span className="size-1.5 rounded-full bg-destructive" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="flex flex-col text-foreground animate-fade-in pb-8">
      {/* Page Header */}
      <PageHeader
        title="Student Verifications"
        description="Review student identity card uploads, verify enrolled status, and assign grade access."
      />

      {/* Status Filter Tabs */}
      <Tabs
        value={statusTab}
        onValueChange={(val) => {
          setStatusTab(val)
          setPage(1)
        }}
        className="w-full"
      >
        <div className="border-b border-border mb-4">
          <TabsList
            variant="line"
            className="h-10 gap-2 sm:gap-6 bg-transparent p-0 overflow-x-auto no-scrollbar flex items-center"
          >
            {/* ALL */}
            <TabsTrigger
              value="ALL"
              className={cn(
                "relative h-10 px-2 sm:px-3 text-xs font-medium transition-all gap-2 cursor-pointer flex items-center select-none rounded-none border-b-2 border-x-0 border-t-0 border-transparent -mb-[1px]",
                "text-muted-foreground hover:text-foreground",
                "data-active:text-primary data-active:font-semibold data-active:border-b-primary data-active:border-x-transparent data-active:border-t-transparent"
              )}
            >
              <Inbox
                className={cn(
                  "size-4 transition-colors",
                  statusTab === 'ALL' ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <span>All Verifications</span>
              <span
                className={cn(
                  "ml-1 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors",
                  statusTab === 'ALL'
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {stats.total}
              </span>
            </TabsTrigger>

            {/* PENDING */}
            <TabsTrigger
              value="PENDING"
              className={cn(
                "relative h-10 px-2 sm:px-3 text-xs font-medium transition-all gap-2 cursor-pointer flex items-center select-none rounded-none border-b-2 border-x-0 border-t-0 border-transparent -mb-[1px]",
                "text-muted-foreground hover:text-foreground",
                "data-active:text-primary data-active:font-semibold data-active:border-b-primary data-active:border-x-transparent data-active:border-t-transparent"
              )}
            >
              <Clock
                className={cn(
                  "size-4 transition-colors",
                  statusTab === 'PENDING' ? 'text-amber-500' : 'text-amber-500/70'
                )}
              />
              <span>Pending Review</span>
              {stats.pending > 0 ? (
                <span className="ml-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {stats.pending}
                </span>
              ) : (
                <span
                  className={cn(
                    "ml-1 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors",
                    statusTab === 'PENDING'
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  0
                </span>
              )}
            </TabsTrigger>

            {/* APPROVED */}
            <TabsTrigger
              value="APPROVED"
              className={cn(
                "relative h-10 px-2 sm:px-3 text-xs font-medium transition-all gap-2 cursor-pointer flex items-center select-none rounded-none border-b-2 border-x-0 border-t-0 border-transparent -mb-[1px]",
                "text-muted-foreground hover:text-foreground",
                "data-active:text-primary data-active:font-semibold data-active:border-b-primary data-active:border-x-transparent data-active:border-t-transparent"
              )}
            >
              <CheckCircle2
                className={cn(
                  "size-4 transition-colors",
                  statusTab === 'APPROVED' ? 'text-emerald-500' : 'text-emerald-500/70'
                )}
              />
              <span>Approved</span>
              {stats.approved > 0 ? (
                <span className="ml-1 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                  {stats.approved}
                </span>
              ) : (
                <span
                  className={cn(
                    "ml-1 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors",
                    statusTab === 'APPROVED'
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  0
                </span>
              )}
            </TabsTrigger>

            {/* REJECTED */}
            <TabsTrigger
              value="REJECTED"
              className={cn(
                "relative h-10 px-2 sm:px-3 text-xs font-medium transition-all gap-2 cursor-pointer flex items-center select-none rounded-none border-b-2 border-x-0 border-t-0 border-transparent -mb-[1px]",
                "text-muted-foreground hover:text-foreground",
                "data-active:text-primary data-active:font-semibold data-active:border-b-primary data-active:border-x-transparent data-active:border-t-transparent"
              )}
            >
              <XCircle
                className={cn(
                  "size-4 transition-colors",
                  statusTab === 'REJECTED' ? 'text-rose-500' : 'text-rose-500/70'
                )}
              />
              <span>Rejected</span>
              {stats.rejected > 0 ? (
                <span className="ml-1 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-destructive/10 text-destructive border border-destructive/25">
                  {stats.rejected}
                </span>
              ) : (
                <span
                  className={cn(
                    "ml-1 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors",
                    statusTab === 'REJECTED'
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  0
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      {/* Main Content Card */}
      <Card className="py-0">

        {/* Unified TableToolbar */}
        <TableToolbar
          searchPlaceholder="Search by student name or user email..."
          searchValue={search}
          onSearchChange={(val) => {
            setSearch(val)
            setPage(1)
          }}
          onSearchClear={() => {
            setSearch('')
            setPage(1)
          }}
          onRefresh={() => {
            refetch().then(() => {
              toast.success('Student verifications refreshed')
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
                  setPage(1)
                }}
                sortable="asc"
                placeholder="All Grades"
                searchPlaceholder="Search grade..."
                triggerClassName="w-[150px] h-9 text-xs"
              />

              {/* Submitted At Date Range Filter */}
              <DateRangeFilter
                value={dateRange}
                onChange={(newRange) => {
                  setDateRange(newRange)
                  setPage(1)
                }}
              />

              {/* Reset active filters CTA */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                >
                  <RotateCcw className="size-3" />
                  Reset
                </Button>
              )}
            </>
          }
        />

        {/* Table Content */}
        <CardContent className="p-0">
          <div className="relative w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[80px]">ID Card</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>User Account</TableHead>
                  <TableHead>Target Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead className="text-right w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  // Loading Skeletons
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="pl-5">
                        <Skeleton className="size-10 rounded-md" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Skeleton className="size-8 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Skeleton className="h-3.5 w-20" />
                          <Skeleton className="h-3 w-14" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-5">
                        <div className="flex justify-end gap-1">
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
                ) : items.length === 0 ? (
                  <TableEmptyStateRow
                    colSpan={7}
                    variant={hasActiveFilters ? 'search' : 'empty'}
                    title={
                      hasActiveFilters
                        ? 'No verifications match your filters'
                        : statusTab === 'PENDING'
                        ? 'No pending verifications to review'
                        : 'No student verification requests found'
                    }
                    description={
                      hasActiveFilters
                        ? 'Try adjusting your search keywords, grade selection, or date range.'
                        : statusTab === 'PENDING'
                        ? 'The verification queue is clear. All student submissions have been processed.'
                        : 'When students upload their ID cards for exam verification, requests will appear here.'
                    }
                    action={
                      hasActiveFilters ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleResetFilters}
                          className="mt-2"
                        >
                          <RotateCcw className="mr-1.5 size-3.5" />
                          Clear Filters
                        </Button>
                      ) : undefined
                    }
                  />
                ) : (
                  items.map((item) => {
                    const { date, time } = formatDateTime(item.created_at)

                    return (
                      <TableRow key={item.id} className="group">
                        {/* ID Card Thumbnail */}
                        <TableCell className="pl-5">
                          <button
                            type="button"
                            onClick={() => handleOpenLightbox(item)}
                            className="relative size-10 rounded-lg overflow-hidden border border-border/80 bg-muted hover:border-primary/60 transition-all hover:scale-105 group/thumb flex items-center justify-center cursor-pointer"
                            title="Click to view ID card"
                          >
                            {item.student_id_card_url ? (
                              <img
                                src={item.student_id_card_url}
                                alt={item.full_name}
                                className="size-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <ImageIcon className="size-4 text-muted-foreground" />
                            )}
                            <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity text-white">
                              <Eye className="size-3.5" />
                            </div>
                          </button>
                        </TableCell>

                        {/* Student Full Name */}
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground text-xs">
                              {item.full_name}
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground">
                              ID: {item.id.slice(0, 8)}...
                            </span>
                          </div>
                        </TableCell>

                        {/* User Account Column with Standard Avatar */}
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              name={item.user?.name || item.full_name}
                              className="size-7 text-[10px] font-semibold shrink-0"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium text-xs text-foreground truncate">
                                {item.user?.name || 'Unknown User'}
                              </span>
                              <span className="text-[11px] text-muted-foreground truncate">
                                {item.user?.email || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Target Grade */}
                        <TableCell>
                          <Badge variant="outline" className="gap-1 font-medium text-xs py-0.5">
                            <GraduationCap className="size-3 text-primary" />
                            {item.grade?.name_en || item.grade?.name_kh || 'Unassigned'}
                          </Badge>
                        </TableCell>

                        {/* Status Column */}
                        <TableCell>
                          <div className="flex flex-col gap-1 items-start">
                            {renderStatusBadge(item.status)}
                            {item.status === 'REJECTED' && item.reject_reason && (
                              <div
                                className="flex items-center gap-1 text-[11px] text-muted-foreground max-w-xs truncate"
                                title={item.reject_reason}
                              >
                                <AlertCircle className="size-3 text-destructive shrink-0" />
                                <span className="truncate">{item.reject_reason}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Submitted At: Formatted Date & Time */}
                        <TableCell className="whitespace-nowrap">
                          <div
                            className="flex flex-col"
                            title={date && time ? `${date} at ${time}` : undefined}
                          >
                            <span className="text-xs font-medium text-foreground">{date}</span>
                            {time && (
                              <span className="text-[11px] text-muted-foreground font-mono">
                                {time}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Actions Column with ActionButton */}
                        <TableCell className="text-right pr-5">
                          <div className="flex items-center justify-end gap-1">
                            {/* Preview Card */}
                            <ActionButton
                              actionType="view"
                              tooltip="Preview Student ID Card"
                              onClick={() => handleOpenLightbox(item)}
                            />

                            {/* Quick Actions for PENDING status */}
                            {item.status === 'PENDING' && (
                              <>
                                <ActionButton
                                  actionType="edit"
                                  icon={Check}
                                  tooltip="Approve Verification"
                                  className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400 dark:hover:text-emerald-300"
                                  onClick={() => handleOpenApprove(item)}
                                  disabled={approveMutation.isPending}
                                />

                                <ActionButton
                                  actionType="delete"
                                  icon={X}
                                  tooltip="Reject Verification"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleOpenReject(item)}
                                  disabled={rejectMutation.isPending}
                                />
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!isLoading && items.length > 0 && (
              <DataTablePagination
                currentPage={page}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={limit}
                onPageChange={(newPage) => setPage(newPage)}
                entityLabel="student verifications"
              />
          )}
        </CardContent>
      </Card>

      {/* Lightbox Modal */}
      {previewItem && (
        <StudentIdCardLightbox
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          studentName={previewItem.full_name}
          imageUrl={previewItem.student_id_card_url}
          gradeName={previewItem.grade?.name_en || previewItem.grade?.name_kh}
        />
      )}

      {/* Approve Confirmation Modal */}
      <ApproveVerificationModal
        open={approveOpen}
        onOpenChange={setApproveOpen}
        item={approveItem}
        onConfirm={handleConfirmApprove}
        isLoading={approveMutation.isPending}
      />

      {/* Reject Modal */}
      <RejectVerificationModal
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        item={rejectItem}
        onConfirm={handleConfirmReject}
        isLoading={rejectMutation.isPending}
      />
    </div>
  )
}
