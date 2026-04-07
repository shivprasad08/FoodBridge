import { NavLink, useNavigate } from 'react-router-dom'
import { House, ClipboardList, ShoppingCart, History, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'

const navItems = [
  { to: '/recipient/home', label: 'Dashboard', icon: House },
  { to: '/recipient/browse', label: 'Browse', icon: ClipboardList },
  { to: '/recipient/pickups', label: 'Pickups', icon: ShoppingCart },
  { to: '/recipient/history', label: 'History', icon: History },
  { to: '/recipient/profile', label: 'Profile', icon: User },
]

const RecipientSidebar = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── hidden on mobile */}
      <aside className="hidden md:flex h-screen w-72 flex-col border-r border-gray-100 bg-white px-4 py-5">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-green-700 font-semibold">
              FoodBridge
            </p>
            <h2 className="text-lg font-bold text-gray-900 mt-1">Recipient Hub</h2>
          </div>
          <NotificationBell />
        </div>

        <div className="mb-6 rounded-xl bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Signed in as</p>
          <p className="text-sm font-semibold text-gray-900 mt-1">{profile?.full_name || 'Recipient'}</p>
          <p className="text-xs text-gray-500 mt-0.5">{profile?.email || ''}</p>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2.5 text-sm font-medium transition-colors min-h-[44px] flex items-center gap-2 ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}>
              <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleSignOut}
          className="rounded-lg border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 w-full transition-colors min-h-[44px]">
          Sign out
        </button>
      </aside>

      {/* ── MOBILE BOTTOM NAV ── shown only on mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 safe-area-pb">
        <div className="flex">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center py-2.5 text-xs font-medium transition-colors min-h-[64px] ${
                  isActive
                    ? 'text-green-700'
                    : 'text-gray-500'
                }`}>
              <item.icon className="mb-0.5 h-5 w-5" aria-hidden="true" />
              <span className="truncate px-1">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* ── MOBILE SPACER ── prevents content behind bottom nav */}
      <div className="md:hidden h-20 flex-shrink-0" />
    </>
  )
}

export default RecipientSidebar
