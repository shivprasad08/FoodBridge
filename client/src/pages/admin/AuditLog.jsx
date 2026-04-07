import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../../components/PageHeader'
import useAdminData from '../../hooks/useAdminData'
import StatusBadge from '../../components/StatusBadge'
import EmptyState from '../../components/EmptyState'

const AuditLog = () => {
  const [search, setSearch] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(0)
  const { auditLogs, auditTotal, loading, refetchAuditLogs } = useAdminData()

  const query = useMemo(() => ({ search, from, to, limit: 50, offset: page * 50 }), [search, from, to, page])

  useEffect(() => {
    refetchAuditLogs(query).catch(() => {})
  }, [query, refetchAuditLogs])

  return (
    <section>
      <PageHeader title="Audit Log" subtitle="Full history of status changes and overrides" />

      <div className="space-y-4 px-4 py-4 md:px-6 md:py-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(0) }} placeholder="Search by listing title" className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm" />
            <input value={from} onChange={(event) => { setFrom(event.target.value); setPage(0) }} type="datetime-local" className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm" />
            <input value={to} onChange={(event) => { setTo(event.target.value); setPage(0) }} type="datetime-local" className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm" />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3">Old Status</th>
                <th className="px-4 py-3">New Status</th>
                <th className="px-4 py-3">Changed By</th>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Note</th>
              </tr>
            </thead>
            <tbody>
              {loading && auditLogs.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading logs...</td></tr>
              ) : auditLogs.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon="LOG" title="No audit entries found" description="Try broadening search or date range." /></td></tr>
              ) : auditLogs.map(item => (
                <tr key={item.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-900">{item.task?.title || item.task_id}</td>
                  <td className="px-4 py-3"><StatusBadge status={item.old_status || 'available'} /></td>
                  <td className="px-4 py-3"><StatusBadge status={item.new_status || 'available'} /></td>
                  <td className="px-4 py-3 text-gray-700">{item.changed_by_profile?.full_name || 'System'} {item.changed_by_profile?.role ? `(${item.changed_by_profile.role})` : ''}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(item.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-700">{item.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button type="button" className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700" disabled={page === 0} onClick={() => setPage(prev => Math.max(0, prev - 1))}>Previous</button>
          <button type="button" className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700" disabled={(page + 1) * 50 >= auditTotal} onClick={() => setPage(prev => prev + 1)}>Next</button>
        </div>
      </div>
    </section>
  )
}

export default AuditLog
