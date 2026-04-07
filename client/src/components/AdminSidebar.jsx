import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'

const navItems = [
  { path: '/admin/dashboard', label: 'Overview', icon: 'OV' },
  { path: '/admin/users', label: 'Users', icon: 'US' },
  { path: '/admin/listings', label: 'Listings', icon: 'LI' },
  { path: '/admin/tasks', label: 'Tasks', icon: 'TS' },
  { path: '/admin/map', label: 'Live Map', icon: 'MP' },
  { path: '/admin/analytics', label: 'Analytics', icon: 'AN' },
  { path: '/admin/audit', label: 'Audit Log', icon: 'AL' },
  { path: '/admin/profile', label: 'Profile', icon: 'PR' },
]

const AdminSidebar = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const activeClass = ({ isActive }) =>
    `mb-1 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-primary-light text-primary' : 'text-gray-700 hover:bg-gray-100'}`

  const mobileActive = ({ isActive }) =>
    `inline-flex min-w-12 items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold ${isActive ? 'bg-primary-light' : 'bg-gray-100'}`

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <aside className="hidden h-screen w-72 flex-col border-r border-gray-200 bg-white p-5 md:flex">
        <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-primary">FoodBridge</p>
            <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
            <p className="text-xs text-gray-500">{profile?.full_name || 'Administrator'}</p>
          </div>
          <NotificationBell />
        </div>

        <nav className="flex-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} className={activeClass}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleSignOut}
          className="mt-4 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600"
        >
          Logout
        </button>
      </aside>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white p-2 md:hidden">
        <div className="flex items-center gap-2 overflow-x-auto">
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} className={mobileActive} title={item.label}>
              {item.icon}
            </NavLink>
          ))}
        </div>
      </div>
    </>
  )
}

export default AdminSidebar
