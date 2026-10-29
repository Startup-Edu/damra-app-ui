export interface CompressionOptions {
  /** Maximum output width in pixels (default: 800) */
  maxWidth?: number
  /** Maximum output height in pixels (default: 800) */
  maxHeight?: number
  /** Quality between 0.1 and 1.0 (default: 0.82) */
  quality?: number
  /** Target MIME format (default: 'image/webp') */
  format?: 'image/webp' | 'image/jpeg' | 'image/png'
  /** Keep original format if set to true (default: false) */
  keepOriginalFormat?: boolean
}

export interface CompressionResult {
  file: File
  originalFile: File
  previewUrl: string
  originalSizeBytes: number
  compressedSizeBytes: number
  savedBytes: number
  savedPercentage: number
  width: number
  height: number
  originalWidth: number
  originalHeight: number
  format: string
}

/**
 * Formats a byte number into a human-readable string (e.g. 1.2 MB, 450 KB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

/**
 * Checks whether the given file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

/**
 * Compresses an image file on the client browser using HTMLCanvasElement.
 * Reduces dimensions and adjusts quality to minimize payload size while
 * preserving visual clarity.
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.82,
    format = 'image/webp',
    keepOriginalFormat = false,
  } = options

  const originalSizeBytes = file.size

  // If file is an SVG, don't rasterize it to preserve vector quality
  if (file.type === 'image/svg+xml') {
    const previewUrl = URL.createObjectURL(file)
    return {
      file,
      originalFile: file,
      previewUrl,
      originalSizeBytes,
      compressedSizeBytes: originalSizeBytes,
      savedBytes: 0,
      savedPercentage: 0,
      width: 0,
      height: 0,
      originalWidth: 0,
      originalHeight: 0,
      format: 'image/svg+xml',
    }
  }

  // Load image
  const img = await loadImageFromFile(file)
  const originalWidth = img.naturalWidth || img.width
  const originalHeight = img.naturalHeight || img.height

  // Compute target dimensions preserving aspect ratio
  let targetWidth = originalWidth
  let targetHeight = originalHeight

  if (targetWidth > maxWidth) {
    targetHeight = Math.round((targetHeight * maxWidth) / targetWidth)
    targetWidth = maxWidth
  }

  if (targetHeight > maxHeight) {
    targetWidth = Math.round((targetWidth * maxHeight) / targetHeight)
    targetHeight = maxHeight
  }

  // Determine output MIME type
  let targetMime = format
  if (keepOriginalFormat && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp')) {
    targetMime = file.type as 'image/webp' | 'image/jpeg' | 'image/png'
  }

  // Draw onto offscreen canvas
  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Canvas context could not be created.')
  }

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

  // Export blob with chosen quality
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b)
        else reject(new Error('Failed to convert canvas to blob.'))
      },
      targetMime,
      quality
    )
  })

  // Determine extension
  const extensionMap: Record<string, string> = {
    'image/webp': 'webp',
    'image/jpeg': 'jpg',
    'image/png': 'png',
  }
  const ext = extensionMap[targetMime] || 'webp'
  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
  const finalFilename = `${baseName}.${ext}`

  // If the compressed blob is somehow larger than the original and dimensions didn't shrink,
  // we keep the original to prevent unnecessary bloat.
  let finalFile: File
  let finalSize = blob.size

  if (blob.size >= originalSizeBytes && targetWidth === originalWidth && targetHeight === originalHeight) {
    finalFile = file
    finalSize = originalSizeBytes
  } else {
    finalFile = new File([blob], finalFilename, {
      type: targetMime,
      lastModified: Date.now(),
    })
  }

  const previewUrl = URL.createObjectURL(finalFile)
  const savedBytes = Math.max(0, originalSizeBytes - finalSize)
  const savedPercentage = originalSizeBytes > 0 ? Math.round((savedBytes / originalSizeBytes) * 100) : 0

  return {
    file: finalFile,
    originalFile: file,
    previewUrl,
    originalSizeBytes,
    compressedSizeBytes: finalSize,
    savedBytes,
    savedPercentage,
    width: targetWidth,
    height: targetHeight,
    originalWidth,
    originalHeight,
    format: finalFile.type,
  }
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Failed to load image for compression.'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Failed to read image file.'))
    reader.readAsDataURL(file)
  })
}
