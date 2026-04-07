import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../../components/PageHeader'
import useAdminData from '../../hooks/useAdminData'
import StatusBadge from '../../components/StatusBadge'
import TaskStatusTracker from '../../components/TaskStatusTracker'
import EmptyState from '../../components/EmptyState'
import { apiFetch } from '../../lib/api'

const filters = ['all', 'available', 'claimed', 'picked_up', 'completed', 'cancelled', 'expired']

const ListingsAdmin = () => {
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [selectedListing, setSelectedListing] = useState(null)
  const { listings, listingsTotal, loading, refetchListings } = useAdminData()

  const query = useMemo(() => {
    const q = { limit: 20, offset: page * 20, search }
    if (status !== 'all') q.status = status
    return q
  }, [page, search, status])

  useEffect(() => {
    refetchListings(query).catch(() => {})
  }, [query, refetchListings])

  const openPanel = async (listing) => {
    setSelectedListing({ ...listing, taskDetails: null })
    if (listing.task?.id) {
      try {
        const payload = await apiFetch('/api/admin/tasks?limit=200&offset=0')
        const full = (payload.data || []).find(item => item.id === listing.task.id)
        setSelectedListing({ ...listing, taskDetails: full || null })
      } catch {
        setSelectedListing({ ...listing, taskDetails: null })
      }
    }
  }

  return (
    <section>
      <PageHeader title="Listings Management" subtitle="View all listings regardless of status" />

      <div className="space-y-4 px-4 py-4 md:px-6 md:py-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {filters.map(item => (
              <button key={item} type="button" onClick={() => { setStatus(item); setPage(0) }} className={`rounded-xl px-4 py-2 text-sm ${status === item ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}>
                {item === 'all' ? 'All' : item.replace('_', ' ')}
              </button>
            ))}
          </div>
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(0) }} placeholder="Search by title or address" className="mt-3 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm" />
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Portions</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Posted</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && listings.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading listings...</td></tr>
              ) : listings.length === 0 ? (
                <tr><td colSpan={7}><EmptyState icon="LST" title="No listings found" description="Try changing filters." /></td></tr>
              ) : listings.map(item => (
                <tr key={item.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-900">{item.title}</td>
                  <td className="px-4 py-3 text-gray-700">{item.provider?.full_name || '-'}</td>
                  <td className="px-4 py-3 text-gray-700">{item.quantity_number || 0}</td>
                  <td className="px-4 py-3 text-gray-700">{item.pickup_address}</td>
                  <td className="px-4 py-3"><StatusBadge status={item.task?.status || item.status} /></td>
                  <td className="px-4 py-3 text-gray-500">{new Date(item.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button type="button" className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50" onClick={() => openPanel(item)}>View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button type="button" className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700" disabled={page === 0} onClick={() => setPage(prev => Math.max(0, prev - 1))}>Previous</button>
          <button type="button" className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700" disabled={(page + 1) * 20 >= listingsTotal} onClick={() => setPage(prev => prev + 1)}>Next</button>
        </div>
      </div>

      <div className={`fixed inset-y-0 right-0 z-40 w-full max-w-[480px] transform border-l border-gray-200 bg-white shadow-xl transition-transform ${selectedListing ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedListing ? (
          <div className="h-full overflow-y-auto p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Listing Details</h2>
              <button type="button" className="rounded-lg bg-gray-100 px-3 py-1 text-sm" onClick={() => setSelectedListing(null)}>Close</button>
            </div>

            <img src={selectedListing.photo_url || 'https://placehold.co/700x320?text=Listing'} alt={selectedListing.title} className="h-44 w-full rounded-xl object-cover" />
            <p className="mt-3 text-lg font-semibold text-gray-900">{selectedListing.title}</p>
            <p className="text-sm text-gray-600">{selectedListing.food_type} | {selectedListing.quantity}</p>
            <p className="mt-2 text-sm text-gray-600">Pickup: {selectedListing.pickup_address}</p>
            <p className="text-sm text-gray-600">Provider: {selectedListing.provider?.full_name} | {selectedListing.provider?.phone || 'N/A'}</p>
            <p className="text-sm text-gray-600">NGO: {selectedListing.ngo?.full_name || 'Not claimed'}</p>

            <div className="mt-4 rounded-xl border border-gray-100 p-4">
              <p className="mb-2 text-sm font-semibold text-gray-900">Task Progress</p>
              <TaskStatusTracker task={selectedListing.taskDetails || selectedListing.task || { status: selectedListing.status }} />
            </div>

            <div className="mt-4 rounded-xl border border-gray-100 p-4">
              <p className="mb-2 text-sm font-semibold text-gray-900">Audit Trail</p>
              {(selectedListing.taskDetails?.audit_logs || []).length === 0 ? (
                <p className="text-sm text-gray-500">No audit entries found.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {selectedListing.taskDetails.audit_logs.map(log => (
                    <li key={log.id} className="rounded-lg bg-gray-50 p-2">{`${log.old_status || 'none'} to ${log.new_status} | ${new Date(log.created_at).toLocaleString()}`}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default ListingsAdmin
