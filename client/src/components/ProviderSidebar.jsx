
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  History,
  User,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, path: '/provider/dashboard' },
  { label: 'Post Food', icon: PlusCircle, path: '/provider/post' },
  { label: 'My Listings', icon: ClipboardList, path: '/provider/listings' },
  { label: 'History', icon: History, path: '/provider/history' },
  { label: 'Profile', icon: User, path: '/provider/profile' },
];

const ProviderSidebar = () => {
  const { profile, signOut } = useAuth();

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── hidden on mobile */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 h-screen flex-shrink-0">
        {/* Logo + user */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-green-700 font-semibold text-lg">
                FoodBridge
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {profile?.full_name}
              </p>
            </div>
            <NotificationBell />
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              aria-label={item.label}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5
                rounded-xl text-sm font-medium
                transition-colors
                ${isActive
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50'
                }
              `}>
              <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5
                       rounded-xl text-sm text-red-500
                       hover:bg-red-50 w-full transition-colors min-h-[44px]">
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── MOBILE BOTTOM NAV ── shown only on mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 safe-area-pb">
        <div className="flex">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              aria-label={item.label}
              className={({ isActive }) => `
                flex-1 flex flex-col items-center justify-center
                py-2.5 text-xs font-medium transition-colors
                min-h-[64px]
                ${isActive
                  ? 'text-green-700'
                  : 'text-gray-500'
                }
              `}>
              <item.icon className="h-5 w-5 mb-0.5" aria-hidden="true" />
              <span className="truncate px-1">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* ── MOBILE SPACER ── prevents content behind bottom nav */}
      <div className="md:hidden h-20 flex-shrink-0" />
    </>
  );
};

export default ProviderSidebar;
