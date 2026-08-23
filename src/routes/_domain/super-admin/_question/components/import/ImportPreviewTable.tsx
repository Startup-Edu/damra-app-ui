import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { CheckCircle2, AlertTriangle, XCircle, FileText } from 'lucide-react'
import type { ParsedItem } from './importValidation.util'
import type { DifficultyEnum } from '../../_types/question.types'

interface ImportPreviewTableProps {
  parsedItems: ParsedItem[]
  validCount: number
  duplicateCount: number
  invalidCount: number
  presetDifficulty: DifficultyEnum
}

export function ImportPreviewTable({
  parsedItems,
  validCount,
  duplicateCount,
  invalidCount,
  presetDifficulty,
}: ImportPreviewTableProps) {
  const stripHtml = (html: string) => {
    if (!html) return ''
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Pre-Import Validation & Preview
          </h4>
          {parsedItems.length > 0 && (
            <div className="flex items-center gap-1.5 ml-2">
              <Badge variant="outline" className="text-[10px]">
                Total: {parsedItems.length}
              </Badge>
              <Badge variant="success" className="text-[10px]">
                Valid: {validCount}
              </Badge>
              {duplicateCount > 0 && (
                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px]">
                  Duplicates: {duplicateCount}
                </Badge>
              )}
              {invalidCount > 0 && (
                <Badge variant="destructive" className="text-[10px]">
                  Invalid: {invalidCount}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {duplicateCount > 0 && (
        <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300 py-2.5 text-xs">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <AlertDescription className="text-xs leading-relaxed">
            <span className="font-bold">{duplicateCount} duplicate item{duplicateCount === 1 ? '' : 's'} detected.</span> Intra-file duplicates and questions already in the database will be safely skipped during import.
          </AlertDescription>
        </Alert>
      )}

      {parsedItems.length === 0 ? (
        <div className="p-8 text-center border border-dashed rounded-xl border-slate-200 dark:border-slate-800 text-slate-400">
          <FileText className="h-6 w-6 mx-auto mb-2 opacity-50" />
          <p className="text-xs">Upload a JSON file or paste code above to preview questions.</p>
        </div>
      ) : (
        <div className="border rounded-xl border-slate-100 dark:border-slate-800 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 hover:bg-transparent">
                <TableHead className="w-[40px] text-center">#</TableHead>
                <TableHead>Question Text Preview</TableHead>
                <TableHead className="w-[100px]">Type</TableHead>
                <TableHead className="w-[90px]">Difficulty</TableHead>
                <TableHead className="w-[90px]">Status</TableHead>
                <TableHead>Issues / Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parsedItems.map((item) => (
                <TableRow key={item.index}>
                  <TableCell className="text-center font-mono text-[10px] text-slate-400">
                    {item.index}
                  </TableCell>
                  <TableCell>
                    {item.raw ? (
                      <div>
                        <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 max-w-[280px] truncate">
                          {stripHtml(item.raw.question_text_en || item.raw.questionTextEn || '(No EN Text)')}
                        </div>
                        <div className="text-[10px] text-slate-400 max-w-[280px] truncate">
                          {stripHtml(item.raw.question_text_kh || item.raw.questionTextKh || '(No KH Text)')}
                        </div>
                      </div>
                    ) : (
                      <span className="text-rose-500 text-xs font-semibold">JSON Parse Failed</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[9px] uppercase font-bold">
                      {item.raw?.question_type || item.raw?.questionType || 'MCQ'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[9px]">
                      {item.raw?.difficulty_level || item.raw?.difficulty || presetDifficulty}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {!item.isValid ? (
                      <Badge variant="destructive" className="text-[10px] gap-1">
                        <XCircle className="h-3 w-3" /> Error
                      </Badge>
                    ) : item.isDuplicate ? (
                      <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] gap-1">
                        <AlertTriangle className="h-3 w-3" /> Duplicate
                      </Badge>
                    ) : (
                      <Badge variant="success" className="text-[10px] gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Valid
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    {item.errors.length > 0 ? (
                      <ul className="list-disc list-inside space-y-0.5 text-[10px] text-rose-500">
                        {item.errors.map((err, eidx) => (
                          <li key={eidx}>{err}</li>
                        ))}
                      </ul>
                    ) : item.isDuplicate ? (
                      <span className="text-amber-600 dark:text-amber-400 text-[10px]">
                        Duplicate entry in file (will be skipped)
                      </span>
                    ) : (
                      <span className="text-emerald-500 text-[10px]">Ready for import</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
