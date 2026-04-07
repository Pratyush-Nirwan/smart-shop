function wait(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function login({ email }) {
  await wait(650)
  const role = email.toLowerCase().includes('admin') ? 'admin' : 'customer'
  const token = btoa(`${email}:${Date.now()}`)
  return {
    token,
    user: {
      id: `u_${Date.now()}`,
      email,
      name: email.split('@')[0],
      role,
      createdAt: new Date().toISOString(),
    },
  }
}

export async function register({ name, email }) {
  await wait(750)
  const token = btoa(`${email}:${Date.now()}`)
  return {
    token,
    user: {
      id: `u_${Date.now()}`,
      email,
      name,
      role: 'customer',
      createdAt: new Date().toISOString(),
    },
  }
}

