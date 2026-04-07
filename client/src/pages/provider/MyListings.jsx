import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useRealtimeTasks from '../../hooks/useRealtimeTasks'
import { apiFetch } from '../../lib/api'
import StatusBadge from '../../components/StatusBadge'
import PageHeader from '../../components/PageHeader'
import { ListingCardSkeleton } from '../../components/Skeleton'
import EmptyState from '../../components/EmptyState'
import ConfirmDialog from '../../components/ConfirmDialog'
import ExpiryCountdown from '../../components/ExpiryCountdown'
import { useToast } from '../../context/ToastContext'

const MyListings = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { tasks, loading, error, refetch, setTasks } = useRealtimeTasks()
  const [confirmCancel, setConfirmCancel] = useState(null)
  const [busyId, setBusyId] = useState('')

  const listingTasks = useMemo(() => {
    return (tasks || [])
      .filter(task => task?.food_listing)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [tasks])

  const handleCancel = async (listingId) => {
    try {
      setBusyId(listingId)
      await apiFetch(`/api/listings/${listingId}/cancel`, { method: 'PATCH' })
      toast.success('Listing cancelled successfully.')
      await refetch()
    } catch (err) {
      toast.error(err.message || 'Failed to cancel listing')
    } finally {
      setBusyId('')
    }
  }

  const removeExpired = (listingId) => {
    setTasks(prev => prev.filter(task => task.food_listing?.id !== listingId))
  }

  return (
    <section>
      <PageHeader
        title="My Listings"
        subtitle="Monitor posted food and live task updates"
        action={
          <Link to="/provider/post" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark">
            Post Food
          </Link>
        }
      />

      <div className="px-4 py-4 md:px-6 md:py-6">
        {error ? <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(4)].map((_, index) => (
              <ListingCardSkeleton key={index} />
            ))}
          </div>
        ) : listingTasks.length === 0 ? (
          <EmptyState
            icon="Plus"
            title="No active listings"
            description="Post your first surplus food listing and help feed someone today."
            actionLabel="Post Food Now"
            onAction={() => navigate('/provider/post')}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {listingTasks.map(task => {
              const listing = task.food_listing
              const isBusy = busyId === listing.id
              return (
                <article key={task.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{listing.title}</h2>
                      <p className="mt-1 text-sm text-gray-600">{listing.food_type} - {listing.quantity}</p>
                    </div>
                    <StatusBadge status={task.status || listing.status} />
                  </div>

                  <p className="text-sm text-gray-600">Portions: {listing.quantity_number || 0}</p>
                  <p className="mt-1 text-sm text-gray-600">Pickup: {listing.pickup_address || 'N/A'}</p>

                  <div className="mt-3">
                    <ExpiryCountdown expiryTime={listing.expiry_time} onExpired={() => removeExpired(listing.id)} />
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link
                      to={`/provider/listings/${listing.id}`}
                      className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-center text-sm text-gray-600 hover:bg-gray-50"
                    >
                      View Detail
                    </Link>
                    <button
                      type="button"
                      disabled={isBusy || task.status !== 'available'}
                      onClick={() => setConfirmCancel(listing.id)}
                      className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isBusy ? 'Cancelling...' : 'Cancel'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirmCancel}
        title="Cancel listing?"
        message="This listing will be marked as cancelled. NGOs will no longer see it. This cannot be undone."
        confirmLabel="Yes, Cancel"
        cancelLabel="Keep it"
        dangerous={true}
        onConfirm={() => {
          if (confirmCancel) {
            handleCancel(confirmCancel)
          }
          setConfirmCancel(null)
        }}
        onCancel={() => setConfirmCancel(null)}
      />
    </section>
  )
}

export default MyListings
