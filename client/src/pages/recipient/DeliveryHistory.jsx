import { useEffect, useMemo, useState } from 'react'
import useTask from '../../hooks/useTask'
import StatusBadge from '../../components/StatusBadge'

const DeliveryHistory = () => {
  const { getTasks } = useTask()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const data = await getTasks('confirmed')
        setTasks(data || [])
      } catch (err) {
        setError(err.message || 'Unable to load history')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [getTasks])

  const totalPortions = useMemo(() => (
    tasks.reduce((sum, item) => sum + (item.food_listing?.quantity_number || 0), 0)
  ), [tasks])

  return (
    <section className="p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery History</h1>
          <p className="text-sm text-gray-600">Completed confirmations and impact delivered by your NGO.</p>
        </div>
        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Total portions delivered: <span className="font-bold">{totalPortions}</span>
        </div>
      </div>

      {error ? <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-gray-500">Loading history...</p>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-gray-500">No confirmed deliveries yet.</p>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <article key={task.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-gray-900">{task.food_listing?.title || 'Food Listing'}</p>
                  <p className="text-sm text-gray-600">Delivered on {task.confirmed_at ? new Date(task.confirmed_at).toLocaleDateString() : 'N/A'}</p>
                </div>
                <StatusBadge status={task.status} />
              </div>
              <p className="mt-2 text-sm text-gray-600">{task.food_listing?.quantity_number || 0} portions • {task.food_listing?.pickup_address}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default DeliveryHistory
