import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../lib/api'
import PageHeader from '../../components/PageHeader'
import { StatCardSkeleton } from '../../components/Skeleton'
import EmptyState from '../../components/EmptyState'
import { useToast } from '../../context/ToastContext'

const ProviderOverview = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const payload = await apiFetch('/api/listings/stats')
        setStats(payload.data)
      } catch (err) {
        const message = err.message || 'Unable to load stats'
        setError(message)
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [toast])

  return (
    <section>
      <PageHeader
        title="Provider Overview"
        subtitle="Track listing impact and active food donations"
        action={
          <button
            type="button"
            onClick={() => navigate('/provider/post')}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Post Food
          </button>
        }
      />

      <div className="px-4 py-4 md:px-6 md:py-6">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <StatCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        ) : !stats ? (
          <EmptyState
            icon="Chart"
            title="No stats available"
            description="Your overview metrics will appear after you start posting listings."
            actionLabel="Post Food Now"
            onAction={() => navigate('/provider/post')}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Posted" value={stats.total_posted} note="All time" />
            <StatCard label="Completed" value={stats.total_completed} note="Delivered" />
            <StatCard label="Active" value={stats.total_active} note="Live now" />
            <StatCard label="Portions" value={stats.total_portions} note="Donated" />
          </div>
        )}
      </div>
    </section>
  )
}

const StatCard = ({ label, value, note }) => (
  <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <p className="text-sm font-medium text-gray-600">{label}</p>
    <p className="mt-2 text-3xl font-bold text-primary">{value || 0}</p>
    <p className="mt-1 text-xs text-gray-400">{note}</p>
  </article>
)

export default ProviderOverview
