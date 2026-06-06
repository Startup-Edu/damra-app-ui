import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Define the exact shape of your backend response
export interface User {
  id: string
  email: string
  name: string
  role: string
  permissions: string[]
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setAuth: (user: User) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (user) => set({ user, isAuthenticated: true }),
      clearAuth: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'damra-auth', // Key used in localStorage
    }
  )
)