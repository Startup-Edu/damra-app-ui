import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import { ThemeProvider } from '@/components/theme-provider' 
import { Toaster } from '@/components/ui/sonner' // Import your new Toaster

const queryClient = new QueryClient()
const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="damra-theme">
        <RouterProvider router={router} />
        {/* Mount Toaster globally here */}
        <Toaster position='top-right' /> 
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App