import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import useTask from '../../hooks/useTask'
import { uploadFoodPhoto } from '../../lib/api'
import StatusBadge from '../../components/StatusBadge'
import TaskStatusTracker from '../../components/TaskStatusTracker'
import TaskStatusBar from '../../components/TaskStatusBar'
import useRealtime from '../../hooks/useRealtime'
import { useToast } from '../../context/ToastContext'
import PageHeader from '../../components/PageHeader'
import { TaskCardSkeleton } from '../../components/Skeleton'

const PickupDetail = () => {
  const { taskId } = useParams()
  const { getTask, markPickedUp, markDelivered, confirmReceipt } = useTask()
  const [task, setTask] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useToast()

  const loadTask = async () => {
    try {
      const data = await getTask(taskId)
      setTask(data)
    } catch (err) {
      setError(err.message || 'Unable to load task')
      toast.error(err.message || 'Unable to load task')
    }
  }

  useEffect(() => {
    loadTask()
  }, [taskId])

  useRealtime('tasks', 'UPDATE', (payload) => {
    if (payload.new?.id === task?.id) {
      setTask(prev => ({ ...(prev || {}), ...payload.new }))
    }
  })

  const handlePickup = async (event) => {
    try {
      setBusy(true)
      setError('')
      const file = event.target.files?.[0]
      let pickupUrl = null
      if (file) pickupUrl = await uploadFoodPhoto(file)
      await markPickedUp(task.id, pickupUrl)
      toast.success('Marked as picked up. Drive safe!')
      await loadTask()
    } catch (err) {
      setError(err.message || 'Unable to update pickup')
      toast.error(err.message || 'Unable to update pickup')
    } finally {
      setBusy(false)
      event.target.value = ''
    }
  }

  const handleDeliver = async () => {
    try {
      setBusy(true)
      setError('')
      await markDelivered(task.id)
      toast.success('Marked as delivered.')
      await loadTask()
    } catch (err) {
      setError(err.message || 'Unable to mark delivered')
      toast.error(err.message || 'Unable to mark delivered')
    } finally {
      setBusy(false)
    }
  }

  const handleConfirm = async (event) => {
    try {
      setBusy(true)
      setError('')
      const file = event.target.files?.[0]
      let receiptUrl = null
      if (file) receiptUrl = await uploadFoodPhoto(file)
      await confirmReceipt(task.id, receiptUrl)
      toast.success('Receipt confirmed! Thank you for feeding lives.')
      await loadTask()
    } catch (err) {
      setError(err.message || 'Unable to confirm receipt')
      toast.error(err.message || 'Unable to confirm receipt')
    } finally {
      setBusy(false)
      event.target.value = ''
    }
  }

  if (!task) {
    return (
      <section>
        <PageHeader title="Pickup Detail" subtitle="Follow every task stage" />
        <div className="px-4 py-4 md:px-6 md:py-6">
          <TaskCardSkeleton />
        </div>
      </section>
    )
  }

  return (
    <section>
      <PageHeader
        title={task.food_listing?.title || 'Pickup Detail'}
        subtitle="Update pickup and delivery progress in real time"
        action={<Link to="/recipient/pickups" className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50">Back to pickups</Link>}
      />

      <div className="space-y-5 px-4 py-4 md:px-6 md:py-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-gray-600">Task progress</p>
            <StatusBadge status={task.status} />
          </div>
          <TaskStatusBar currentStatus={task.status} />
          <TaskStatusTracker task={task} />
        </div>

        {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">{task.food_listing?.title || 'Food Listing'}</h2>
          <p className="mt-1 text-sm text-gray-600">{task.food_listing?.pickup_address}</p>
          <p className="mt-2 text-sm text-gray-600">Provider: {task.provider?.full_name} ({task.provider?.phone || 'No phone'})</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Task Actions</h2>

          {task.status === 'claimed' ? (
            <label className="mt-4 inline-flex cursor-pointer items-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark">
              {busy ? 'Uploading...' : 'Upload pickup proof and mark picked up'}
              <input type="file" accept="image/*" className="hidden" onChange={handlePickup} disabled={busy} />
            </label>
          ) : null}

          {task.status === 'picked_up' ? (
            <button
              type="button"
              disabled={busy}
              onClick={handleDeliver}
              className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? 'Updating...' : 'Mark as Delivered'}
            </button>
          ) : null}

          {task.status === 'delivered' ? (
            <label className="mt-4 inline-flex cursor-pointer items-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark">
              {busy ? 'Uploading...' : 'Upload receipt and confirm'}
              <input type="file" accept="image/*" className="hidden" onChange={handleConfirm} disabled={busy} />
            </label>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default PickupDetail
