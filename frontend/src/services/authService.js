const AUTH_API = 'http://localhost:5000/api/auth'

async function request(path, options = {}) {
  const response = await fetch(`${AUTH_API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Authentication request failed.')
  }

  return data
}

export async function login({ email, password }) {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function register({ name, email, password, phone }) {
  return request('/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, phone }),
  })
}

export async function requestPhoneOtp({ name, phone, mode }) {
  return request('/phone/request-otp', {
    method: 'POST',
    body: JSON.stringify({ name, phone, mode }),
  })
}

export async function verifyPhoneOtp({ name, phone, otp, mode }) {
  return request('/phone/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ name, phone, otp, mode }),
  })
}

export async function authenticateWithGoogle({ credential }) {
  return request('/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  })
}

