import { useEffect, useRef, useState } from 'react'
import Button from '../ui/Button'

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

let googleScriptPromise
let initializedClientId = null

function loadGoogleScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google sign-in is only available in the browser.'))
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve()
  }

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`)

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true })
        existingScript.addEventListener(
          'error',
          () => reject(new Error('Failed to load Google sign-in.')),
          { once: true }
        )
        return
      }

      const script = document.createElement('script')
      script.src = GOOGLE_SCRIPT_SRC
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Google sign-in.'))
      document.head.appendChild(script)
    })
  }

  return googleScriptPromise
}

export default function GoogleAuthButton({
  text = 'continue_with',
  disabled = false,
  onCredential,
}) {
  const containerRef = useRef(null)
  const callbackRef = useRef(onCredential)
  const [ready, setReady] = useState(false)

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  useEffect(() => {
    callbackRef.current = onCredential
  }, [onCredential])

  useEffect(() => {
    const containerElement = containerRef.current

    if (!clientId || disabled || !containerElement) {
      return undefined
    }

    let cancelled = false

    loadGoogleScript()
      .then(() => {
        if (cancelled || !containerElement || !window.google?.accounts?.id) {
          return
        }

        if (initializedClientId !== clientId) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: ({ credential }) => {
              if (credential) {
                callbackRef.current?.(credential)
              }
            },
          })
          initializedClientId = clientId
        }

        containerElement.innerHTML = ''
        window.google.accounts.id.renderButton(containerElement, {
          theme: 'outline',
          size: 'large',
          text,
          shape: 'pill',
        })

        setReady(true)
      })
      .catch(() => {
        if (!cancelled) {
          setReady(false)
        }
      })

    return () => {
      cancelled = true
      if (containerElement) {
        containerElement.innerHTML = ''
      }
    }
  }, [clientId, disabled, text])

  if (!clientId) {
    return (
      <div className="grid gap-2">
        <Button type="button" variant="secondary" size="lg" className="w-full" disabled>
          Continue with Google
        </Button>
        <p className="text-xs text-slate-400">
          Set <code>VITE_GOOGLE_CLIENT_ID</code> to enable Google sign-in.
        </p>
      </div>
    )
  }

  if (disabled) {
    return (
      <Button type="button" variant="secondary" size="lg" className="w-full" disabled>
        Continue with Google
      </Button>
    )
  }

  return (
    <div className="grid gap-2">
      {!ready ? (
        <Button type="button" variant="secondary" size="lg" className="w-full" disabled>
          Loading Google sign-in...
        </Button>
      ) : null}
      <div ref={containerRef} className={ready ? 'w-full' : 'hidden'} />
    </div>
  )
}
