import { useEffect, useMemo, useState } from 'react'
import useTask from '../../hooks/useTask'
import StatusBadge from '../../components/StatusBadge'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'
import { TaskCardSkeleton } from '../../components/Skeleton'

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
    <section>
      <PageHeader
        title="Delivery History"
        subtitle="Completed confirmations and impact delivered by your NGO"
        action={
          <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Total portions delivered: <span className="font-bold">{totalPortions}</span>
          </div>
        }
      />

      <div className="px-4 py-4 md:px-6 md:py-6">
        {error ? <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <TaskCardSkeleton key={index} />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon="Clock"
            title="No delivery history yet"
            description="Your completed pickups will appear here."
          />
        ) : (
          <div className="space-y-3">
            {tasks.map(task => (
              <article key={task.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-gray-900">{task.food_listing?.title || 'Food Listing'}</p>
                    <p className="text-sm text-gray-600">Delivered on {task.confirmed_at ? new Date(task.confirmed_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
                <p className="mt-2 text-sm text-gray-600">{task.food_listing?.quantity_number || 0} portions - {task.food_listing?.pickup_address}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default DeliveryHistory
