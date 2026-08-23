import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuestionQuery } from '../_hooks/useQuestion'
import {
  Award,
  Clock,
  AlertCircle,
  Tag,
  Gauge,
  Activity,
  Check,
  ArrowRight,
} from 'lucide-react'

import type { QuestionItem } from '../_types/question.types'

interface QuestionDetailDialogProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  setOpen?: (open: boolean) => void
  questionId?: string | null
  question?: QuestionItem | null
}

export function QuestionDetailDialog({
  open,
  onOpenChange: propOnOpenChange,
  setOpen: propSetOpen,
  questionId: propQuestionId,
  question: propQuestion,
}: QuestionDetailDialogProps) {
  const onOpenChange = propOnOpenChange || propSetOpen || (() => {})
  const targetId = propQuestionId || propQuestion?.id || null
  const { data: response, isLoading, isError, refetch } = useQuestionQuery(targetId || '', open && !!targetId)
  const question = response?.data || propQuestion

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return <Badge className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10">Easy</Badge>
      case 'MEDIUM':
        return <Badge className="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-500/10">Medium</Badge>
      case 'HARD':
        return <Badge className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-500/10">Hard</Badge>
      default:
        return <Badge variant="outline">{difficulty}</Badge>
    }
  }

  const getQuestionTypeBadge = (type: string) => {
    return (
      <Badge variant="secondary" className="font-bold text-[10px] uppercase bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
        {type}
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] md:max-w-[900px] w-[95vw] h-[88vh] max-h-[90vh] text-slate-900 dark:text-slate-50 !flex !flex-col !p-0 !gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 space-y-1.5 shrink-0 border-b">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-base font-bold">
              Question Details & Validation
            </DialogTitle>
            {question && (
              <div className="flex items-center gap-1.5 ml-2">
                {getQuestionTypeBadge(question.question_type)}
                {getDifficultyBadge(question.difficulty_level)}
              </div>
            )}
          </div>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Read-only metadata parameters, interactive rendering, and answer grading specifications.
          </DialogDescription>
        </DialogHeader>

        {/* Main Body Viewport */}
        <div className="flex-1 min-h-0 w-full overflow-hidden">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-12 h-full min-h-0">
              {/* Left Column Skeleton */}
              <div className="md:col-span-4 p-6 space-y-5 md:border-r border-slate-100 dark:border-slate-800">
                <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-9 w-full" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-9 w-full" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-9 w-full" /></div>
                <div className="space-y-2"><Skeleton className="h-10 w-full rounded-lg" /></div>
              </div>
              {/* Right Column Skeleton */}
              <div className="md:col-span-8 p-6 space-y-6 overflow-y-auto custom-scrollbar h-full">
                <div className="space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-20 w-full" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-24 w-full" /></div>
              </div>
            </div>
          ) : isError || !question ? (
            <div className="p-12 text-center text-slate-500 space-y-4">
              <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
              <p className="text-xs font-semibold">Failed to fetch the question details from the server.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs">
                Retry Connection
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 h-full min-h-0 overflow-hidden">

              {/* Left Column: Fixed Info parameters list */}
              <div className="md:col-span-4 p-6 space-y-4 md:border-r overflow-y-auto custom-scrollbar h-full">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Question Parameters</h4>

                {/* Category */}
                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10 flex items-start gap-2.5">
                  <Tag className="h-4 w-4 text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Category Link</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {question.category?.name_en || (question.category as any)?.nameEn || '-'}
                    </span>
                    {(question.category?.name_kh || (question.category as any)?.nameKh) && (
                      <span className="text-[10px] text-slate-400 font-normal block mt-0.5">
                        {question.category?.name_kh || (question.category as any)?.nameKh}
                      </span>
                    )}
                  </div>
                </div>

                {/* Grade linkage */}
                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10 flex items-start gap-2.5">
                  <Gauge className="h-4 w-4 text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Grade Level</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {question.grade?.name_en || (question.grade as any)?.nameEn || '-'}
                    </span>
                    {(question.grade?.name_kh || (question.grade as any)?.nameKh) && (
                      <span className="text-[10px] text-slate-400 font-normal block mt-0.5">
                        {question.grade?.name_kh || (question.grade as any)?.nameKh}
                      </span>
                    )}
                  </div>
                </div>

                {/* XP Reward Value */}
                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10 flex items-start gap-2.5">
                  <Award className="h-4 w-4 text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">XP Reward Value</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {question.xp_value} XP Points
                    </span>
                  </div>
                </div>

                {/* Time Limit */}
                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10 flex items-start gap-2.5">
                  <Clock className="h-4 w-4 text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Timer Limit</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {question.time_limit_seconds ? `${question.time_limit_seconds} Seconds` : 'No Timer Limit'}
                    </span>
                  </div>
                </div>

                {/* Active Status */}
                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10 flex items-start gap-2.5">
                  <Activity className="h-4 w-4 text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Active Status</span>
                    <span className="mt-1 block">
                      {question.is_active ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10 border-0 h-5 text-[10px]">Active</Badge>
                      ) : (
                        <Badge className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/10 border-0 h-5 text-[10px]">Inactive</Badge>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Scrollable Question Content Rendering & Answer Key */}
              <div className="md:col-span-8 p-6 space-y-4 overflow-y-auto custom-scrollbar h-full">

                {/* Question Texts */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Question Context</h4>

                  {/* English Question */}
                  <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/10 dark:bg-slate-950/10">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">English translation</div>
                    <div
                      className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 prose dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: question.question_text_en }}
                    />
                  </div>

                  {/* Khmer Question */}
                  <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/10 dark:bg-slate-950/10">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Khmer translation</div>
                    <div
                      className="text-xs leading-relaxed text-slate-800 dark:text-slate-200"
                      dangerouslySetInnerHTML={{ __html: question.question_text_kh }}
                    />
                  </div>
                </div>

                {/* Answer Keys & Options Configuration */}
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b pb-2">
                    Answers Validation Keys
                  </h4>

                  {/* MCQ Options Check */}
                  {question.question_type === 'MCQ' && (
                    <div className="space-y-2">
                      {(question.content?.options || []).map((o: any, idx: number) => {
                        const isCorrect = String(o.id) === String(question.validation?.correct_option_id)
                        return (
                          <div
                            key={o.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border text-xs transition-colors ${isCorrect
                                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                : 'bg-background border-slate-100 dark:border-slate-800'
                              }`}
                          >
                            <span className="font-bold text-[10px] text-slate-400">Choice {idx + 1}</span>
                            <div className="flex-1">
                              <span className="font-medium">{o.text_en || o.textEn}</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">{o.text_kh || o.textKh}</span>
                            </div>
                            {isCorrect && <Check className="h-4 w-4 text-emerald-500 shrink-0" />}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Multi-Select Options Check */}
                  {question.question_type === 'MULTI_SELECT' && (
                    <div className="space-y-2">
                      {(question.content?.options || []).map((o: any, idx: number) => {
                        const correctIds = question.validation?.correct_option_ids || []
                        const isCorrect = correctIds.includes(o.id)
                        return (
                          <div
                            key={o.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border text-xs transition-colors ${isCorrect
                                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                : 'bg-background border-slate-100 dark:border-slate-800'
                              }`}
                          >
                            <span className="font-bold text-[10px] text-slate-400">Choice {idx + 1}</span>
                            <div className="flex-1">
                              <span className="font-medium">{o.text_en || o.textEn}</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">{o.text_kh || o.textKh}</span>
                            </div>
                            {isCorrect && <Check className="h-4 w-4 text-emerald-500 shrink-0" />}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* True / False Check */}
                  {question.question_type === 'TRUE_FALSE' && (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {[true, false].map((val) => {
                        const isCorrect = question.validation?.correct_answer === val
                        return (
                          <div
                            key={String(val)}
                            className={`p-3 rounded-lg border text-center font-semibold transition-colors ${isCorrect
                                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                : 'bg-background border-slate-100 dark:border-slate-800'
                              }`}
                          >
                            <div className="text-[9px] text-slate-400 uppercase tracking-wider">Choice</div>
                            <div className="mt-1 flex items-center justify-center gap-1.5">
                              {val ? 'True' : 'False'}
                              {isCorrect && <Check className="h-3.5 w-3.5" />}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Fill in the Blanks Check */}
                  {question.question_type === 'FILL_BLANK' && (
                    <div className="space-y-3">
                      {(question.validation?.correct_blanks || []).map((b: any, idx: number) => (
                        <div
                          key={b.id}
                          className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-background text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between border-b pb-1.5 border-slate-50 dark:border-slate-900">
                            <span className="font-bold text-[10px] text-slate-500 uppercase">Blank Target #{idx + 1}</span>
                            <Badge variant={b.is_case_sensitive ? 'default' : 'secondary'} className="text-[8px] h-4.5 px-1.5 uppercase font-semibold">
                              {b.is_case_sensitive ? 'Case Sensitive' : 'Insensitive'}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 block mb-1">Accepted answers list:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {(b.accepted_answers || b.acceptedAnswers || []).map((ans: string, aidx: number) => (
                                <Badge key={aidx} variant="outline" className="bg-emerald-500/5 border-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] py-0.5 px-2">
                                  {ans}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Matching Column Check */}
                  {question.question_type === 'MATCHING' && (
                    <div className="space-y-3 text-xs">
                      <div className="text-[10px] text-slate-400 font-semibold mb-1">Correct Match Pairs Configuration:</div>
                      <div className="flex flex-wrap gap-2">
                        {(question.validation?.correct_pairs || []).map((p: any, idx: number) => {
                          const leftItem = (question.content?.left_side || []).find((l: any) => l.id === p.left_id)
                          const rightItem = (question.content?.right_side || []).find((r: any) => r.id === p.right_id)
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-2 p-2 rounded-lg border border-emerald-500/15 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]"
                            >
                              <span>{leftItem?.text_en || leftItem?.textEn || '(Left)'}</span>
                              <ArrowRight className="h-3 w-3 shrink-0" />
                              <span>{rightItem?.text_en || rightItem?.textEn || '(Right)'}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Ordering Sequence Check */}
                  {question.question_type === 'ORDER' && (
                    <div className="space-y-2">
                      <div className="text-[10px] text-slate-400 font-semibold mb-1">Items in Correct Grading Sequence:</div>
                      {(question.validation?.correct_order || []).map((id: string, idx: number) => {
                        const item = (question.content?.items || []).find((i: any) => i.id === id)
                        return (
                          <div
                            key={id}
                            className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-background text-xs"
                          >
                            <Badge className="h-5 w-5 rounded-full flex items-center justify-center p-0 font-bold bg-emerald-500 text-white border-none shrink-0 text-[10px]">
                              {idx + 1}
                            </Badge>
                            <div className="flex-1">
                              <span className="font-semibold">{item?.text_en || item?.textEn}</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">{item?.text_kh || item?.textKh}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Explanations */}
                {(question.explanation_en || question.explanation_kh) && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Solution Explanation Hints</h4>

                    {question.explanation_en && (
                      <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/10 dark:bg-slate-950/10">
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">English Explanation</div>
                        <div
                          className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 prose dark:prose-invert"
                          dangerouslySetInnerHTML={{ __html: question.explanation_en }}
                        />
                      </div>
                    )}

                    {question.explanation_kh && (
                      <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/10 dark:bg-slate-950/10">
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Khmer Explanation</div>
                        <div
                          className="text-xs leading-relaxed text-slate-800 dark:text-slate-200"
                          dangerouslySetInnerHTML={{ __html: question.explanation_kh }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pb-3 pt-3 border-t bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="!h-9 text-xs"
          >
            Close Detail
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
