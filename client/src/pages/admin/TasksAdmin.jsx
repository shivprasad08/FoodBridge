import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../../components/PageHeader'
import useAdminData from '../../hooks/useAdminData'
import StatusBadge from '../../components/StatusBadge'
import EmptyState from '../../components/EmptyState'

const tabs = ['all', 'available', 'claimed', 'picked_up', 'delivered', 'confirmed', 'cancelled']

const TasksAdmin = () => {
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [dialogTask, setDialogTask] = useState(null)
  const [nextStatus, setNextStatus] = useState('available')
  const [note, setNote] = useState('')
  const { tasks, tasksTotal, loading, refetchTasks, overrideTask } = useAdminData()

  const query = useMemo(() => {
    const q = { limit: 20, offset: page * 20, search }
    if (status !== 'all') q.status = status
    return q
  }, [page, search, status])

  useEffect(() => {
    refetchTasks(query).catch(() => {})
  }, [query, refetchTasks])

  return (
    <section>
      <PageHeader title="Tasks Management" subtitle="View and override task statuses" />

      <div className="space-y-4 px-4 py-4 md:px-6 md:py-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {tabs.map(item => (
              <button key={item} type="button" onClick={() => { setStatus(item); setPage(0) }} className={`rounded-xl px-4 py-2 text-sm ${status === item ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}>
                {item === 'all' ? 'All' : item.replace('_', ' ')}
              </button>
            ))}
          </div>
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(0) }} placeholder="Search by listing title" className="mt-3 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm" />
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Listing</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">NGO</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Posted</th>
                <th className="px-4 py-3">Last Updated</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && tasks.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading tasks...</td></tr>
              ) : tasks.length === 0 ? (
                <tr><td colSpan={7}><EmptyState icon="TSK" title="No tasks found" description="Try changing filters." /></td></tr>
              ) : tasks.map(item => (
                <tr key={item.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-900">{item.food_listing?.title || 'Listing'}</td>
                  <td className="px-4 py-3 text-gray-700">{item.provider?.full_name || '-'}</td>
                  <td className="px-4 py-3 text-gray-700">{item.ngo?.full_name || '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-3 text-gray-500">{new Date(item.food_listing?.created_at || item.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(item.updated_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                      onClick={() => { setDialogTask(item); setNextStatus(item.status); setNote('') }}
                    >
                      Override Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button type="button" className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700" disabled={page === 0} onClick={() => setPage(prev => Math.max(0, prev - 1))}>Previous</button>
          <button type="button" className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700" disabled={(page + 1) * 20 >= tasksTotal} onClick={() => setPage(prev => prev + 1)}>Next</button>
        </div>
      </div>

      {dialogTask ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Override Task Status</h3>
            <p className="mt-1 text-sm text-gray-500">Current status: {dialogTask.status}</p>

            <label className="mt-4 block text-sm font-medium text-gray-700">New status</label>
            <select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm">
              {tabs.filter(item => item !== 'all').map(item => <option key={item} value={item}>{item}</option>)}
            </select>

            <label className="mt-4 block text-sm font-medium text-gray-700">Note</label>
            <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" placeholder="Reason for override" />

            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setDialogTask(null)} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm text-gray-700">Cancel</button>
              <button
                type="button"
                onClick={() => overrideTask(dialogTask.id, nextStatus, note).then(() => refetchTasks(query)).then(() => setDialogTask(null))}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm text-white hover:bg-primary-dark"
              >
                Apply Override
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default TasksAdmin
