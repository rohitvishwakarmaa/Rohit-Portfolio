import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AdminUser } from '@/types'

interface AuthState {
  token: string | null
  user: AdminUser | null
  isAuthenticated: boolean
  login: (token: string, user: AdminUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)
