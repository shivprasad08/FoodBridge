import { useCallback, useMemo, useState } from 'react'
import { apiFetch } from '../lib/api'

const useTask = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const wrap = useCallback(async (action) => {
    try {
      setLoading(true)
      setError('')
      return await action()
    } catch (err) {
      const message = err?.message || 'Operation failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getTasks = useCallback(async (status) => {
    const search = new URLSearchParams()
    if (status) search.set('status', status)
    const suffix = search.toString() ? `?${search.toString()}` : ''
    const payload = await apiFetch(`/api/tasks${suffix}`)
    return payload.data || []
  }, [])

  const getTask = useCallback(async (taskId) => {
    const payload = await apiFetch(`/api/tasks/${taskId}`)
    return payload.data
  }, [])

  const claimTask = useCallback((taskId, assignedTo) => wrap(async () => {
    const payload = await apiFetch(`/api/tasks/${taskId}/claim`, {
      method: 'PATCH',
      body: JSON.stringify(assignedTo ? { assigned_to: assignedTo } : {}),
    })
    return payload.data
  }), [wrap])

  const markPickedUp = useCallback((taskId, pickupPhotoUrl) => wrap(async () => {
    const payload = await apiFetch(`/api/tasks/${taskId}/pickup`, {
      method: 'PATCH',
      body: JSON.stringify(pickupPhotoUrl ? { pickup_photo_url: pickupPhotoUrl } : {}),
    })
    return payload.data
  }), [wrap])

  const markDelivered = useCallback((taskId) => wrap(async () => {
    const payload = await apiFetch(`/api/tasks/${taskId}/deliver`, {
      method: 'PATCH',
    })
    return payload.data
  }), [wrap])

  const confirmReceipt = useCallback((taskId, receiptPhotoUrl, assignedTo) => wrap(async () => {
    const body = {}
    if (receiptPhotoUrl) body.receipt_photo_url = receiptPhotoUrl
    if (assignedTo) body.assigned_to = assignedTo

    const payload = await apiFetch(`/api/tasks/${taskId}/confirm`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
    return payload.data
  }), [wrap])

  const getStats = useCallback(async () => {
    const payload = await apiFetch('/api/tasks/stats')
    return payload.data
  }, [])

  return useMemo(() => ({
    loading,
    error,
    setError,
    getTasks,
    getTask,
    claimTask,
    markPickedUp,
    markDelivered,
    confirmReceipt,
    getStats,
  }), [loading, error, getTasks, getTask, claimTask, markPickedUp, markDelivered, confirmReceipt, getStats])
}

export default useTask
