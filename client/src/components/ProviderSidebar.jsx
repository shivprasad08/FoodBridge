
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const navItems = [
  { label: 'Overview',    icon: '📊', path: '/provider/dashboard' },
  { label: 'Post Food',  icon: '➕', path: '/provider/post' },
  { label: 'My Listings',icon: '📋', path: '/provider/listings' },
  { label: 'History',    icon: '🕘', path: '/provider/history' },
  { label: 'Profile',    icon: '👤', path: '/provider/profile' },
];


const ProviderSidebar = () => {
  const { profile, signOut } = useAuth();
  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen p-6">
      {/* Header with NotificationBell */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 mb-8">
        <div>
          <h1 className="text-green-700 font-semibold text-lg">FoodBridge</h1>
          <p className="text-xs text-gray-500">{profile?.full_name}</p>
        </div>
        <NotificationBell />
      </div>
      <nav className="flex-1">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg mb-2 text-lg font-medium transition-all ${
                isActive ? 'bg-primary-light text-primary' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={signOut}
        className="mt-8 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
      >
        Logout
      </button>
    </aside>
  );
};

export default ProviderSidebar;
