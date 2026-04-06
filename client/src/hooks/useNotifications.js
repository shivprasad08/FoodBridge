import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../lib/api'

const useNotifications = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [loading, setLoading]             = useState(true)

  // Initial fetch
  useEffect(() => {
    if (!user) return
    fetchNotifications()
  }, [user])

  // Update unread count whenever notifications change
  useEffect(() => {
    setUnreadCount(
      notifications.filter(n => !n.is_read).length
    )
  }, [notifications])

  const fetchNotifications = async () => {
    if (!user) return

    try {
      setLoading(true)
      const payload = await apiFetch('/api/notifications?limit=30')
      setNotifications(payload.data || [])
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  // Mark single notification as read
  const markAsRead = async (notificationId) => {
    try {
      await apiFetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      })
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      )
    } catch {
      // Keep UI responsive even if request fails silently.
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await apiFetch('/api/notifications/read-all', {
        method: 'PATCH',
      })
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      )
    } catch {
      // Keep UI responsive even if request fails silently.
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  }
}

export default useNotifications
