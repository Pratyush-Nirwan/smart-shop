import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import GoogleAuthButton from '../components/auth/GoogleAuthButton'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const METHOD_OPTIONS = [
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone OTP' },
]

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email ?? '').trim())
}

function validatePhone(phone) {
  return /^\+\d{8,15}$/.test(String(phone ?? '').trim())
}

function formatErrorMessage(error, fallbackMessage) {
  return error instanceof Error ? error.message : fallbackMessage
}

function getMethodButtonClass(isActive) {
  return isActive
    ? 'bg-brand-600 text-white shadow-card'
    : 'bg-transparent text-slate-300 hover:bg-white/5'
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loginWithGoogle, requestPhoneOtp, verifyPhoneOtp } = useAuth()
  const { pushToast } = useToast()

  const [method, setMethod] = useState('email')
  const [emailForm, setEmailForm] = useState({ email: '', password: '' })
  const [phoneForm, setPhoneForm] = useState({ phone: '', otp: '' })
  const [emailErrors, setEmailErrors] = useState({})
  const [phoneErrors, setPhoneErrors] = useState({})
  const [phoneStep, setPhoneStep] = useState('request')
  const [phoneDevOtp, setPhoneDevOtp] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canSubmitEmail =
    !submitting && Boolean(emailForm.email.trim()) && Boolean(emailForm.password.trim())
  const canRequestOtp = !submitting && Boolean(phoneForm.phone.trim())
  const canVerifyOtp = !submitting && Boolean(phoneForm.otp.trim())

  function onEmailChange(event) {
    const { name, value } = event.target
    setEmailForm((prev) => ({ ...prev, [name]: value }))
  }

  function onPhoneChange(event) {
    const { name, value } = event.target
    setPhoneForm((prev) => ({ ...prev, [name]: value }))
  }

  function switchMethod(nextMethod) {
    setMethod(nextMethod)
    setEmailErrors({})
    setPhoneErrors({})
    setPhoneStep('request')
    setPhoneDevOtp('')
    setPhoneForm((prev) => ({ ...prev, otp: '' }))
  }

  function validateEmailForm() {
    const nextErrors = {}

    if (!emailForm.email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!validateEmail(emailForm.email)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!emailForm.password.trim()) {
      nextErrors.password = 'Password is required.'
    } else if (emailForm.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.'
    }

    setEmailErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function validatePhoneRequest() {
    const nextErrors = {}

    if (!phoneForm.phone.trim()) {
      nextErrors.phone = 'Phone number is required.'
    } else if (!validatePhone(phoneForm.phone)) {
      nextErrors.phone = 'Use a full number with country code, for example +15551234567.'
    }

    setPhoneErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function validatePhoneOtp() {
    const nextErrors = {}

    if (!phoneForm.otp.trim()) {
      nextErrors.otp = 'Enter the code we sent to your phone.'
    } else if (!/^\d{4,8}$/.test(phoneForm.otp.trim())) {
      nextErrors.otp = 'Enter a valid OTP code.'
    }

    setPhoneErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function onEmailSubmit(event) {
    event.preventDefault()
    if (!validateEmailForm()) return

    setSubmitting(true)

    try {
      const response = await login({
        email: emailForm.email.trim(),
        password: emailForm.password,
      })

      pushToast({
        title: 'Signed in',
        message: `Welcome back, ${response.user.name}.`,
        type: 'success',
      })
      navigate('/profile')
    } catch (error) {
      pushToast({
        title: 'Sign-in failed',
        message: formatErrorMessage(error, 'Please try again.'),
        type: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function onPhoneRequestSubmit(event) {
    event.preventDefault()
    if (!validatePhoneRequest()) return

    setSubmitting(true)

    try {
      const response = await requestPhoneOtp({
        phone: phoneForm.phone.trim(),
        mode: 'login',
      })

      setPhoneDevOtp(response.devOtp ?? '')
      setPhoneStep('verify')
      setPhoneErrors({})
      pushToast({
        title: 'Code sent',
        message:
          response.delivery === 'sms'
            ? 'Enter the code sent to your phone to continue.'
            : 'A development OTP was generated for local testing.',
        type: 'success',
      })
    } catch (error) {
      pushToast({
        title: 'Could not send code',
        message: formatErrorMessage(error, 'Please try again.'),
        type: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function onPhoneVerifySubmit(event) {
    event.preventDefault()
    if (!validatePhoneOtp()) return

    setSubmitting(true)

    try {
      const response = await verifyPhoneOtp({
        phone: phoneForm.phone.trim(),
        otp: phoneForm.otp.trim(),
        mode: 'login',
      })

      pushToast({
        title: 'Signed in',
        message: `Welcome back, ${response.user.name}.`,
        type: 'success',
      })
      navigate('/profile')
    } catch (error) {
      pushToast({
        title: 'Verification failed',
        message: formatErrorMessage(error, 'Please try again.'),
        type: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function onGoogleCredential(credential) {
    setSubmitting(true)

    try {
      const response = await loginWithGoogle({ credential })
      pushToast({
        title: 'Signed in',
        message: `Welcome back, ${response.user.name}.`,
        type: 'success',
      })
      navigate('/profile')
    } catch (error) {
      pushToast({
        title: 'Google sign-in failed',
        message: formatErrorMessage(error, 'Please try again.'),
        type: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card md:p-8">
        <h1 className="text-2xl font-extrabold text-white">Sign in to SmartShop</h1>
        <p className="mt-2 text-sm text-slate-300">
          Access your orders, saved items, and faster checkout from one account.
        </p>

        <div className="mt-6">
          <GoogleAuthButton
            text="signin_with"
            disabled={submitting}
            onCredential={onGoogleCredential}
          />
        </div>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-500">
          <span className="h-px flex-1 bg-white/10" />
          <span>or use another method</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-slate-950/40 p-1">
          {METHOD_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => switchMethod(option.id)}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${getMethodButtonClass(method === option.id)}`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {method === 'email' ? (
          <form onSubmit={onEmailSubmit} className="mt-6 grid gap-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={emailForm.email}
              onChange={onEmailChange}
              error={emailErrors.email}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={emailForm.password}
              onChange={onEmailChange}
              error={emailErrors.password}
              placeholder="Enter your password"
            />

            <Button type="submit" size="lg" disabled={!canSubmitEmail} className="mt-2">
              {submitting ? <Spinner size="sm" className="text-white" /> : null}
              Sign in with email
            </Button>
          </form>
        ) : (
          <form
            onSubmit={phoneStep === 'request' ? onPhoneRequestSubmit : onPhoneVerifySubmit}
            className="mt-6 grid gap-4"
          >
            <Input
              label="Phone number"
              name="phone"
              type="tel"
              value={phoneForm.phone}
              onChange={onPhoneChange}
              error={phoneErrors.phone}
              placeholder="+15551234567"
              hint="Include your country code so we can send the OTP correctly."
              disabled={phoneStep === 'verify'}
            />

            {phoneStep === 'verify' ? (
              <>
                <Input
                  label="One-time code"
                  name="otp"
                  inputMode="numeric"
                  value={phoneForm.otp}
                  onChange={onPhoneChange}
                  error={phoneErrors.otp}
                  placeholder="Enter your code"
                />
                {phoneDevOtp ? (
                  <p className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    Development code: <span className="font-semibold">{phoneDevOtp}</span>
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setPhoneStep('request')
                    setPhoneErrors({})
                    setPhoneDevOtp('')
                    setPhoneForm((prev) => ({ ...prev, otp: '' }))
                  }}
                  className="text-left text-sm font-semibold text-brand-300 hover:text-brand-200"
                >
                  Use a different phone number
                </button>
              </>
            ) : null}

            <Button
              type="submit"
              size="lg"
              disabled={phoneStep === 'request' ? !canRequestOtp : !canVerifyOtp}
              className="mt-2"
            >
              {submitting ? <Spinner size="sm" className="text-white" /> : null}
              {phoneStep === 'request' ? 'Send verification code' : 'Verify code and sign in'}
            </Button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-slate-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-bold text-brand-300 hover:text-brand-200">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
