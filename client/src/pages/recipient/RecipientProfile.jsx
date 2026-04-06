import { useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../lib/api'

const RecipientProfile = () => {
  const { profile, updateProfile } = useAuth()
  const [form, setForm] = useState(() => ({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    lat: profile?.lat || '',
    lng: profile?.lng || '',
    receiving_hours: profile?.receiving_hours || '',
  }))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const canSave = useMemo(() => form.full_name.trim() && form.address.trim(), [form])

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      setSaving(true)
      setError('')
      setMessage('')

      const payload = await apiFetch('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          ...form,
          lat: form.lat === '' ? null : Number(form.lat),
          lng: form.lng === '' ? null : Number(form.lng),
        }),
      })

      updateProfile(payload.data.profile)
      setMessage('Profile updated successfully.')
    } catch (err) {
      setError(err.message || 'Unable to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Recipient Profile</h1>
        <p className="text-sm text-gray-600">Keep your pickup contact details updated.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-xl border border-gray-200 bg-white p-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Organization Name</label>
          <input
            value={form.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Receiving Hours</label>
            <input
              placeholder="e.g. 9 AM - 6 PM"
              value={form.receiving_hours}
              onChange={(e) => handleChange('receiving_hours', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
          <textarea
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="min-h-20 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Latitude</label>
            <input
              type="number"
              step="0.000001"
              value={form.lat}
              onChange={(e) => handleChange('lat', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Longitude</label>
            <input
              type="number"
              step="0.000001"
              value={form.lng}
              onChange={(e) => handleChange('lng', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        {message ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}

        <button
          type="submit"
          disabled={saving || !canSave}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </section>
  )
}

export default RecipientProfile
