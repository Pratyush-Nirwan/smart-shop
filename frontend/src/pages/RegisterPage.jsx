import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email ?? '').trim())
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const { pushToast } = useToast()

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = useMemo(() => {
    return !submitting && form.name.trim() && form.email.trim() && form.password.trim()
  }, [form.name, form.email, form.password, submitting])

  function onChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function validate() {
    const next = {}
    if (!form.name.trim()) next.name = 'Name is required.'
    if (!form.email.trim()) next.email = 'Email is required.'
    else if (!validateEmail(form.email)) next.email = 'Enter a valid email address.'
    if (!form.password.trim()) next.password = 'Password is required.'
    else if (form.password.length < 6) next.password = 'Password must be at least 6 characters.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const res = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      pushToast({ title: 'Account created', message: `Welcome, ${res.user.name}`, type: 'success' })
      navigate('/profile')
    } catch {
      pushToast({ title: 'Registration failed', message: 'Please try again.', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card md:p-8">
        <h1 className="text-2xl font-extrabold text-white">Create your SmartShop account</h1>
        <p className="mt-2 text-sm text-slate-300">JWT based auth form UI (demo). All data is stored locally.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() => pushToast({ title: 'Google sign-up UI', message: 'Social login UI only.', type: 'info' })}
          >
            Continue with Google
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => pushToast({ title: 'GitHub sign-up UI', message: 'Social login UI only.', type: 'info' })}
          >
            Continue with GitHub
          </Button>
        </div>

        <div className="mt-5 border-t border-white/10 pt-5">
          <form onSubmit={onSubmit} className="grid gap-4">
            <Input
              label="Name"
              name="name"
              value={form.name}
              onChange={onChange}
              error={errors.name}
              placeholder="Your name"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              error={errors.email}
              placeholder="you@company.com"
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              error={errors.password}
              placeholder="At least 6 characters"
            />

            <Button type="submit" size="lg" disabled={!canSubmit} className="mt-2">
              {submitting ? <Spinner size="sm" /> : null}
              Create account
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-300 hover:text-brand-200">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

