import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Package, Truck, Heart } from 'lucide-react';

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!profile) return [];

    switch (profile.role) {
      case 'provider':
        return [
          { to: '/dashboard', icon: Home, label: 'Dashboard' },
          { to: '/my-listings', icon: Package, label: 'My Listings' },
          { to: '/create-listing', icon: Package, label: 'Create Listing' },
        ];
      case 'volunteer':
        return [
          { to: '/dashboard', icon: Home, label: 'Dashboard' },
          { to: '/tasks/nearby', icon: Truck, label: 'Nearby Tasks' },
          { to: '/my-tasks', icon: Truck, label: 'My Tasks' },
        ];
      case 'recipient':
        return [
          { to: '/dashboard', icon: Home, label: 'Dashboard' },
          { to: '/deliveries', icon: Heart, label: 'Deliveries' },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">FoodBridge</span>
            </Link>
          </div>

          {/* Navigation Links */}
          {user && (
            <div className="flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden md:inline">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user && profile && (
              <>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900">{profile.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
