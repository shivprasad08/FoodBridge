import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useTask from '../../hooks/useTask'
import StatusBadge from '../../components/StatusBadge'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'
import { StatCardSkeleton, TaskCardSkeleton } from '../../components/Skeleton'

const RecipientHome = () => {
  const navigate = useNavigate()
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
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value ?? 0}</p>
    </div>
  )

  return (
    <section>
      <PageHeader
        title="Recipient Dashboard"
        subtitle="Track claims, pickups, and completed deliveries"
        action={
          <Link to="/recipient/browse" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark">
            Browse Listings
          </Link>
        }
      />

      <div className="px-4 py-4 md:px-6 md:py-6">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <StatCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-4">
            <Stat label="Claimed" value={stats?.total_claimed} />
            <Stat label="Confirmed" value={stats?.total_confirmed} />
            <Stat label="Active" value={stats?.total_active} />
            <Stat label="Portions Delivered" value={stats?.total_portions} />
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-900">Recent Tasks</h2>
          </div>
          {loading ? (
            <div className="space-y-3 p-4">
              {[...Array(3)].map((_, index) => (
                <TaskCardSkeleton key={index} />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <EmptyState
              icon="Box"
              title="No active pickups"
              description="Claim a listing from Browse Food to start a pickup."
              actionLabel="Browse Food"
              onAction={() => navigate('/recipient/browse')}
            />
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
      </div>
    </section>
  )
}

export default RecipientHome
