import { useState, useId, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCategoriesQuery } from '../../_category/_hooks/useCategory'
import { useGradesQuery } from '../../_grade/_hooks/useGrade'
import { useGradeCategoriesQuery } from '../../_grade/_hooks/useGradeCategory'
import { useImportQuestionsMutation } from '../_hooks/useQuestion'
import type { DifficultyEnum } from '../_types/question.types'
import { Download, UploadCloud, FileJson, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { SAMPLE_IMPORT_TEMPLATE } from './import/sampleTemplate.data'
import { parseAndValidateImportPayload } from './import/importValidation.util'
import { ImportPresetsCard } from './import/ImportPresetsCard'
import { ImportInputTabs } from './import/ImportInputTabs'
import { ImportPreviewTable } from './import/ImportPreviewTable'
import { ImportProgressResultView } from './import/ImportProgressResultView'

interface QuestionImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuestionImportDialog({ open, onOpenChange }: QuestionImportDialogProps) {
  const fileInputId = useId()
  const [step, setStep] = useState<'configure' | 'importing' | 'result'>('configure')
  const [activeTab, setActiveTab] = useState<'file' | 'raw'>('file')
  const [jsonText, setJsonText] = useState('')
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

  // Presets
  const [presetGradeId, setPresetGradeId] = useState<string>('')
  const [presetCategoryId, setPresetCategoryId] = useState<string>('')
  const [presetDifficulty, setPresetDifficulty] = useState<DifficultyEnum>('EASY')
  const [presetXpValue, setPresetXpValue] = useState<number>(10)
  const [presetTimeLimit, setPresetTimeLimit] = useState<string>('')
  const [overrideExisting, setOverrideExisting] = useState<boolean>(false)

  // Result Metrics
  const [totalSubmitted, setTotalSubmitted] = useState<number>(0)
  const [importedCount, setImportedCount] = useState<number>(0)
  const [skippedCount, setSkippedCount] = useState<number>(0)
  const [serverMessage, setServerMessage] = useState<string>('')

  // Queries & Mutations
  const { data: gradesResponse, isLoading: gradesLoading } = useGradesQuery(1, 100, '')
  const { data: allCategoriesResponse, isLoading: allCategoriesLoading } = useCategoriesQuery(1, 100, '', true)
  const { data: gradeCategoriesResponse, isLoading: gradeCategoriesLoading } = useGradeCategoriesQuery(presetGradeId, !!presetGradeId)

  const grades = gradesResponse?.data || []
  const allCategories = allCategoriesResponse?.data || []
  const availableCategories = presetGradeId && gradeCategoriesResponse?.data ? gradeCategoriesResponse.data : allCategories

  const importMutation = useImportQuestionsMutation()

  // Reset dialog state when closed or on reset
  const handleReset = () => {
    setStep('configure')
    setJsonText('')
    setSelectedFileName(null)
    setPresetGradeId('')
    setPresetCategoryId('')
    setPresetDifficulty('EASY')
    setPresetXpValue(10)
    setPresetTimeLimit('')
    setOverrideExisting(false)
    setTotalSubmitted(0)
    setImportedCount(0)
    setSkippedCount(0)
    setServerMessage('')
  }

  useEffect(() => {
    if (!open) handleReset()
  }, [open])

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.json')) {
      toast.error('Please upload a valid .json file')
      return
    }
    setSelectedFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => setJsonText((event.target?.result as string) || '')
    reader.readAsText(file)
  }

  // Download Sample Template
  const handleDownloadTemplate = () => {
    const jsonString = JSON.stringify(SAMPLE_IMPORT_TEMPLATE, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'questions_import_template.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('Sample JSON template downloaded')
  }

  // Parse & Validate
  const { parsedItems, validCount, duplicateCount, invalidCount } = parseAndValidateImportPayload(
    jsonText,
    presetGradeId,
    presetCategoryId,
    presetDifficulty,
    presetXpValue,
    presetTimeLimit,
    overrideExisting
  )

  // Submit Import
  const handleImportSubmit = () => {
    const validPayloads = parsedItems
      .filter((i) => i.isValid && i.processedPayload)
      .map((i) => i.processedPayload!)

    if (validPayloads.length === 0) {
      toast.error('No valid questions available to import')
      return
    }

    setTotalSubmitted(validPayloads.length)
    setStep('importing')

    importMutation.mutate(
      { questions: validPayloads },
      {
        onSuccess: (res) => {
          if (res.success) {
            const imported = res.data?.length || 0
            const skipped = validPayloads.length - imported
            setImportedCount(imported)
            setSkippedCount(skipped)
            setServerMessage(res.message || 'Import completed')
            setStep('result')
          } else {
            setStep('configure')
          }
        },
        onError: () => setStep('configure'),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[960px] md:max-w-[960px] w-[95vw] text-slate-900 dark:text-slate-50 border border-slate-100 dark:border-slate-800 shadow-xl max-h-[90vh] !flex !flex-col !p-0 !gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <FileJson className="h-5 w-5 text-primary" />
                Bulk Question Import
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Upload or paste JSON data to import questions into the database repository with live validation.
              </DialogDescription>
            </div>
            {step === 'configure' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                className="text-xs h-8 gap-1.5"
              >
                <Download className="h-3.5 w-3.5" /> Sample Template
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Body Container */}
        <div className="flex-1 min-h-0 w-full overflow-y-auto custom-scrollbar p-6">
          {step === 'configure' ? (
            <div className="space-y-6">
              <ImportPresetsCard
                grades={grades}
                categories={availableCategories}
                gradesLoading={gradesLoading}
                categoriesLoading={allCategoriesLoading || gradeCategoriesLoading}
                presetGradeId={presetGradeId}
                setPresetGradeId={setPresetGradeId}
                presetCategoryId={presetCategoryId}
                setPresetCategoryId={setPresetCategoryId}
                presetDifficulty={presetDifficulty}
                setPresetDifficulty={setPresetDifficulty}
                presetXpValue={presetXpValue}
                setPresetXpValue={setPresetXpValue}
                presetTimeLimit={presetTimeLimit}
                setPresetTimeLimit={setPresetTimeLimit}
                overrideExisting={overrideExisting}
                setOverrideExisting={setOverrideExisting}
              />

              <ImportInputTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                jsonText={jsonText}
                setJsonText={setJsonText}
                selectedFileName={selectedFileName}
                fileInputId={fileInputId}
                handleFileUpload={handleFileUpload}
              />

              <Separator />

              <ImportPreviewTable
                parsedItems={parsedItems}
                validCount={validCount}
                duplicateCount={duplicateCount}
                invalidCount={invalidCount}
                presetDifficulty={presetDifficulty}
              />
            </div>
          ) : (
            <ImportProgressResultView
              step={step}
              totalSubmitted={totalSubmitted}
              importedCount={importedCount}
              skippedCount={skippedCount}
              serverMessage={serverMessage}
              onDone={() => onOpenChange(false)}
              onReset={handleReset}
            />
          )}
        </div>

        {/* Footer (Only shown during configure step) */}
        {step === 'configure' && (
          <DialogFooter className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="!h-9 text-xs"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleImportSubmit}
              disabled={validCount === 0 || importMutation.isPending}
              className="!h-9 text-xs gap-1.5"
            >
              {importMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Importing Questions...
                </>
              ) : (
                <>
                  <UploadCloud className="h-3.5 w-3.5" /> Import {validCount} Valid Question{validCount === 1 ? '' : 's'}
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
