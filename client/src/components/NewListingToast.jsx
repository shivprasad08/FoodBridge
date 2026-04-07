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
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4
                    md:left-1/2 md:-translate-x-1/2
                    z-50 md:w-full md:max-w-sm">
      <div className="bg-white rounded-2xl shadow-xl
                      border border-green-100 p-4
                      animate-slide-up">

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">Food</span>
            <span className="font-medium text-gray-800 text-sm">
              New food nearby!
            </span>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="text-gray-400 hover:text-gray-600 text-lg
                       leading-none min-h-[44px] min-w-[44px]
                       flex items-center justify-center">
            X
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
            className="flex-1 py-3 bg-primary text-white
                       text-sm font-medium rounded-lg
                       hover:bg-primary-dark transition-colors
                       min-h-[44px] text-base">
            Claim Now
          </button>
          <button
            onClick={() => setVisible(false)}
            className="px-4 py-3 bg-gray-100 text-gray-600
                       text-sm rounded-lg hover:bg-gray-200
                       transition-colors min-h-[44px] text-base">
            Later
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewListingToast
