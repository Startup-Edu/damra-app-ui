const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

interface RequestOptions extends RequestInit {
  params?: Record<string, string>
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...restOptions } = options

  // Append query parameters if present
  let url = `${BASE_URL}${path}`
  if (params) {
    const searchParams = new URLSearchParams(params)
    url += `?${searchParams.toString()}`
  }

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  }

  const response = await fetch(url, {
    credentials: 'include',
    headers: defaultHeaders,
    ...restOptions,
  })

  const data = await response.json()
  if (!response.ok) {
    const errorDetailMsg =
      (Array.isArray(data.error) && data.error[0]?.message) ||
      data.error?.details?.[0]?.message ||
      data.details?.[0]?.message ||
      data.message ||
      `Request failed with status ${response.status}`
    const error = new Error(errorDetailMsg)
    ;(error as any).data = data
    throw error
  }

  return data
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => 
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: any, options?: RequestOptions) => 
    request<T>(path, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: any, options?: RequestOptions) => 
    request<T>(path, { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: any, options?: RequestOptions) => 
    request<T>(path, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string, options?: RequestOptions) => 
    request<T>(path, { ...options, method: 'DELETE' }),
}
