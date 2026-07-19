import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useLearningPathQuery,
  useCreateNodeMutation,
  useUpdateNodeMutation,
  useDeleteNodeMutation,
  useSyncNodeQuestionsMutation,
} from '../_hooks/useLearningPath'
import { useQuestionsQuery } from '../../_question/_hooks/useQuestion'
import type { LearningPathItem, LearningPathNodeItem } from '../_types/learningpath.types'
import {
  Loader2,
  Plus,
  Trash2,
  Lock,
  CheckCircle2,
  Award,
  Sparkles,
  BookOpen,
  Trophy,
  Zap,
  FileQuestion,
} from 'lucide-react'
import { toast } from 'sonner'

interface PathBuilderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  learningPath: LearningPathItem | null
}

export function PathBuilderDialog({ open, onOpenChange, learningPath }: PathBuilderDialogProps) {
  const { data: pathResponse, isLoading, refetch } = useLearningPathQuery(learningPath?.id || '', open && !!learningPath)
  const fullPath = pathResponse?.data || learningPath

  const [activeNode, setActiveNode] = useState<LearningPathNodeItem | null>(null)
  const [nodeDialogOpen, setNodeDialogOpen] = useState(false)
  const [questionModalOpen, setQuestionModalOpen] = useState(false)

  // Node form states
  const [titleEn, setTitleEn] = useState('')
  const [titleKh, setTitleKh] = useState('')
  const [nodeType, setNodeType] = useState<'LESSON' | 'CHECKPOINT' | 'CHALLENGE'>('LESSON')
  const [passScore, setPassScore] = useState<number>(70)
  const [allowSkip, setAllowSkip] = useState<boolean>(false)
  const [xpReward, setXpReward] = useState<number>(50)

  // Mutations
  const createNodeMutation = useCreateNodeMutation()
  const updateNodeMutation = useUpdateNodeMutation()
  const deleteNodeMutation = useDeleteNodeMutation()
  const syncQuestionsMutation = useSyncNodeQuestionsMutation()

  // Questions from Bank for selected category & grade
  const { data: bankQuestionsResponse, isLoading: questionsLoading } = useQuestionsQuery(
    1,
    100,
    '',
    fullPath?.category_id,
    fullPath?.grade_id
  )
  const bankQuestions = bankQuestionsResponse?.data || []
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([])

  const nodes = (fullPath?.nodes || []).slice().sort((a, b) => a.sequence_order - b.sequence_order)

  const handleOpenAddNode = () => {
    setActiveNode(null)
    setTitleEn('')
    setTitleKh('')
    setNodeType('LESSON')
    setPassScore(70)
    setAllowSkip(false)
    setXpReward(50)
    setNodeDialogOpen(true)
  }

  const handleOpenEditNode = (node: LearningPathNodeItem) => {
    setActiveNode(node)
    setTitleEn(node.title_en)
    setTitleKh(node.title_kh)
    setNodeType(node.node_type)
    setPassScore(node.pass_score_percentage)
    setAllowSkip(node.allow_skip)
    setXpReward(node.xp_reward)
    setNodeDialogOpen(true)
  }

  const handleSaveNode = () => {
    if (!fullPath) return
    if (!titleEn.trim() || !titleKh.trim()) {
      toast.error('Both English and Khmer titles are required')
      return
    }

    if (activeNode) {
      updateNodeMutation.mutate(
        {
          nodeId: activeNode.id,
          data: {
            titleEn: titleEn.trim(),
            titleKh: titleKh.trim(),
            nodeType,
            passScorePercentage: passScore,
            allowSkip,
            xpReward,
          },
        },
        {
          onSuccess: (res) => {
            if (res.success) {
              setNodeDialogOpen(false)
              refetch()
            }
          },
        }
      )
    } else {
      createNodeMutation.mutate(
        {
          pathId: fullPath.id,
          data: {
            titleEn: titleEn.trim(),
            titleKh: titleKh.trim(),
            sequenceOrder: nodes.length + 1,
            nodeType,
            passScorePercentage: passScore,
            allowSkip,
            xpReward,
          },
        },
        {
          onSuccess: (res) => {
            if (res.success) {
              setNodeDialogOpen(false)
              refetch()
            }
          },
        }
      )
    }
  }

  const handleDeleteNode = (nodeId: string) => {
    deleteNodeMutation.mutate(nodeId, {
      onSuccess: () => refetch(),
    })
  }

  const handleOpenQuestionSelector = (node: LearningPathNodeItem) => {
    setActiveNode(node)
    const existingQIds = (node.node_questions || []).map((nq) => nq.question_id)
    setSelectedQuestionIds(existingQIds)
    setQuestionModalOpen(true)
  }

  const toggleQuestionSelection = (qId: string) => {
    if (selectedQuestionIds.includes(qId)) {
      setSelectedQuestionIds(selectedQuestionIds.filter((id) => id !== qId))
    } else {
      setSelectedQuestionIds([...selectedQuestionIds, qId])
    }
  }

  const handleSaveNodeQuestions = () => {
    if (!activeNode) return
    syncQuestionsMutation.mutate(
      { nodeId: activeNode.id, questionIds: selectedQuestionIds },
      {
        onSuccess: (res) => {
          if (res.success) {
            setQuestionModalOpen(false)
            refetch()
          }
        },
      }
    )
  }

  const getNodeBadgeColor = (type: string) => {
    switch (type) {
      case 'CHECKPOINT':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
      case 'CHALLENGE':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
      default:
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    }
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'CHECKPOINT':
        return <Sparkles className="h-5 w-5 text-amber-500" />
      case 'CHALLENGE':
        return <Trophy className="h-5 w-5 text-rose-500" />
      default:
        return <BookOpen className="h-5 w-5 text-emerald-500" />
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] w-[95vw] max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-5 pb-4 border-b shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                   Journey Builder: {fullPath?.title_en}
                </DialogTitle>
                <DialogDescription className="text-xs mt-1">
                  Sequential unlock roadmap. Students must complete Node 1 to unlock Node 2.
                </DialogDescription>
              </div>
              <Button onClick={handleOpenAddNode} size="sm" className="text-xs h-8 gap-1">
                <Plus className="h-3.5 w-3.5" /> Add Path Node
              </Button>
            </div>
          </DialogHeader>

          {/* Stepper Viewport */}
          <div className="flex-1 min-h-0 w-full p-6 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-xs">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading path nodes...
              </div>
            ) : nodes.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <Zap className="h-10 w-10  mx-auto" />
                <p className="text-xs font-semibold ">No nodes added to this learning path yet.</p>
                <Button onClick={handleOpenAddNode} variant="outline" size="sm" className="text-xs">
                  Create First Lesson Node
                </Button>
              </div>
            ) : (
              <div className="max-w-xl mx-auto space-y-6 relative">
                {/* Visual Connection Line */}
                <div className="absolute left-6 top-8 bottom-8 w-1  rounded-full -z-0" />

                {nodes.map((node, index) => {
                  const qCount = node.node_questions?.length || 0
                  return (
                    <div
                      key={node.id}
                      className="relative z-10 flex items-start gap-4 p-4 rounded-xl border transition-all"
                    >
                      {/* Circle Stepper Icon */}
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border ${getNodeBadgeColor(node.node_type)}`}>
                        {getNodeIcon(node.node_type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider">
                            Node #{index + 1}
                          </span>
                          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 uppercase ${getNodeBadgeColor(node.node_type)}`}>
                            {node.node_type}
                          </Badge>
                          {index > 0 && (
                            <Badge variant="secondary" className="text-[9px] gap-1 px-1.5 py-0">
                              <Lock className="h-2.5 w-2.5" /> Required Node #{index}
                            </Badge>
                          )}
                        </div>

                        <h4 className="text-sm font-bold">{node.title_en}</h4>
                        <p className="text-xs">{node.title_kh}</p>

                        {/* Config stats bar */}
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px]">
                          <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                            <Award className="h-3.5 w-3.5" /> {node.xp_reward} XP
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Pass: {node.pass_score_percentage}%
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            {node.allow_skip ? (
                              <Badge variant="success" className="text-[9px]">Skip Allowed</Badge>
                            ) : (
                              <Badge variant="warning" className="text-[9px]">Strict Sequential</Badge>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Right Action buttons */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenQuestionSelector(node)}
                          className="h-9 text-[11px] gap-1"
                        >
                          <FileQuestion className="h-3.5 w-3.5 text-primary" /> {qCount} Question{qCount === 1 ? '' : 's'}
                        </Button>

                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditNode(node)}
                            className="h-8 text-[10px]"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNode(node.id)}
                            className="h-8 text-[10px] text-rose-500 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <DialogFooter className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="h-8 text-xs">
              Close Stepper Builder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CREATE / EDIT NODE DIALOG */}
      <Dialog open={nodeDialogOpen} onOpenChange={setNodeDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">
              {activeNode ? 'Modify Path Node Config' : 'Add New Sequential Path Node'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Node English Title <span className="text-rose-500">*</span></Label>
              <Input
                placeholder="e.g. Unit 1: Introduction to Grammar"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="h-9.5 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Node Khmer Title <span className="text-rose-500">*</span></Label>
              <Input
                placeholder="e.g. មេរៀនទី១៖ វេយ្យាករណ៍ដំបូង"
                value={titleKh}
                onChange={(e) => setTitleKh(e.target.value)}
                className="h-9.5 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Node Type</Label>
                <Select value={nodeType} onValueChange={(val: any) => setNodeType(val)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LESSON">Lesson</SelectItem>
                    <SelectItem value="CHECKPOINT">Checkpoint</SelectItem>
                    <SelectItem value="CHALLENGE">Challenge</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">XP Reward</Label>
                <Input
                  type="number"
                  min={0}
                  value={xpReward}
                  onChange={(e) => setXpReward(Number(e.target.value))}
                  className="h-9.5 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Pass Score (% Required)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={passScore}
                  onChange={(e) => setPassScore(Number(e.target.value))}
                  className="h-9.5 text-xs"
                />
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <div className="flex items-center justify-between p-2 rounded-md border bg-muted h-9.5">
                  <Label className="text-[11px] font-medium cursor-pointer">Allow Skip</Label>
                  <Switch checked={allowSkip} onCheckedChange={setAllowSkip} />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t shrink-0">
            <Button variant="outline" size="sm" onClick={() => setNodeDialogOpen(false)} className="h-9! text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveNode} className="h-9! text-xs">
              Save Node
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SELECT QUESTIONS FROM BANK FOR NODE */}
      <Dialog open={questionModalOpen} onOpenChange={setQuestionModalOpen}>
        <DialogContent className="sm:max-w-[640px] max-h-[85vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-3 border-b shrink-0">
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <FileQuestion className="h-4 w-4 text-primary" />
              Attach Questions from Bank: {activeNode?.title_en}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Select questions from the Question Bank under this path's category to include in this lesson node.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 p-6 overflow-y-auto">
            {questionsLoading ? (
              <div className="flex justify-center py-8 text-xs text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading Question Bank...
              </div>
            ) : bankQuestions.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No questions found in Question Bank for this category/grade. Please create questions first.
              </div>
            ) : (
              <div className="space-y-2">
                {bankQuestions.map((q) => {
                  const isChecked = selectedQuestionIds.includes(q.id)
                  return (
                    <div
                      key={q.id}
                      onClick={() => toggleQuestionSelection(q.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-primary/5 border-primary/30'
                          : 'bg-background hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleQuestionSelection(q.id)}
                          className="h-4 w-4 accent-primary"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-semibold block truncate">
                            {q.question_text_en.replace(/<[^>]*>/g, '')}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {q.question_text_kh.replace(/<[^>]*>/g, '')}
                          </span>
                        </div>
                      </div>

                      <Badge variant="secondary" className="text-[9px] uppercase font-bold shrink-0">
                        {q.question_type}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <DialogFooter className="p-4 border-t shrink-0">
            <Button variant="outline" size="sm" onClick={() => setQuestionModalOpen(false)} className="h-8 text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveNodeQuestions} className="h-8 text-xs">
              Save Questions ({selectedQuestionIds.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
