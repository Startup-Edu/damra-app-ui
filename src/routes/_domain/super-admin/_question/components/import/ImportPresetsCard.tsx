import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { CategoryItem } from '../../../_category/_types/category.types'
import type { GradeItem } from '../../../_grade/_types/grade.types'
import type { DifficultyEnum } from '../../_types/question.types'

interface ImportPresetsCardProps {
  grades: GradeItem[]
  categories: CategoryItem[]
  gradesLoading: boolean
  categoriesLoading: boolean
  presetGradeId: string
  setPresetGradeId: (val: string) => void
  presetCategoryId: string
  setPresetCategoryId: (val: string) => void
  presetDifficulty: DifficultyEnum
  setPresetDifficulty: (val: DifficultyEnum) => void
  presetXpValue: number
  setPresetXpValue: (val: number) => void
  presetTimeLimit: string
  setPresetTimeLimit: (val: string) => void
  overrideExisting: boolean
  setOverrideExisting: (val: boolean) => void
}

export function ImportPresetsCard({
  grades,
  categories,
  gradesLoading,
  categoriesLoading,
  presetGradeId,
  setPresetGradeId,
  presetCategoryId,
  setPresetCategoryId,
  presetDifficulty,
  setPresetDifficulty,
  presetXpValue,
  setPresetXpValue,
  presetTimeLimit,
  setPresetTimeLimit,
  overrideExisting,
  setOverrideExisting,
}: ImportPresetsCardProps) {
  return (
    <Card className="border-border shadow-none bg-muted/30">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
          <span>Batch Presets & Field Overrides</span>
          <div className="flex items-center gap-2 font-normal text-xs text-muted-foreground normal-case">
            <Switch
              checked={overrideExisting}
              onCheckedChange={setOverrideExisting}
              id="override-switch"
            />
            <Label htmlFor="override-switch" className="text-[11px] cursor-pointer">
              Override IDs in JSON
            </Label>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Grade Preset */}
        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-[11px] font-semibold">
            Target Grade <span className="text-rose-500">*</span>
          </Label>
          <Select
            value={presetGradeId}
            onValueChange={(val) => {
              setPresetGradeId(val)
              setPresetCategoryId('')
            }}
            disabled={gradesLoading}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Select Target Grade" />
            </SelectTrigger>
            <SelectContent>
              {grades.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name_en} ({g.name_kh})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Preset */}
        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-[11px] font-semibold">
            Target Category <span className="text-rose-500">*</span>
          </Label>
          <Select
            value={presetCategoryId}
            onValueChange={setPresetCategoryId}
            disabled={categoriesLoading || !presetGradeId}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder={!presetGradeId ? "Select Grade first" : "Select Default Category"} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty Preset */}
        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-[11px] font-semibold">
            Default Difficulty
          </Label>
          <Select
            value={presetDifficulty}
            onValueChange={(val: DifficultyEnum) => setPresetDifficulty(val)}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EASY">Easy</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HARD">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* XP Value Preset */}
        <div className="space-y-1.5">
          <Label className="text-[11px] font-semibold">
            Default XP Points
          </Label>
          <Input
            type="number"
            min={0}
            value={presetXpValue}
            onChange={(e) => setPresetXpValue(Number(e.target.value))}
            className="h-9 text-xs"
          />
        </div>

        {/* Timer Limit Preset */}
        <div className="space-y-1.5">
          <Label className="text-[11px] font-semibold">
            Default Timer (Sec)
          </Label>
          <Input
            type="number"
            min={1}
            placeholder="No limit"
            value={presetTimeLimit}
            onChange={(e) => setPresetTimeLimit(e.target.value)}
            className="h-9 text-xs"
          />
        </div>
      </CardContent>
    </Card>
  )
}
