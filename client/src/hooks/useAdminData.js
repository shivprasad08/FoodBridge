import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import { useToast } from '../context/ToastContext'

const buildQuery = (params = {}) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value))
    }
  })
  const text = search.toString()
  return text ? `?${text}` : ''
}

const useAdminData = () => {
  const { toast } = useToast()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [usersTotal, setUsersTotal] = useState(0)
  const [listings, setListings] = useState([])
  const [listingsTotal, setListingsTotal] = useState(0)
  const [tasks, setTasks] = useState([])
  const [tasksTotal, setTasksTotal] = useState(0)
  const [auditLogs, setAuditLogs] = useState([])
  const [auditTotal, setAuditTotal] = useState(0)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const request = useCallback(async (path, options = {}) => {
    try {
      setError('')
      return await apiFetch(path, options)
    } catch (err) {
      const message = err.message || 'Request failed'
      setError(message)
      toast.error(message)
      throw err
    }
  }, [toast])

  const refetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const payload = await request('/api/admin/stats')
      setStats(payload.data)
    } finally {
      setLoading(false)
    }
  }, [request])

  const refetchUsers = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const payload = await request(`/api/admin/users${buildQuery(params)}`)
      setUsers(payload.data || [])
      setUsersTotal(payload.total || 0)
    } finally {
      setLoading(false)
    }
  }, [request])

  const refetchListings = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const payload = await request(`/api/admin/listings${buildQuery(params)}`)
      setListings(payload.data || [])
      setListingsTotal(payload.total || 0)
    } finally {
      setLoading(false)
    }
  }, [request])

  const refetchTasks = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const payload = await request(`/api/admin/tasks${buildQuery(params)}`)
      setTasks(payload.data || [])
      setTasksTotal(payload.total || 0)
    } finally {
      setLoading(false)
    }
  }, [request])

  const refetchAuditLogs = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const payload = await request(`/api/admin/audit-logs${buildQuery(params)}`)
      setAuditLogs(payload.data || [])
      setAuditTotal(payload.total || 0)
    } finally {
      setLoading(false)
    }
  }, [request])

  const refetchAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      const payload = await request('/api/admin/analytics')
      setAnalytics(payload.data)
    } finally {
      setLoading(false)
    }
  }, [request])

  const verifyUser = useCallback(async (userId) => {
    const payload = await request(`/api/admin/users/${userId}/verify`, { method: 'PATCH' })
    toast.success('User verified successfully!')
    return payload.data
  }, [request, toast])

  const suspendUser = useCallback(async (userId, reason) => {
    const payload = await request(`/api/admin/users/${userId}/suspend`, {
      method: 'PATCH',
      body: JSON.stringify(reason ? { reason } : {}),
    })
    toast.success('User suspended successfully.')
    return payload.data
  }, [request, toast])

  const overrideTask = useCallback(async (taskId, status, note) => {
    const payload = await request(`/api/admin/tasks/${taskId}/override`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    })
    toast.success(`Task status updated to ${status}`)
    return payload.data
  }, [request, toast])

  useEffect(() => {
    refetchStats().catch(() => {})
  }, [refetchStats])

  return {
    stats,
    users,
    usersTotal,
    listings,
    listingsTotal,
    tasks,
    tasksTotal,
    auditLogs,
    auditTotal,
    analytics,
    loading,
    error,
    verifyUser,
    suspendUser,
    overrideTask,
    refetchStats,
    refetchUsers,
    refetchListings,
    refetchTasks,
    refetchAuditLogs,
    refetchAnalytics,
  }
}

export default useAdminData
