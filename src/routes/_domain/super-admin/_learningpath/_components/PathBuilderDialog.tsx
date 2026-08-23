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
import { Badge } from '@/components/ui/badge'
import {
  useLearningPathQuery,
  useSyncQuizPackagesMutation,
} from '../_hooks/useLearningPath'
import { Checkbox } from '@/components/ui/checkbox'
import { ConfirmationModal } from '@/components/ui/shared'
import { useQuizPackagesQuery } from '../../_quizpack/_hooks/useQuizpack'
import type { LearningPathItem } from '../_types/learningpath.types'
import type { QuizPackageItem } from '../../_quizpack/_types/quizpack.types'
import {
  Loader2,
  Plus,
  Trash2,
  Lock,
  Zap,
  Package,
} from 'lucide-react'

interface PathBuilderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  learningPath: LearningPathItem | null
}

export function PathBuilderDialog({ open, onOpenChange, learningPath }: PathBuilderDialogProps) {
  const { data: pathResponse, isLoading, refetch } = useLearningPathQuery(learningPath?.id || '', open && !!learningPath)
  const fullPath = pathResponse?.data || learningPath

  const [packageModalOpen, setPackageModalOpen] = useState(false)
  const [packageToDetach, setPackageToDetach] = useState<QuizPackageItem | null>(null)
  const [detachConfirmOpen, setDetachConfirmOpen] = useState(false)

  // Attached packages list
  const attachedPackages = fullPath?.quiz_packages || fullPath?.quizPackages || []
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([])

  // Quiz Packages for selection
  const { data: quizPackagesResponse, isLoading: packagesLoading } = useQuizPackagesQuery(
    1,
    100,
    '',
    fullPath?.category_id
  )
  const allQuizPackages = quizPackagesResponse?.data || []

  // Mutation
  const syncPackagesMutation = useSyncQuizPackagesMutation()

  const handleOpenPackageSelector = () => {
    setSelectedPackageIds(attachedPackages.map((p) => p.id))
    setPackageModalOpen(true)
  }

  const togglePackageSelection = (pkgId: string) => {
    if (selectedPackageIds.includes(pkgId)) {
      setSelectedPackageIds(selectedPackageIds.filter((id) => id !== pkgId))
    } else {
      setSelectedPackageIds([...selectedPackageIds, pkgId])
    }
  }

  const handleSavePackages = () => {
    if (!fullPath) return
    syncPackagesMutation.mutate(
      { id: fullPath.id, packageIds: selectedPackageIds },
      {
        onSuccess: (res) => {
          if (res.success) {
            setPackageModalOpen(false)
            refetch()
          }
        },
      }
    )
  }

  const handleOpenDetachConfirmation = (pkg: QuizPackageItem) => {
    setPackageToDetach(pkg)
    setDetachConfirmOpen(true)
  }

  const handleConfirmDetach = () => {
    if (!fullPath || !packageToDetach) return
    const updatedIds = attachedPackages.filter((p) => p.id !== packageToDetach.id).map((p) => p.id)
    syncPackagesMutation.mutate(
      { id: fullPath.id, packageIds: updatedIds },
      {
        onSuccess: (res) => {
          if (res.success) {
            setDetachConfirmOpen(false)
            setPackageToDetach(null)
            refetch()
          }
        },
      }
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] w-[95vw] max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-5 pb-4 border-b shrink-0">
            <div className="flex items-center justify-between pr-4">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Journey Roadmap: {fullPath?.title_en}
                </DialogTitle>
                <DialogDescription className="text-xs mt-1">
                  Attached Quiz Packages form the step-by-step roadmap sequence for students.
                </DialogDescription>
              </div>
              <Button onClick={handleOpenPackageSelector} className="text-xs !h-8 gap-1">
                <Plus className="h-3.5 w-3.5" /> Attach Quiz Packages ({attachedPackages.length})
              </Button>
            </div>
          </DialogHeader>

          {/* Stepper Viewport */}
          <div className="flex-1 min-h-0 w-full p-6 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-xs text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading roadmap steps...
              </div>
            ) : attachedPackages.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <Package className="h-10 w-10 text-muted-foreground mx-auto" />
                <p className="text-xs font-semibold text-muted-foreground">
                  No Quiz Packages attached to this learning path roadmap yet.
                </p>
                <Button onClick={handleOpenPackageSelector} variant="outline" size="sm" className="text-xs">
                  Select Quiz Packages to Attach
                </Button>
              </div>
            ) : (
              <div className="max-w-xl mx-auto space-y-6 relative">
                {/* Visual Connection Line */}
                <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-muted rounded-full -z-0" />

                {attachedPackages.map((pkg, index) => {
                  const qCount = pkg.questions?.length || pkg.package_questions?.length || pkg.questions_per_session || (pkg as any).questionsPerSession || 0
                  return (
                    <div
                      key={pkg.id}
                      className="relative z-10 flex items-start gap-4 p-4 rounded-xl border bg-card transition-all"
                    >


                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                            Step #{index + 1}
                          </span>
                          <Badge variant={pkg.is_free ? 'success' : 'secondary'} className="text-[9px] px-1.5 py-0 uppercase font-bold">
                            {pkg.is_free ? 'Free' : `${pkg.price_coins} Coins`}
                          </Badge>
                          {index > 0 && (
                            <Badge variant="secondary" className="text-[9px] gap-1 px-1.5 py-0">
                              <Lock className="h-2.5 w-2.5" /> Requires Step #{index}
                            </Badge>
                          )}
                        </div>

                        <h4 className="text-sm font-bold">{pkg.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{pkg.description || 'No description provided'}</p>

                        {/* Config stats bar */}
                        <div className="flex items-center gap-3 mt-3 text-[11px]">
                          <span className="font-semibold text-muted-foreground">
                            {qCount} Question{qCount === 1 ? '' : 's'} per session
                          </span>
                        </div>
                      </div>

                      {/* Right Detach Button */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetachConfirmation(pkg)}
                          disabled={syncPackagesMutation.isPending}
                          className="!h-7 text-[11px] text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Detach
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <DialogFooter className="p-4 border-t shrink-0">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="h-8 text-xs">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SELECT QUIZ PACKAGES FOR LEARNING PATH */}
      <Dialog open={packageModalOpen} onOpenChange={setPackageModalOpen}>
        <DialogContent className="sm:max-w-[640px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-3 border-b shrink-0">
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Attach Quiz Packages to Learning Path
            </DialogTitle>
            <DialogDescription className="text-xs">
              Select practice or exam Quiz Packages from the category to attach as sequential roadmap steps.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 p-6 overflow-y-auto custom-scrollbar">
            {packagesLoading ? (
              <div className="flex justify-center py-8 text-xs text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading Quiz Packages...
              </div>
            ) : allQuizPackages.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No Quiz Packages found for this category. Please create Quiz Packages in Super Admin &gt; Quiz Packages first.
              </div>
            ) : (
              <div className="space-y-2">
                {allQuizPackages.map((pkg) => {
                  const isChecked = selectedPackageIds.includes(pkg.id)
                  const qCount = pkg.questions?.length || pkg.package_questions?.length || pkg.questions_per_session || (pkg as any).questionsPerSession || 0
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => togglePackageSelection(pkg.id)}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-primary/5 border-primary/30'
                          : 'bg-background hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => togglePackageSelection(pkg.id)}
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-semibold block truncate">
                            {pkg.title}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                            {pkg.description || 'No description provided'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-[10px]">
                          {qCount} Question{qCount === 1 ? '' : 's'}
                        </Badge>
                        <Badge variant={pkg.is_free ? 'success' : 'secondary'} className="text-[9px] uppercase font-bold">
                          {pkg.is_free ? 'Free' : `${pkg.price_coins} Coins`}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <DialogFooter className="p-4 border-t shrink-0">
            <Button variant="outline" onClick={() => setPackageModalOpen(false)} className="h-8 text-xs">
              Cancel
            </Button>
            <Button onClick={handleSavePackages} disabled={syncPackagesMutation.isPending} className="h-8 text-xs">
              {syncPackagesMutation.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Save Attached Packages ({selectedPackageIds.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DETACH QUIZ PACKAGE CONFIRMATION MODAL */}
      <ConfirmationModal
        open={detachConfirmOpen}
        onOpenChange={setDetachConfirmOpen}
        variant="warning"
        title="Detach Quiz Package?"
        description={
          <>
            Are you sure you want to detach <span className="font-semibold text-foreground">"{packageToDetach?.title}"</span> from this learning path roadmap? Students will no longer see this package in the roadmap sequence.
          </>
        }
        confirmText="Detach Package"
        onConfirm={handleConfirmDetach}
        isPending={syncPackagesMutation.isPending}
      />
    </>
  )
}
