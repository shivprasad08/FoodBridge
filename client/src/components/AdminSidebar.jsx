import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'
import SlideUpDrawer from './SlideUpDrawer'

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
  const [moreOpen, setMoreOpen] = useState(false)

  const mobileNavItems = navItems.slice(0, 4)
  const moreItems = navItems.slice(5)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── hidden on mobile */}
      <aside className="hidden md:flex h-screen w-72 flex-col border-r border-gray-100 bg-white p-5">
        <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-green-700 font-semibold">FoodBridge</p>
            <h2 className="text-lg font-semibold text-gray-900 mt-1">Admin Panel</h2>
            <p className="text-xs text-gray-500 mt-1">{profile?.full_name || 'Administrator'}</p>
          </div>
          <NotificationBell />
        </div>

        <nav className="flex-1 overflow-y-auto space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `mb-1 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors min-h-[44px] ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}>
              <span className="text-sm font-semibold">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleSignOut}
          className="mt-4 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 min-h-[44px]">
          Logout
        </button>
      </aside>

      {/* ── MOBILE BOTTOM NAV ── shown only on mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 safe-area-pb">
        <div className="flex">
          {mobileNavItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center py-2.5 text-xs font-medium transition-colors min-h-[64px] ${
                  isActive
                    ? 'text-green-700'
                    : 'text-gray-500'
                }`}>
              <span className="text-sm font-semibold">{item.icon}</span>
              <span className="truncate px-1 mt-0.5">{item.label}</span>
            </NavLink>
          ))}
          <button
            onClick={() => setMoreOpen(true)}
            className="flex-1 flex flex-col items-center justify-center py-2.5 text-xs font-medium text-gray-500 transition-colors min-h-[64px] hover:text-gray-700">
            <span className="text-lg">...</span>
            <span className="truncate px-1 mt-0.5">More</span>
          </button>
        </div>
      </nav>

      {/* ── MORE DRAWER ── slide-up for remaining items */}
      <SlideUpDrawer
        isOpen={moreOpen}
        onClose={() => setMoreOpen(false)}
        title="More Options">
        <nav className="space-y-2">
          {navItems.slice(4).map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMoreOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm font-medium transition-colors min-h-[44px] flex items-center gap-3 ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}>
              <span className="text-sm font-semibold">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={() => {
              handleSignOut()
              setMoreOpen(false)
            }}
            className="w-full block rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors min-h-[44px] text-left">
            Logout
          </button>
        </nav>
      </SlideUpDrawer>

      {/* ── MOBILE SPACER ── prevents content behind bottom nav */}
      <div className="md:hidden h-20 flex-shrink-0" />
    </>
  )
}

export default AdminSidebar
