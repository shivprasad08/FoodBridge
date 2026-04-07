import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import useAdminData from '../../hooks/useAdminData'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'

const StatCard = ({ label, value, note, danger, action }) => (
  <article className={`rounded-2xl border p-5 shadow-sm ${danger ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-white'}`}>
    <p className="text-sm font-medium text-gray-600">{label}</p>
    <p className={`mt-2 text-3xl font-bold ${danger ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
    <p className="mt-1 text-xs text-gray-500">{note}</p>
    {action}
  </article>
)

const formatAgo = (value) => {
  const diff = Date.now() - new Date(value).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const AdminOverview = () => {
  const { stats, users, auditLogs, loading, refetchStats, refetchUsers, refetchAuditLogs, verifyUser, suspendUser } = useAdminData()

  useEffect(() => {
    refetchStats().catch(() => {})
    refetchUsers({ verified: false, limit: 5 }).catch(() => {})
    refetchAuditLogs({ limit: 10 }).catch(() => {})
  }, [refetchStats, refetchUsers, refetchAuditLogs])

  const pendingUsers = useMemo(() => (users || []).filter(item => item.role !== 'admin' && !item.is_verified), [users])

  return (
    <section>
      <PageHeader title="Admin Overview" subtitle="Platform-wide operations and activity" />

      <div className="space-y-6 px-4 py-4 md:px-6 md:py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Providers" value={stats?.total_providers || 0} note="Registered" />
          <StatCard label="NGOs" value={stats?.total_ngos || 0} note="Registered" />
          <StatCard
            label="Pending Approval"
            value={stats?.pending_verification || 0}
            note="Accounts awaiting review"
            danger={(stats?.pending_verification || 0) > 0}
            action={(stats?.pending_verification || 0) > 0 ? <Link className="mt-2 inline-block text-xs font-medium text-red-700" to="/admin/users?verified=false">Review Now</Link> : null}
          />
          <StatCard label="Portions" value={stats?.total_portions || 0} note="Donated" />
          <StatCard label="Active Listings" value={stats?.active_listings || 0} note="Currently available" />
          <StatCard label="Completed Tasks" value={stats?.completed_tasks || 0} note="Confirmed" />
          <StatCard label="Success Rate" value={`${stats?.success_rate || 0}%`} note="Confirmed / all tasks" />
          <StatCard label="Avg Delivery" value={`${stats?.avg_delivery_mins || 0} mins`} note="From posted to confirmed" />
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Pending Verifications</h2>
            <Link to="/admin/users?verified=false" className="text-sm text-primary hover:underline">Open Users</Link>
          </div>

          {pendingUsers.length === 0 ? (
            <EmptyState title="No pending verification" description="All current accounts are verified." icon="OK" />
          ) : (
            <div className="space-y-3">
              {pendingUsers.map(user => (
                <article key={user.id} className="rounded-xl border border-red-100 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">{user.full_name} | {user.email}</p>
                  <p className="mt-1 text-xs text-gray-600">Role: {user.role} | Joined {new Date(user.created_at).toLocaleString()}</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => verifyUser(user.id).then(() => refetchUsers({ verified: false, limit: 5 }))} className="rounded-xl bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark" type="button">Verify</button>
                    <button onClick={() => suspendUser(user.id, 'Rejected during review').then(() => refetchUsers({ verified: false, limit: 5 }))} className="rounded-xl bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600" type="button">Reject</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Activity</h2>
          {loading && (auditLogs || []).length === 0 ? (
            <p className="text-sm text-gray-500">Loading activity...</p>
          ) : (auditLogs || []).length === 0 ? (
            <EmptyState title="No activity yet" description="Audit events will appear here once actions happen." icon="LOG" />
          ) : (
            <ul className="space-y-3">
              {auditLogs.map(item => (
                <li key={item.id} className="flex gap-3 text-sm">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" />
                  <div>
                    <p className="text-gray-800">Task {item.task?.title || item.task_id}: {item.old_status || 'none'} to {item.new_status}</p>
                    <p className="text-xs text-gray-500">{item.changed_by_profile?.full_name || 'System'} | {formatAgo(item.created_at)}</p>
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

export default AdminOverview
