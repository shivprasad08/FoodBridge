import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import useAdminData from '../../hooks/useAdminData'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'
import ConfirmDialog from '../../components/ConfirmDialog'

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'provider', label: 'Providers' },
  { key: 'recipient', label: 'NGOs' },
  { key: 'pending', label: 'Pending Verification' },
]

const UserManagement = () => {
  const [params] = useSearchParams()
  const [tab, setTab] = useState(params.get('verified') === 'false' ? 'pending' : 'all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [suspendTarget, setSuspendTarget] = useState(null)
  const { users, usersTotal, loading, refetchUsers, verifyUser, suspendUser } = useAdminData()

  const query = useMemo(() => {
    const q = { limit: 20, offset: page * 20, search }
    if (tab === 'provider' || tab === 'recipient') q.role = tab
    if (tab === 'pending') q.verified = false
    return q
  }, [page, search, tab])

  useEffect(() => {
    refetchUsers(query).catch(() => {})
  }, [query, refetchUsers])

  return (
    <section>
      <PageHeader title="User Management" subtitle="Verify, suspend and monitor providers and NGOs" />

      <div className="space-y-4 px-4 py-4 md:px-6 md:py-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {tabs.map(item => (
              <button
                key={item.key}
                type="button"
                onClick={() => { setTab(item.key); setPage(0) }}
                className={`rounded-xl px-4 py-2 text-sm ${tab === item.key ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <input
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(0) }}
            placeholder="Search by name or email"
            className="mt-3 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
          />
        </div>

        {loading && users.length === 0 ? (
          <p className="text-sm text-gray-500">Loading users...</p>
        ) : users.length === 0 ? (
          <EmptyState icon="USR" title="No users found" description="Try changing filters or search text." />
        ) : (
          <div className="space-y-3">
            {users.map(user => (
              <article key={user.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-gray-900">{user.full_name} <span className="text-xs text-gray-500">({user.role})</span></p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">{user.address || 'No address'} | Joined {new Date(user.created_at).toLocaleDateString()}</p>
                    <p className="mt-1 text-xs text-gray-500">{user.listings_count || 0} listings · {user.tasks_count || 0} tasks · Last active {user.last_activity ? new Date(user.last_activity).toLocaleString() : 'N/A'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.is_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {user.is_verified ? 'Verified' : 'Pending'}
                    </span>
                    {!user.is_verified ? (
                      <button
                        type="button"
                        className="rounded-xl bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark"
                        onClick={() => verifyUser(user.id).then(() => refetchUsers(query))}
                      >
                        Verify
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="rounded-xl bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
                      onClick={() => setSuspendTarget(user)}
                    >
                      Suspend
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end gap-2">
          <button type="button" className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700" disabled={page === 0} onClick={() => setPage(prev => Math.max(0, prev - 1))}>Previous</button>
          <button type="button" className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700" disabled={(page + 1) * 20 >= usersTotal} onClick={() => setPage(prev => prev + 1)}>Next</button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!suspendTarget}
        title="Suspend account?"
        message="Are you sure you want to suspend this account? They will lose access immediately."
        confirmLabel="Suspend Account"
        dangerous={true}
        onConfirm={() => {
          if (!suspendTarget) return
          suspendUser(suspendTarget.id, 'Suspended by admin').then(() => refetchUsers(query))
          setSuspendTarget(null)
        }}
        onCancel={() => setSuspendTarget(null)}
      />
    </section>
  )
}

export default UserManagement
