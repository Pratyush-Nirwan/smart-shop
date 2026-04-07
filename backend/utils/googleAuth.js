import jwt from 'jsonwebtoken'

const GOOGLE_CERTS_URL = 'https://www.googleapis.com/oauth2/v1/certs'
const GOOGLE_ISSUERS = ['accounts.google.com', 'https://accounts.google.com']
const CERT_CACHE_TTL_MS = 60 * 60 * 1000

let cachedCerts = null
let cachedAt = 0

async function fetchGoogleCerts(forceRefresh = false) {
  if (!forceRefresh && cachedCerts && Date.now() - cachedAt < CERT_CACHE_TTL_MS) {
    return cachedCerts
  }

  const response = await fetch(GOOGLE_CERTS_URL)
  if (!response.ok) {
    throw new Error('Unable to fetch Google signing certificates.')
  }

  cachedCerts = await response.json()
  cachedAt = Date.now()
  return cachedCerts
}

function getGoogleClientId() {
  return process.env.GOOGLE_CLIENT_ID?.trim()
}

export async function verifyGoogleCredential(credential) {
  const clientId = getGoogleClientId()
  if (!clientId) {
    throw new Error('Google sign-in is not configured on the server.')
  }

  const decoded = jwt.decode(credential, { complete: true })
  const kid = decoded?.header?.kid

  if (!kid) {
    throw new Error('Invalid Google credential.')
  }

  let certs = await fetchGoogleCerts()
  let cert = certs[kid]

  if (!cert) {
    certs = await fetchGoogleCerts(true)
    cert = certs[kid]
  }

  if (!cert) {
    throw new Error('Unable to verify Google credential.')
  }

  const payload = jwt.verify(credential, cert, {
    algorithms: ['RS256'],
    audience: clientId,
    issuer: GOOGLE_ISSUERS,
  })

  if (!payload?.email || payload.email_verified !== true) {
    throw new Error('Google account email is not verified.')
  }

  return payload
}
