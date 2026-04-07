import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useTask from '../../hooks/useTask'
import StatusBadge from '../../components/StatusBadge'
import EmptyState from '../../components/EmptyState'
import PageHeader from '../../components/PageHeader'
import { TaskCardSkeleton } from '../../components/Skeleton'

const activeStatuses = ['claimed', 'picked_up', 'delivered']

const MyPickups = () => {
  const navigate = useNavigate()
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
    <section>
      <PageHeader title="My Pickups" subtitle="Manage active claims and update pickup status" />

      <div className="px-4 py-4 md:px-6 md:py-6">
        {error ? <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <TaskCardSkeleton key={index} />
            ))}
          </div>
        ) : active.length === 0 ? (
          <EmptyState
            icon="Box"
            title="No active pickups"
            description="Claim a listing from Browse Food to start a pickup."
            actionLabel="Browse Food"
            onAction={() => navigate('/recipient/browse')}
          />
        ) : (
          <div className="space-y-3">
            {active.map(task => (
              <article key={task.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
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
                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Open Task
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default MyPickups
