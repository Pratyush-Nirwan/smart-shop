/* eslint react-refresh/only-export-components: off */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

let toastCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const pushToast = useCallback(
    ({ title, message, type = 'info', durationMs = 3500 }) => {
      const id = `t_${++toastCounter}`
      const toast = { id, title, message, type }
      setToasts((prev) => [toast, ...prev].slice(0, 4))
      window.setTimeout(() => dismiss(id), durationMs)
    },
    [dismiss]
  )

  const value = useMemo(() => ({ pushToast }), [pushToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[360px] max-w-[90vw] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto rounded-xl border border-white/10 bg-slate-900/80 p-4 shadow-soft backdrop-blur"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-50">
                  {t.type === 'success' ? 'Success' : t.type === 'error' ? 'Error' : 'Info'}: {t.title}
                </p>
                {t.message ? (
                  <p className="mt-1 text-sm text-slate-300">{t.message}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-200 hover:bg-white/10"
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

