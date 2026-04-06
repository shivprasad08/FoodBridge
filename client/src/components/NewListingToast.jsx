import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useNotifications from '../hooks/useNotifications'
import { useAuth } from '../context/AuthContext'

const NewListingToast = () => {
  const { isRecipient } = useAuth()
  const { notifications } = useNotifications()
  const [toast, setToast]   = useState(null)
  const [visible, setVisible] = useState(false)
  const navigate = useNavigate()

  // Watch for new unread new_listing notifications
  useEffect(() => {
    const latest = notifications.find(
      n => n.type === 'new_listing' && !n.is_read
    )
    if (latest && latest.id !== toast?.id) {
      setToast(latest)
      setVisible(true)
      // Auto-dismiss after 8 seconds
      const timer = setTimeout(() => setVisible(false), 8000)
      return () => clearTimeout(timer)
    }
  }, [notifications])

  if (!isRecipient || !visible || !toast) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2
                    z-50 w-full max-w-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl
                      border border-green-100 p-4
                      animate-slide-up">

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍛</span>
            <span className="font-medium text-gray-800 text-sm">
              New food nearby!
            </span>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="text-gray-400 hover:text-gray-600 text-lg
                       leading-none">
            ×
          </button>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-600 mb-3 leading-snug">
          {toast.message}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setVisible(false)
              navigate('/recipient/browse')
            }}
            className="flex-1 py-2 bg-primary text-white
                       text-sm font-medium rounded-lg
                       hover:bg-primary-dark transition-colors">
            Claim Now
          </button>
          <button
            onClick={() => setVisible(false)}
            className="px-4 py-2 bg-gray-100 text-gray-600
                       text-sm rounded-lg hover:bg-gray-200
                       transition-colors">
            Later
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewListingToast
