import { apiClient } from './client'

export interface UploadedFileData {
  file_id: string
  original_name: string
  url: string
  mime_type: string
  size_bytes: number
}

export interface UploadFileResponse {
  code: number
  success: boolean
  message: string
  data: UploadedFileData
}

/**
 * Uploads a file to the backend /api/files/upload endpoint.
 * Accepts a File or Blob, creates FormData, and returns the uploaded file details including URL.
 */
export async function uploadFileApi(
  file: File | Blob,
  fileName?: string
): Promise<UploadFileResponse> {
  const formData = new FormData()
  if (file instanceof File) {
    formData.append('file', file)
  } else {
    formData.append('file', file, fileName || 'upload.webp')
  }

  return apiClient.upload<UploadFileResponse>('/files/upload', formData)
}
