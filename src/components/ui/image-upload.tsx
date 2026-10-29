import { useState, useRef, useCallback, useEffect } from 'react'
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Link as LinkIcon,
  Eye,
  X,
  FileImage,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  compressImage,
  formatBytes,
  isImageFile,
  type CompressionOptions,
  type CompressionResult,
} from '@/utils/image-compression'
import { uploadFileApi } from '@/api/files'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export interface ImageUploadProps {
  /** Current image URL */
  value?: string | null
  /** Callback when the image URL changes (null on removal) */
  onChange?: (url: string | null) => void
  /** Optional callback fired when compression completes with stats */
  onCompressionComplete?: (result: CompressionResult) => void
  /** Optional callback with the compressed File object */
  onFileSelect?: (file: File | null) => void
  /** Label for the upload control */
  label?: string
  /** Subtitle / hint */
  description?: string
  /** Max file size in megabytes before compression (default: 10) */
  maxSizeMB?: number
  /** Compression settings */
  compression?: CompressionOptions
  /** Aspect ratio hint for preview box (default: 'square') */
  aspectRatio?: 'square' | 'video' | 'banner' | 'auto'
  /** Disabled state */
  disabled?: boolean
  /** Custom class for root container */
  className?: string
  /** Whether to allow direct URL pasting (default: true) */
  allowDirectUrl?: boolean
  /** Auto upload to /api/files/upload upon selection & compression (default: true) */
  autoUpload?: boolean
}

type UploadState = 'idle' | 'compressing' | 'uploading' | 'success' | 'error'

export function ImageUpload({
  value,
  onChange,
  onCompressionComplete,
  onFileSelect,
  label,
  description,
  maxSizeMB = 10,
  compression = {
    maxWidth: 600,
    maxHeight: 600,
    quality: 0.82,
    format: 'image/webp',
  },
  aspectRatio = 'square',
  disabled = false,
  className,
  allowDirectUrl = true,
  autoUpload = true,
}: ImageUploadProps) {
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [compressionStats, setCompressionStats] = useState<CompressionResult | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [urlMode, setUrlMode] = useState(false)
  const [manualUrl, setManualUrl] = useState(value || '')

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setManualUrl(value || '')
    if (!value) {
      setLocalPreview(null)
    }
  }, [value])

  const handleProcessFile = useCallback(
    async (rawFile: File) => {
      setErrorMessage(null)

      if (!isImageFile(rawFile)) {
        const msg = 'Selected file must be an image (PNG, JPG, WebP, SVG, GIF).'
        setErrorMessage(msg)
        toast.error(msg)
        return
      }

      if (rawFile.size > maxSizeMB * 1024 * 1024) {
        const msg = `File is too large (${formatBytes(rawFile.size)}). Max allowed size is ${maxSizeMB} MB.`
        setErrorMessage(msg)
        toast.error(msg)
        return
      }

      try {
        setUploadState('compressing')

        // 1. Client-side browser compression
        const result = await compressImage(rawFile, compression)
        setCompressionStats(result)
        // Show compressed preview IMMEDIATELY in browser
        setLocalPreview(result.previewUrl)
        onCompressionComplete?.(result)
        onFileSelect?.(result.file)

        // 2. Upload to backend if autoUpload is enabled
        if (autoUpload) {
          setUploadState('uploading')
          const uploadRes = await uploadFileApi(result.file, result.file.name)

          const returnedUrl = uploadRes.data?.url || (uploadRes as any).url
          if (uploadRes.success && returnedUrl) {
            setUploadState('success')
            onChange?.(returnedUrl)
            toast.success('Image compressed and uploaded successfully!')
          } else {
            throw new Error(uploadRes.message || 'Upload failed')
          }
        } else {
          // If not auto-uploading, set preview URL as temporary value
          setUploadState('success')
          onChange?.(result.previewUrl)
        }
      } catch (err: any) {
        console.error('Image upload/compression error:', err)
        const errorMsg = err?.message || 'Failed to process image'
        setErrorMessage(errorMsg)
        setUploadState('error')
        toast.error(errorMsg)
      }
    },
    [autoUpload, compression, maxSizeMB, onChange, onCompressionComplete, onFileSelect]
  )

  const handleDrag = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (disabled) return

      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true)
      } else if (e.type === 'dragleave') {
        setDragActive(false)
      }
    },
    [disabled]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      if (disabled) return

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleProcessFile(e.dataTransfer.files[0])
      }
    },
    [disabled, handleProcessFile]
  )

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0])
    }
    // reset input value so re-uploading the same file triggers change
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLocalPreview(null)
    setCompressionStats(null)
    setErrorMessage(null)
    setUploadState('idle')
    onChange?.(null)
    onFileSelect?.(null)
    setManualUrl('')
  }

  const handleManualUrlApply = () => {
    if (!manualUrl.trim()) {
      setLocalPreview(null)
      onChange?.(null)
      return
    }
    try {
      new URL(manualUrl.trim())
      setLocalPreview(null)
      onChange?.(manualUrl.trim())
      setErrorMessage(null)
      setCompressionStats(null)
      toast.success('Image URL applied.')
    } catch {
      setErrorMessage('Please enter a valid HTTP/HTTPS URL.')
    }
  }

  const ratioClass = {
    square: 'aspect-square max-w-[200px]',
    video: 'aspect-video max-w-[320px]',
    banner: 'aspect-[3/1] max-w-[400px]',
    auto: 'min-h-[140px]',
  }[aspectRatio]

  const displayUrl = localPreview || value
  const hasImage = Boolean(displayUrl)

  return (
    <div className={cn('space-y-2', className)}>
      {/* Header & Controls */}
      <div className="flex items-center justify-between">
        <div>
          {label && (
            <label className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
              <FileImage className="size-3.5 text-primary" />
              {label}
            </label>
          )}
          {description && (
            <p className="text-[10px] text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>

        {allowDirectUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
            onClick={() => setUrlMode((prev) => !prev)}
          >
            <LinkIcon className="size-3 mr-1" />
            {urlMode ? 'Upload Mode' : 'Paste URL'}
          </Button>
        )}
      </div>

      {/* Manual URL Input mode */}
      {urlMode ? (
        <div className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/30 animate-fade-in">
          <Input
            placeholder="https://example.com/icon.webp"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            disabled={disabled}
            className="h-8 text-xs font-mono"
          />
          <Button
            type="button"
            size="sm"
            className="h-8 px-3 text-xs"
            onClick={handleManualUrlApply}
            disabled={disabled}
          >
            Apply
          </Button>
        </div>
      ) : null}

      {/* Main Upload / Preview Area */}
      {hasImage ? (
        /* Populated Preview Card */
        <div className="relative flex items-center gap-3 p-3 rounded-xl border border-border bg-card/60 backdrop-blur-xs shadow-xs animate-fade-in">
          {/* Hidden File Input */}
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
            className="hidden"
            disabled={disabled}
            onChange={handleFileInputChange}
          />

          {/* Thumbnail */}
          <div
            className="relative size-16 rounded-lg bg-muted/40 border border-border flex items-center justify-center overflow-hidden shrink-0 cursor-pointer group"
            onClick={() => setPreviewOpen(true)}
            title="Click to view full preview"
          >
            <img
              src={displayUrl || ''}
              alt="Uploaded preview"
              className="w-full h-full object-contain p-1 transition-transform group-hover:scale-110"
              onError={() => {
                if (!localPreview) {
                  setErrorMessage('Unable to preview image from URL.')
                }
              }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Eye className="size-4" />
            </div>
          </div>

          {/* Details & Compression Stats */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-foreground truncate max-w-[180px]">
                {compressionStats?.file.name || 'Category Icon'}
              </span>
              {compressionStats && compressionStats.savedPercentage > 0 && (
                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[9px] px-1.5 py-0 h-4 font-mono">
                  -{compressionStats.savedPercentage}%
                </Badge>
              )}
            </div>

            <div className="text-[10px] text-muted-foreground font-mono">
              {compressionStats ? (
                <span>
                  {formatBytes(compressionStats.originalSizeBytes)} →{' '}
                  <span className="font-semibold text-foreground">
                    {formatBytes(compressionStats.compressedSizeBytes)}
                  </span>
                  {compressionStats.width > 0 && ` (${compressionStats.width}×${compressionStats.height}px)`}
                </span>
              ) : (
                <span>Active image icon</span>
              )}
            </div>

            {displayUrl && (
              <div className="flex items-center gap-2 pt-0.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Eye className="size-3" /> View
                </button>
                <span className="text-muted-foreground/40">•</span>
                <a
                  href={displayUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  Open in tab <ExternalLink className="size-2.5" />
                </a>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs px-2.5 gap-1.5"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
            >
              <RefreshCw className="size-3" />
              <span>Change</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="size-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={handleRemove}
              disabled={disabled}
              title="Remove icon"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          {/* Loading overlay during compression / upload */}
          {(uploadState === 'compressing' || uploadState === 'uploading') && (
            <div className="absolute inset-0 bg-background/90 backdrop-blur-xs rounded-xl flex items-center justify-center gap-2 z-10">
              <RefreshCw className="size-4 text-primary animate-spin" />
              <span className="text-xs font-medium">
                {uploadState === 'compressing' ? 'Compressing...' : 'Uploading...'}
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Dropzone when no image is selected */
        <div
          className={cn(
            'relative group rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden p-4 cursor-pointer',
            dragActive
              ? 'border-primary bg-primary/5 ring-4 ring-primary/10 scale-[1.01]'
              : 'border-border/80 hover:border-primary/50 bg-muted/20 hover:bg-muted/30',
            disabled && 'opacity-60 cursor-not-allowed hover:border-border'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => {
            if (!disabled) {
              inputRef.current?.click()
            }
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
            className="hidden"
            disabled={disabled}
            onChange={handleFileInputChange}
          />

          <div className="flex flex-col items-center justify-center text-center py-2 px-2">
            <div
              className={cn(
                'size-9 rounded-full flex items-center justify-center transition-colors mb-1.5',
                dragActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
              )}
            >
              <UploadCloud className="size-4.5" />
            </div>

            <p className="text-xs font-semibold text-foreground">
              {dragActive ? 'Drop image here' : 'Click to upload or drag & drop'}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              PNG, JPG, WebP, SVG (Auto-compressed in browser)
            </p>
            <div className="flex items-center gap-1 mt-1.5">
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 py-0 border-primary/20 text-primary font-mono"
              >
                <Sparkles className="size-2.5 mr-1 inline" />
                Browser Compressed
              </Badge>
            </div>
          </div>

          {(uploadState === 'compressing' || uploadState === 'uploading') && (
            <div className="absolute inset-0 bg-background/90 backdrop-blur-xs flex flex-col items-center justify-center z-10 p-4">
              <RefreshCw className="size-5 text-primary animate-spin mb-1.5" />
              <p className="text-xs font-semibold text-foreground">
                {uploadState === 'compressing' ? 'Compressing image...' : 'Uploading file...'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error notification */}
      {errorMessage && (
        <div className="flex items-start gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs animate-fade-in">
          <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
          <p className="text-[11px] font-medium leading-tight">{errorMessage}</p>
        </div>
      )}

      {/* Full Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2">
              <ImageIcon className="size-4" />
              Image Preview
            </DialogTitle>
          </DialogHeader>
          <div className="w-full max-h-[60vh] flex items-center justify-center p-4 bg-muted/30 rounded-lg overflow-hidden border">
            {displayUrl && (
              <img
                src={displayUrl}
                alt="Full preview"
                className="max-h-[50vh] max-w-full object-contain rounded"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
