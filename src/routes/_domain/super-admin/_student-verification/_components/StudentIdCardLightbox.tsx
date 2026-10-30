import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ExternalLink, ImageOff } from 'lucide-react'
import { useState } from 'react'

interface StudentIdCardLightboxProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentName: string
  imageUrl: string
  gradeName?: string
}

export function StudentIdCardLightbox({
  open,
  onOpenChange,
  studentName,
  imageUrl,
  gradeName,
}: StudentIdCardLightboxProps) {
  const [hasError, setHasError] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col p-6">
        <DialogHeader className="pb-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight">
                Student Identification Card
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Submitted by <span className="font-semibold text-foreground">{studentName}</span>
                {gradeName ? ` for ${gradeName}` : ''}
              </DialogDescription>
            </div>
            {imageUrl && !hasError && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs shrink-0"
                asChild
              >
                <a href={imageUrl} target="_blank" rel="noopener noreferrer">
                  <span>Open Full Image</span>
                  <ExternalLink className="size-3.5" />
                </a>
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Image Preview Container */}
        <div className="relative flex-1 min-h-[300px] max-h-[65vh] w-full rounded-xl bg-neutral-900/5 dark:bg-neutral-900/60 border border-border/80 flex items-center justify-center p-3 overflow-hidden">
          {hasError || !imageUrl ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground p-8 text-center">
              <ImageOff className="size-10 stroke-1 text-muted-foreground/60" />
              <p className="text-sm font-medium">Unable to load ID card image</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                The image URL may be expired, private, or invalid.
              </p>
            </div>
          ) : (
            <img
              src={imageUrl}
              alt={`ID Card of ${studentName}`}
              className="max-h-full max-w-full object-contain rounded-lg shadow-sm transition-transform duration-200"
              onError={() => setHasError(true)}
              loading="lazy"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
