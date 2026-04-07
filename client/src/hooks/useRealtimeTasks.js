import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import useRealtime from './useRealtime'

const useRealtimeTasks = (filters = {}) => {
  const { user, profile } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchTasks = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()
      if (filters.status) params.set('status', filters.status)
      if (filters.limit) params.set('limit', String(filters.limit))
      const suffix = params.toString() ? `?${params.toString()}` : ''

      const payload = await apiFetch(`/api/tasks${suffix}`)
      setTasks(payload.data || [])
    } catch (err) {
      setError(err.message || 'Unable to load tasks')
    } finally {
      setLoading(false)
    }
  }, [filters.limit, filters.status, user])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  useRealtime('tasks', 'UPDATE', (payload) => {
    const nextTask = payload.new
    setTasks(prev => {
      const found = prev.some(task => task.id === nextTask.id)
      if (!found) {
        fetchTasks()
        return prev
      }
      return prev.map(task => (task.id === nextTask.id ? { ...task, ...nextTask } : task))
    })
  })

  useRealtime('tasks', 'INSERT', () => {
    if (profile?.role === 'provider' || profile?.role === 'recipient') {
      fetchTasks()
    }
  })

  return { tasks, loading, error, refetch: fetchTasks, setTasks }
}

export default useRealtimeTasks
