import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react'

interface ImportProgressResultViewProps {
  step: 'importing' | 'result'
  totalSubmitted: number
  importedCount: number
  skippedCount: number
  serverMessage: string
  onDone: () => void
  onReset: () => void
}

export function ImportProgressResultView({
  step,
  totalSubmitted,
  importedCount,
  skippedCount,
  serverMessage,
  onDone,
  onReset,
}: ImportProgressResultViewProps) {
  if (step === 'importing') {
    return (
      <div className="py-16 flex flex-col items-center justify-center space-y-4 text-center animate-fade-in">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <Loader2 className="h-6 w-6 text-primary absolute animate-pulse" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Importing Questions...
          </h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Verifying question hashes, checking database uniqueness, and creating records. Please wait.
          </p>
        </div>
      </div>
    )
  }

  // step === 'result'
  const isAllDuplicates = importedCount === 0
  const isPartial = importedCount > 0 && skippedCount > 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Status Banner */}
      <div className="text-center space-y-2">
        {isAllDuplicates ? (
          <div className="h-14 w-14 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="h-7 w-7" />
          </div>
        ) : (
          <div className="h-14 w-14 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-7 w-7" />
          </div>
        )}

        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          {isAllDuplicates
            ? 'No New Questions Imported'
            : isPartial
              ? 'Import Completed with Skipped Duplicates'
              : 'Questions Imported Successfully!'}
        </h3>

        <p className="text-xs text-slate-500 max-w-md mx-auto">
          {serverMessage ||
            (isAllDuplicates
              ? 'All submitted candidates already exist in the database or contain duplicate entries.'
              : `Successfully added ${importedCount} unique question(s) to the repository database.`)}
        </p>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Total Submitted */}
        <Card className="border-slate-100 dark:border-slate-800 shadow-none bg-slate-50/50 dark:bg-slate-900/40 text-center">
          <CardContent className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Submitted
            </span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200">
              {totalSubmitted}
            </span>
          </CardContent>
        </Card>

        {/* Successfully Imported */}
        <Card className="border-emerald-500/20 shadow-none bg-emerald-500/5 text-center">
          <CardContent className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
              Imported
            </span>
            <div className="flex items-center justify-center gap-1">
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {importedCount}
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        {/* Duplicates Skipped */}
        <Card className="border-amber-500/20 shadow-none bg-amber-500/5 text-center">
          <CardContent className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
              Duplicates Skipped
            </span>
            <div className="flex items-center justify-center gap-1">
              <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                {skippedCount}
              </span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Feedback Banner */}
      <Alert variant="default" className="bg-background text-xs py-3">
        <AlertDescription className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
          <span>Server Log: <span className="font-semibold text-slate-800 dark:text-slate-200">{serverMessage}</span></span>
          <Badge variant={importedCount > 0 ? "success" : "warning"} className="text-[10px]">
            Status 201
          </Badge>
        </AlertDescription>
      </Alert>

      {/* Action Footer Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          className="text-xs h-9 gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Import More Questions
        </Button>

        <Button
          type="button"
          onClick={onDone}
          className="text-xs h-9 gap-1.5"
        >
          Done & Close <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
