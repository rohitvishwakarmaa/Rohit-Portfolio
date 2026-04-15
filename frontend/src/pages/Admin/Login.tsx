import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Mail, Eye, EyeOff, Sparkles, KeyRound, ArrowLeft, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'

// ─── Step types ───────────────────────────────────────────────────────────────
type LoginStep = 'login' | 'otp' | 'forgot-email' | 'forgot-otp' | 'forgot-newpass'

export default function AdminLogin() {
  const navigate = useNavigate()
  const {
    handleLogin, handleVerifyOTP, handleResendOTP,
    handleForgotPassword, handleVerifyForgotPasswordOTP, handleResetPassword,
    isLoading, error,
  } = useAuth()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  // ── Login state ───────────────────────────────────────────────────────────
  const [step, setStep] = useState<LoginStep>('login')
  const [form, setForm] = useState({ email: '', password: '' })
  const [otpValue, setOtpValue] = useState('')
  const [loginData, setLoginData] = useState<{ email: string; username: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  // ── Forgot-password state ─────────────────────────────────────────────────
  const [fpEmail, setFpEmail] = useState('')
  const [fpOtp, setFpOtp] = useState('')
  const [fpResetToken, setFpResetToken] = useState('')
  const [fpNewPass, setFpNewPass] = useState('')
  const [fpConfirmPass, setFpConfirmPass] = useState('')
  const [fpShowNew, setFpShowNew] = useState(false)
  const [fpShowConfirm, setFpShowConfirm] = useState(false)
  const [fpSuccess, setFpSuccess] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated && step === 'login') {
      navigate('/admin', { replace: true })
    }
  }, [isAuthenticated, navigate, step])

  // ── Helpers ──────────────────────────────────────────────────────────────
  const activeError = localError || error

  const resetForgotFlow = () => {
    setFpEmail('')
    setFpOtp('')
    setFpResetToken('')
    setFpNewPass('')
    setFpConfirmPass('')
    setFpSuccess(false)
    setLocalError(null)
  }

  const goBack = () => {
    setLocalError(null)
    if (step === 'forgot-email') { resetForgotFlow(); setStep('login') }
    else if (step === 'forgot-otp') setStep('forgot-email')
    else if (step === 'forgot-newpass') setStep('forgot-otp')
    else if (step === 'otp') setStep('login')
  }

  // ── Login handlers ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setResendSuccess(false)
    const res = await handleLogin(form)
    if (res.status === 'success') {
      navigate('/admin')
    } else if (res.status === 'otp_required') {
      setLoginData({ email: res.email!, username: res.username! })
      setStep('otp')
    }
  }

  const handleResend = async () => {
    if (!loginData) return
    const success = await handleResendOTP(loginData.username)
    if (success) {
      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 5000)
    }
  }

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginData) return
    const success = await handleVerifyOTP(loginData.username, otpValue)
    if (success) navigate('/admin')
  }

  // ── Forgot-password handlers ──────────────────────────────────────────────
  const handleFPEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    const ok = await handleForgotPassword(fpEmail)
    if (ok) setStep('forgot-otp')
  }

  const handleFPOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    const token = await handleVerifyForgotPasswordOTP(fpEmail, fpOtp)
    if (token) {
      setFpResetToken(token)
      setStep('forgot-newpass')
    }
  }

  const handleFPNewPassSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    if (fpNewPass !== fpConfirmPass) {
      setLocalError("Passwords don't match")
      return
    }
    if (fpNewPass.length < 8) {
      setLocalError('Password must be at least 8 characters')
      return
    }
    const ok = await handleResetPassword(fpResetToken, fpNewPass)
    if (ok) {
      setFpSuccess(true)
      setTimeout(() => {
        resetForgotFlow()
        setStep('login')
      }, 2500)
    }
  }

  // ── Shared animations ─────────────────────────────────────────────────────
  const slideIn = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
    transition: { duration: 0.35, ease: 'easeOut' },
  }

  const renderError = () =>
    activeError ? (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="bg-red-500/10 border border-red-500/20 rounded-xl p-3"
      >
        <p className="text-red-400 text-sm">{activeError}</p>
      </motion.div>
    ) : null

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'linear-gradient(135deg, #0A0A0F 0%, #1a0a2e 50%, #0A0A0F 100%)' }}
    >
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2"
          style={{ background: 'radial-gradient(circle, #7B2CBF, transparent)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15 translate-x-1/3 translate-y-1/3"
          style={{ background: 'radial-gradient(circle, #F77F00, transparent)' }}
        />

        <div className="flex items-center gap-3 relative z-10">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #F77F00, #FF4D6D)' }}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">Rohit Vishwakarma</span>
        </div>

        <div className="relative z-10">
          <h2 className="font-display font-black text-5xl text-white leading-tight mb-6">
            Admin{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #FFD166, #F77F00)' }}
            >
              Dashboard
            </span>
          </h2>
          <p className="text-white/50 text-lg leading-relaxed">
            Manage your portfolio, upload new projects, and track your work — all in one place.
          </p>
          <div className="mt-10 flex gap-6">
            {['Upload Videos', 'Manage Projects', 'Real-time Preview'].map((f) => (
              <div key={f} className="flex items-center gap-2 text-white/40 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/20 text-sm relative z-10">© 2025 Rohit Vishwakarma</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #F77F00, #FF4D6D)' }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg">Rohit Vishwakarma</span>
          </div>

          <AnimatePresence mode="wait">

            {/* ── STEP: Login ──────────────────────────────────────────── */}
            {step === 'login' && (
              <motion.div key="login" {...slideIn}>
                <h1 className="font-display font-bold text-3xl text-white mb-2">Welcome back</h1>
                <p className="text-white/40 mb-8">Sign in to manage your portfolio</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email */}
                  <div>
                    <label className="block text-white/60 text-sm font-medium mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        id="admin-email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder="admin@example.com"
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-brand-orange transition-colors text-sm"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-white/60 text-sm font-medium mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        id="admin-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={form.password}
                        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-brand-orange transition-colors text-sm"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Forgot password link */}
                  <div className="flex justify-end -mt-2">
                    <button
                      type="button"
                      onClick={() => { resetForgotFlow(); setStep('forgot-email') }}
                      className="text-brand-orange text-sm hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {renderError()}

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={isLoading}
                    className="w-full justify-center mt-2"
                  >
                    Sign In to Dashboard
                  </Button>
                </form>
              </motion.div>
            )}

            {/* ── STEP: Login OTP ──────────────────────────────────────── */}
            {step === 'otp' && (
              <motion.div key="otp" {...slideIn}>
                <h1 className="font-display font-bold text-3xl text-white mb-2">Verify OTP</h1>
                <p className="text-white/40 mb-8">We've sent a 6-digit code to {loginData?.email}</p>

                <form onSubmit={handleOTPSubmit} className="space-y-6">
                  <div>
                    <label className="block text-white/60 text-sm font-medium mb-3 text-center">Enter Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full text-center tracking-[0.5em] font-mono text-2xl py-4 rounded-xl border border-white/10 text-white placeholder:text-white/10 focus:outline-none focus:border-brand-orange transition-colors"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                      autoFocus
                    />
                  </div>

                  {renderError()}

                  <div className="space-y-3">
                    <Button type="submit" variant="primary" size="lg" loading={isLoading} className="w-full justify-center">
                      Verify &amp; Login
                    </Button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={handleResend}
                        className="text-brand-orange text-sm font-medium hover:underline disabled:opacity-50"
                      >
                        Resend Code
                      </button>
                      {resendSuccess && (
                        <p className="text-green-400 text-[10px] mt-1">Code resent successfully!</p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={goBack}
                      className="w-full py-2 text-white/40 text-sm hover:text-white/60 transition-colors"
                    >
                      Back to login
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ── STEP: Forgot — Enter Email ────────────────────────────── */}
            {step === 'forgot-email' && (
              <motion.div key="forgot-email" {...slideIn}>
                <button
                  onClick={goBack}
                  className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to login
                </button>

                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: 'linear-gradient(135deg, #F77F00, #FF4D6D)' }}
                >
                  <KeyRound className="w-6 h-6 text-white" />
                </div>

                <h1 className="font-display font-bold text-3xl text-white mb-2">Forgot Password?</h1>
                <p className="text-white/40 mb-8">
                  Enter your registered email — we'll send you a reset code.
                </p>

                <form onSubmit={handleFPEmailSubmit} className="space-y-5">
                  <div>
                    <label className="block text-white/60 text-sm font-medium mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        id="fp-email"
                        type="email"
                        required
                        value={fpEmail}
                        onChange={(e) => setFpEmail(e.target.value)}
                        placeholder="admin@example.com"
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-brand-orange transition-colors text-sm"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                        autoFocus
                      />
                    </div>
                  </div>

                  {renderError()}

                  <Button type="submit" variant="primary" size="lg" loading={isLoading} className="w-full justify-center">
                    Send Reset Code
                  </Button>
                </form>
              </motion.div>
            )}

            {/* ── STEP: Forgot — Verify OTP ────────────────────────────── */}
            {step === 'forgot-otp' && (
              <motion.div key="forgot-otp" {...slideIn}>
                <button
                  onClick={goBack}
                  className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: 'linear-gradient(135deg, #7B2CBF, #F77F00)' }}
                >
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>

                <h1 className="font-display font-bold text-3xl text-white mb-2">Check Your Email</h1>
                <p className="text-white/40 mb-8">
                  Enter the 6-digit code sent to <span className="text-white/70 font-medium">{fpEmail}</span>
                </p>

                <form onSubmit={handleFPOtpSubmit} className="space-y-6">
                  <div>
                    <label className="block text-white/60 text-sm font-medium mb-3 text-center">Reset Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={fpOtp}
                      onChange={(e) => setFpOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full text-center tracking-[0.5em] font-mono text-2xl py-4 rounded-xl border border-white/10 text-white placeholder:text-white/10 focus:outline-none focus:border-brand-orange transition-colors"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                      autoFocus
                    />
                  </div>

                  {renderError()}

                  <div className="space-y-3">
                    <Button type="submit" variant="primary" size="lg" loading={isLoading} className="w-full justify-center">
                      Verify Code
                    </Button>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleForgotPassword(fpEmail)}
                        className="text-brand-orange text-sm font-medium hover:underline disabled:opacity-50"
                      >
                        Resend Code
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ── STEP: Forgot — New Password ───────────────────────────── */}
            {step === 'forgot-newpass' && (
              <motion.div key="forgot-newpass" {...slideIn}>
                {fpSuccess ? (
                  <div className="text-center py-8">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                      style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                    >
                      <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="font-display font-bold text-2xl text-white mb-2">Password Reset!</h1>
                    <p className="text-white/50 text-sm">Redirecting you to login…</p>
                  </div>
                ) : (
                  <>
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                      style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                    >
                      <Lock className="w-6 h-6 text-white" />
                    </div>

                    <h1 className="font-display font-bold text-3xl text-white mb-2">New Password</h1>
                    <p className="text-white/40 mb-8">Choose a strong password for your account.</p>

                    <form onSubmit={handleFPNewPassSubmit} className="space-y-5">
                      {/* New password */}
                      <div>
                        <label className="block text-white/60 text-sm font-medium mb-2">New Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                          <input
                            id="fp-new-password"
                            type={fpShowNew ? 'text' : 'password'}
                            required
                            value={fpNewPass}
                            onChange={(e) => setFpNewPass(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-brand-orange transition-colors text-sm"
                            style={{ background: 'rgba(255,255,255,0.06)' }}
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => setFpShowNew((s) => !s)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                          >
                            {fpShowNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm password */}
                      <div>
                        <label className="block text-white/60 text-sm font-medium mb-2">Confirm Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                          <input
                            id="fp-confirm-password"
                            type={fpShowConfirm ? 'text' : 'password'}
                            required
                            value={fpConfirmPass}
                            onChange={(e) => setFpConfirmPass(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-brand-orange transition-colors text-sm"
                            style={{ background: 'rgba(255,255,255,0.06)' }}
                          />
                          <button
                            type="button"
                            onClick={() => setFpShowConfirm((s) => !s)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                          >
                            {fpShowConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Password hint */}
                      <p className="text-white/30 text-xs">Minimum 8 characters.</p>

                      {renderError()}

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        loading={isLoading}
                        className="w-full justify-center"
                      >
                        Reset Password
                      </Button>
                    </form>
                  </>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
