import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import useTask from '../../hooks/useTask'
import StatusBadge from '../../components/StatusBadge'

const activeStatuses = ['claimed', 'picked_up', 'delivered']

const MyPickups = () => {
  const { getTasks } = useTask()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const data = await getTasks()
        setTasks(data || [])
      } catch (err) {
        setError(err.message || 'Unable to load pickups')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [getTasks])

  const active = useMemo(
    () => tasks.filter(task => activeStatuses.includes(task.status)),
    [tasks]
  )

  return (
    <section className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Pickups</h1>
        <p className="text-sm text-gray-600">Manage active claims and update pickup status.</p>
      </div>

      {error ? <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-gray-500">Loading your tasks...</p>
      ) : active.length === 0 ? (
        <p className="text-sm text-gray-500">No active pickups right now.</p>
      ) : (
        <div className="space-y-3">
          {active.map(task => (
            <article key={task.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-gray-900">{task.food_listing?.title || 'Food Listing'}</p>
                  <p className="text-sm text-gray-600">{task.food_listing?.pickup_address}</p>
                </div>
                <StatusBadge status={task.status} />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-gray-500">Claimed at: {task.claimed_at ? new Date(task.claimed_at).toLocaleString() : 'N/A'}</p>
                <Link
                  to={`/recipient/pickups/${task.id}`}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Open Task
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default MyPickups
