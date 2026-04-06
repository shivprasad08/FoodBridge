import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useNotifications from '../hooks/useNotifications'

const NotificationBell = () => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  } = useNotifications()

  return (
    <div className="relative">

      {/* Bell button with badge */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-100
                   transition-colors">
        {/* Bell SVG icon */}
        <svg className="w-6 h-6 text-gray-600" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118
               14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0
               10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0
               .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3
               0 11-6 0v-1m6 0H9"/>
        </svg>

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5
                           bg-red-500 text-white text-xs
                           rounded-full flex items-center
                           justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-12 w-80
                          bg-white rounded-xl shadow-lg
                          border border-gray-100 z-20
                          max-h-96 overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between
                            px-4 py-3 border-b border-gray-100">
              <h3 className="font-medium text-gray-800">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary
                             hover:underline">
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification list */}
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center
                              text-sm text-gray-400">
                No notifications yet
              </div>
            ) : (
              notifications.map(notif => (
                <NotificationItem
                  key={notif.id}
                  notification={notif}
                  onRead={() => markAsRead(notif.id)}
                  onNavigate={(path) => {
                    setOpen(false)
                    navigate(path)
                  }}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

// Individual notification row
const NotificationItem = ({ notification, onRead, onNavigate }) => {
  const icons = {
    new_listing:     '🍛',
    listing_claimed: '🔵',
    picked_up:       '🚗',
    delivered:       '📦',
    confirmed:       '✅',
    listing_expired: '⏰',
    account_verified:'✅',
  }

  const handleClick = () => {
    onRead()
    // Navigate to relevant page
    if (notification.listing_id) {
      onNavigate(`/recipient/listings/${notification.listing_id}`)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`px-4 py-3 border-b border-gray-50
                  cursor-pointer hover:bg-gray-50
                  transition-colors
                  ${!notification.is_read ? 'bg-green-50' : ''}`}>
      <div className="flex gap-3">
        <span className="text-lg flex-shrink-0">
          {icons[notification.type] || '🔔'}
        </span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm leading-snug
                         ${!notification.is_read
                           ? 'text-gray-800 font-medium'
                           : 'text-gray-600'}`}>
            {notification.message}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {formatTimeAgo(notification.created_at)}
          </p>
        </div>
        {!notification.is_read && (
          <div className="w-2 h-2 bg-primary rounded-full
                          flex-shrink-0 mt-1" />
        )}
      </div>
    </div>
  )
}

// Time ago formatter
const formatTimeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)

  if (mins < 1)   return 'Just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default NotificationBell
