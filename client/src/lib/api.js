const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:3001'

const getStoredSession = () => {
  const modern = sessionStorage.getItem('authSession')
  if (modern) return modern
  return null
}

export const getAuthToken = () => {
  try {
    const raw = getStoredSession()
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.access_token || parsed?.accessToken || null
  } catch {
    return null
  }
}

export const apiFetch = async (path, options = {}) => {
  const token = getAuthToken()
  const headers = {
    ...(options.headers || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  if (options.body && !headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  let payload = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok || payload?.error) {
    const message = payload?.message || `Request failed with ${response.status}`
    throw new Error(message)
  }

  return payload
}

export const uploadFoodPhoto = async (file) => {
  const form = new FormData()
  form.append('photo', file)
  const payload = await apiFetch('/api/uploads/food-photo', {
    method: 'POST',
    body: form,
  })
  return payload.data?.url || null
}
