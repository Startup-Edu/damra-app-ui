import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { UploadCloud, Code2 } from 'lucide-react'

interface ImportInputTabsProps {
  activeTab: 'file' | 'raw'
  setActiveTab: (tab: 'file' | 'raw') => void
  jsonText: string
  setJsonText: (text: string) => void
  selectedFileName: string | null
  fileInputId: string
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function ImportInputTabs({
  activeTab,
  setActiveTab,
  jsonText,
  setJsonText,
  selectedFileName,
  fileInputId,
  handleFileUpload,
}: ImportInputTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
      <TabsList className="grid grid-cols-2 w-[320px] h-9 mb-4">
        <TabsTrigger value="file" className="text-xs gap-1.5">
          <UploadCloud className="size-3.5" /> JSON File Upload
        </TabsTrigger>
        <TabsTrigger value="raw" className="text-xs gap-1.5">
          <Code2 className="size-3.5" /> Paste Raw JSON
        </TabsTrigger>
      </TabsList>

      {/* Tab 1: File Dropzone */}
      <TabsContent value="file" className="mt-0">
        <label
          htmlFor={fileInputId}
          className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl border-border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors"
        >
          <UploadCloud className="size-8 text-muted-foreground mb-2" />
          <span className="text-xs font-semibold text-foreground">
            {selectedFileName ? selectedFileName : 'Drop your .json file here, or click to browse'}
          </span>
          <span className="text-[10px] text-muted-foreground mt-1">
            Supports JSON array of question objects
          </span>
          <input
            id={fileInputId}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      </TabsContent>

      {/* Tab 2: Raw JSON Textarea */}
      <TabsContent value="raw" className="mt-0">
        <Textarea
          placeholder="[&#10;  {&#10;    &quot;question_text_en&quot;: &quot;Sample Question&quot;,&#10;    &quot;question_text_kh&quot;: &quot;សំណួរគំរូ&quot;,&#10;    &quot;question_type&quot;: &quot;MCQ&quot;&#10;  }&#10;]"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          className="font-mono text-xs h-44 resize-none leading-relaxed"
        />
      </TabsContent>
    </Tabs>
  )
}
