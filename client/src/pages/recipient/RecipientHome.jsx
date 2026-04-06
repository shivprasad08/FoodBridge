import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useTask from '../../hooks/useTask'
import StatusBadge from '../../components/StatusBadge'

const RecipientHome = () => {
  const { getStats, getTasks } = useTask()
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const [statsData, taskData] = await Promise.all([
          getStats(),
          getTasks(),
        ])
        setStats(statsData)
        setRecent((taskData || []).slice(0, 5))
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [getStats, getTasks])

  const Stat = ({ label, value }) => (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value ?? 0}</p>
    </div>
  )

  return (
    <section className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recipient Dashboard</h1>
          <p className="text-sm text-gray-600">Track claims, pickups, and completed deliveries.</p>
        </div>
        <Link
          to="/recipient/browse"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Browse Listings
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Claimed" value={stats?.total_claimed} />
        <Stat label="Confirmed" value={stats?.total_confirmed} />
        <Stat label="Active" value={stats?.total_active} />
        <Stat label="Portions Delivered" value={stats?.total_portions} />
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Recent Tasks</h2>
        </div>
        {loading ? (
          <p className="px-4 py-6 text-sm text-gray-500">Loading tasks...</p>
        ) : recent.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500">No tasks yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recent.map(task => (
              <li key={task.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{task.food_listing?.title || 'Food Listing'}</p>
                    <p className="text-xs text-gray-500">{task.food_listing?.pickup_address || 'Address unavailable'}</p>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default RecipientHome
