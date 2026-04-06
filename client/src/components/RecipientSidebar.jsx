import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'

const navItems = [
  { to: '/recipient/home', label: 'Dashboard' },
  { to: '/recipient/browse', label: 'Browse Listings' },
  { to: '/recipient/pickups', label: 'My Pickups' },
  { to: '/recipient/history', label: 'Delivery History' },
  { to: '/recipient/profile', label: 'Profile' },
]

const RecipientSidebar = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const activeClass = ({ isActive }) =>
    `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-emerald-100 text-emerald-800' : 'text-gray-700 hover:bg-gray-100'}`

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-gray-200 bg-white px-4 py-5">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-emerald-700">FoodBridge</p>
          <h2 className="text-lg font-bold text-gray-900">Recipient Hub</h2>
        </div>
        <NotificationBell />
      </div>

      <div className="mb-6 rounded-xl bg-gray-50 p-3">
        <p className="text-xs text-gray-500">Signed in as</p>
        <p className="text-sm font-semibold text-gray-900">{profile?.full_name || 'Recipient'}</p>
        <p className="text-xs text-gray-500">{profile?.email || ''}</p>
      </div>

      <nav className="space-y-2">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} className={activeClass}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleSignOut}
        className="mt-auto rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
      >
        Sign out
      </button>
    </aside>
  )
}

export default RecipientSidebar
