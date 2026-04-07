import { useEffect, useState } from 'react'
import PageHeader from '../../components/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../lib/api'
import { useToast } from '../../context/ToastContext'

const AdminProfile = () => {
  const { profile, user, updateProfile } = useAuth()
  const { toast } = useToast()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [address, setAddress] = useState(profile?.address || '')
  const [platformStats, setPlatformStats] = useState({ users: 0 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setFullName(profile?.full_name || '')
    setPhone(profile?.phone || '')
    setAddress(profile?.address || '')
  }, [profile])

  useEffect(() => {
    apiFetch('/api/admin/stats')
      .then(payload => setPlatformStats({ users: (payload.data.total_providers || 0) + (payload.data.total_ngos || 0) }))
      .catch(() => {})
  }, [])

  const saveProfile = async () => {
    try {
      setLoading(true)
      const payload = await apiFetch('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({ full_name: fullName, phone, address }),
      })
      updateProfile(payload.data.profile)
      toast.success('Profile updated successfully.')
    } catch (err) {
      toast.error(err.message || 'Unable to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <PageHeader title="Admin Profile" subtitle="Manage administrator details" />

      <div className="grid grid-cols-1 gap-4 px-4 py-4 md:px-6 md:py-6 xl:grid-cols-2">
        <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
          <label className="mt-4 block text-sm font-medium text-gray-700">Full name</label>
          <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm" />

          <label className="mt-4 block text-sm font-medium text-gray-700">Email</label>
          <input value={user?.email || ''} readOnly className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm" />

          <label className="mt-4 block text-sm font-medium text-gray-700">Phone</label>
          <input value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm" />

          <label className="mt-4 block text-sm font-medium text-gray-700">Address</label>
          <input value={address} onChange={(event) => setAddress(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm" />

          <button disabled={loading} type="button" onClick={saveProfile} className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-sm text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </article>

        <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Platform Info</h2>
          <div className="mt-4 space-y-3 text-sm text-gray-700">
            <p><span className="font-medium text-gray-900">Total users:</span> {platformStats.users}</p>
            <p><span className="font-medium text-gray-900">Platform launch:</span> Jan 2026</p>
            <p><span className="font-medium text-gray-900">Current version:</span> M7</p>
          </div>

          <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50 p-4">
            <h3 className="text-sm font-semibold text-amber-800">Password Change</h3>
            <p className="mt-1 text-xs text-amber-700">Password is managed by authentication records. Use backend auth tooling to reset when needed.</p>
          </div>
        </article>
      </div>
    </section>
  )
}

export default AdminProfile
