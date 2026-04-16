import { useState, useCallback } from 'react'
import { adminService } from '@/services/adminService'
import { useAuthStore } from '@/store/authStore'
import type { LoginCredentials } from '@/types'

export const useAuth = () => {
  const { token, user, isAuthenticated, login, logout } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = useCallback(
    async (credentials: LoginCredentials) => {
      if (isLoading) return { status: 'loading' }
      setIsLoading(true)
      setError(null)
      try {
        const res = await adminService.login(credentials)
        if ((res as any).status === 'otp_required') {
          return { status: 'otp_required', email: (res as any).email, username: (res as any).username }
        }
        login(res.token, res.user)
        return { status: 'success' }
      } catch (err: any) {
        const message =
          err?.response?.data?.error?.message ||
          (err instanceof Error ? err.message : 'Login failed. Please try again.')
        setError(message)
        return { status: 'error', message }
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, login]
  )

  const handleVerifyOTP = useCallback(
    async (username: string, otp: string) => {
      if (isLoading) return false
      setIsLoading(true)
      setError(null)
      try {
        const res = await adminService.verifyOTP(username, otp)
        login(res.token, res.user)
        return true
      } catch (err: any) {
        const message =
          err?.response?.data?.error?.message ||
          (err instanceof Error ? err.message : 'Invalid OTP. Please try again.')
        setError(message)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, login]
  )

  const handleResendOTP = useCallback(
    async (username: string) => {
      setIsLoading(true)
      setError(null)
      try {
        await adminService.resendOTP(username)
        return true
      } catch (err: any) {
        setError(err?.response?.data?.error?.message || 'Failed to resend OTP')
        return false
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // ── Forgot Password ──────────────────────────────────────────────────────
  const handleForgotPassword = useCallback(async (email: string) => {
    if (isLoading) return false
    setIsLoading(true)
    setError(null)
    try {
      await adminService.forgotPassword(email)
      return true
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to send reset code')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  const handleVerifyForgotPasswordOTP = useCallback(async (email: string, otp: string) => {
    if (isLoading) return null
    setIsLoading(true)
    setError(null)
    try {
      const data = await adminService.verifyForgotPasswordOTP(email, otp)
      return data.reset_token
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Invalid or expired code')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  const handleResetPassword = useCallback(async (resetToken: string, newPassword: string) => {
    if (isLoading) return false
    setIsLoading(true)
    setError(null)
    try {
      await adminService.resetPassword(resetToken, newPassword)
      return true
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to reset password')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  const handleLogout = useCallback(() => {
    logout()
  }, [logout])

  return {
    token, user, isAuthenticated, isLoading, error,
    handleLogin, handleVerifyOTP, handleResendOTP, handleLogout,
    handleForgotPassword, handleVerifyForgotPasswordOTP, handleResetPassword,
  }
}
