import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import useTask from '../../hooks/useTask'
import { uploadFoodPhoto } from '../../lib/api'
import StatusBadge from '../../components/StatusBadge'
import TaskStatusTracker from '../../components/TaskStatusTracker'

const PickupDetail = () => {
  const { taskId } = useParams()
  const { getTask, markPickedUp, markDelivered, confirmReceipt } = useTask()
  const [task, setTask] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadTask = async () => {
    try {
      const data = await getTask(taskId)
      setTask(data)
    } catch (err) {
      setError(err.message || 'Unable to load task')
    }
  }

  useEffect(() => {
    loadTask()
  }, [taskId])

  const handlePickup = async (event) => {
    try {
      setBusy(true)
      setError('')
      setSuccess('')
      const file = event.target.files?.[0]
      let pickupUrl = null
      if (file) pickupUrl = await uploadFoodPhoto(file)
      await markPickedUp(task.id, pickupUrl)
      setSuccess('Task marked as picked up.')
      await loadTask()
    } catch (err) {
      setError(err.message || 'Unable to update pickup')
    } finally {
      setBusy(false)
      event.target.value = ''
    }
  }

  const handleDeliver = async () => {
    try {
      setBusy(true)
      setError('')
      setSuccess('')
      await markDelivered(task.id)
      setSuccess('Task marked as delivered.')
      await loadTask()
    } catch (err) {
      setError(err.message || 'Unable to mark delivered')
    } finally {
      setBusy(false)
    }
  }

  const handleConfirm = async (event) => {
    try {
      setBusy(true)
      setError('')
      setSuccess('')
      const file = event.target.files?.[0]
      let receiptUrl = null
      if (file) receiptUrl = await uploadFoodPhoto(file)
      await confirmReceipt(task.id, receiptUrl)
      setSuccess('Task confirmed and completed.')
      await loadTask()
    } catch (err) {
      setError(err.message || 'Unable to confirm receipt')
    } finally {
      setBusy(false)
      event.target.value = ''
    }
  }

  if (!task) {
    return <section className="p-6 text-sm text-gray-500">Loading task...</section>
  }

  return (
    <section className="space-y-5 p-6">
      <div className="flex items-center justify-between">
        <Link to="/recipient/pickups" className="text-sm text-emerald-700 hover:underline">Back to pickups</Link>
        <StatusBadge status={task.status} />
      </div>

      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {success ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

      <TaskStatusTracker status={task.status} />

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h1 className="text-xl font-bold text-gray-900">{task.food_listing?.title || 'Food Listing'}</h1>
        <p className="mt-1 text-sm text-gray-600">{task.food_listing?.pickup_address}</p>
        <p className="mt-2 text-sm text-gray-600">Provider: {task.provider?.full_name} ({task.provider?.phone || 'No phone'})</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900">Task Actions</h2>

        {task.status === 'claimed' ? (
          <label className="mt-4 inline-flex cursor-pointer items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            {busy ? 'Uploading...' : 'Upload pickup proof & mark picked up'}
            <input type="file" accept="image/*" className="hidden" onChange={handlePickup} disabled={busy} />
          </label>
        ) : null}

        {task.status === 'picked_up' ? (
          <button
            type="button"
            disabled={busy}
            onClick={handleDeliver}
            className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
          >
            {busy ? 'Updating...' : 'Mark Delivered'}
          </button>
        ) : null}

        {task.status === 'delivered' ? (
          <label className="mt-4 inline-flex cursor-pointer items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
            {busy ? 'Uploading...' : 'Upload receipt & confirm'}
            <input type="file" accept="image/*" className="hidden" onChange={handleConfirm} disabled={busy} />
          </label>
        ) : null}
      </div>
    </section>
  )
}

export default PickupDetail
