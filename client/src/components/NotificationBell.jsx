import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useNotifications from '../hooks/useNotifications'
import EmptyState from './EmptyState'
import { NotificationSkeleton } from './Skeleton'

const NotificationBell = () => {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead
  } = useNotifications()

  return (
    <div className="relative z-50">

      {/* Bell button with badge */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-100
                   transition-colors min-h-[44px] min-w-[44px]
                   flex items-center justify-center">
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

      {/* Dropdown panel - both mobile and desktop */}
      {open && (
        <>
          {/* Backdrop - mobile only */}
          <div
            className="md:hidden fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />

          {/* Panel - centered on both mobile and desktop */}
          <div
            ref={dropdownRef}
            className="fixed md:absolute
                      bottom-20 md:bottom-auto md:top-full
                      left-1/2 -translate-x-1/2
                      md:left-1/2 md:-translate-x-1/2
                      md:mt-2 md:w-80
                      z-20
                      bg-white shadow-lg md:shadow-xl rounded-lg
                      border border-gray-100
                      max-h-96
                      overflow-hidden
                      flex flex-col
                      w-[calc(100%-2rem)]">

            {/* Header */}
            <div className="flex items-center justify-between
                            px-4 py-3 border-b border-gray-100
                            bg-white flex-shrink-0 gap-2">
              <h3 className="font-medium text-gray-800 flex-1 min-w-0">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary
                             hover:underline whitespace-nowrap
                             flex-shrink-0">
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification list - scrollable */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {loading ? (
                <div>
                  {[...Array(3)].map((_, index) => (
                    <NotificationSkeleton key={index} />
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <EmptyState
                  icon="Bell"
                  title="No notifications yet"
                  description="You'll be notified when food is posted near you."
                />
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
          </div>
        </>
      )}
    </div>
  )
}

// Individual notification row
const NotificationItem = ({ notification, onRead, onNavigate }) => {
  const icons = {
    new_listing:     'Food',
    listing_claimed: 'Claimed',
    picked_up:       'Car',
    delivered:       'Box',
    confirmed:       'Check',
    listing_expired: 'Clock',
    account_verified:'Check',
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
                  transition-colors min-h-[44px] flex gap-3
                  ${!notification.is_read ? 'bg-green-50' : ''}`}>
      <span className="text-base flex-shrink-0 font-medium text-gray-500 pt-0.5">
        {icons[notification.type] || 'Bell'}
      </span>
      <div className="flex-1 min-w-0 text-sm">
        <p className={`leading-snug break-words
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
