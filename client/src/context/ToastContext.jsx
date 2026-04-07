import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext({ toast: null })

const typeStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
}

const typeIcons = {
  success: 'Success',
  error: 'Error',
  info: 'Info',
  warning: 'Warning',
}

const ToastItem = ({ toast, onClose }) => {
  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-md transition-all ${typeStyles[toast.type] || typeStyles.info}`}
      role="status"
      aria-live="polite"
    >
      <span className="text-xs font-semibold uppercase tracking-wide">{typeIcons[toast.type] || 'Info'}</span>
      <p className="flex-1 text-sm leading-snug">{toast.message}</p>
      <button
        type="button"
        onClick={onClose}
        className="text-lg leading-none opacity-50 transition-opacity hover:opacity-100"
        aria-label="Dismiss notification"
      >
        x
      </button>
    </div>
  )
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])

    window.setTimeout(() => {
      setToasts(prev => prev.filter(item => item.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(item => item.id !== id))
  }, [])

  const value = useMemo(
    () => ({
      toast: {
        success: (message, duration) => addToast(message, 'success', duration || 4000),
        error: (message, duration) => addToast(message, 'error', duration || 6000),
        info: (message, duration) => addToast(message, 'info', duration || 4000),
        warning: (message, duration) => addToast(message, 'warning', duration || 4000),
      },
    }),
    [addToast]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex w-full max-w-sm flex-col gap-2 px-4 md:px-0">
        {toasts.map(item => (
          <ToastItem key={item.id} toast={item} onClose={() => removeToast(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
