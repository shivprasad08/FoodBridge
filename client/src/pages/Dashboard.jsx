import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { Package, Truck, Heart, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role) {
      fetchStats();
    }
  }, [profile]);

  const getDashboardContent = () => {
    switch (profile?.role) {
      case 'provider':
        return {
          title: 'Provider Dashboard',
          subtitle: 'Manage your food surplus listings',
          icon: Package,
          stats: [
            { label: 'Active Listings', value: stats?.activeListing || '0', color: 'text-green-600' },
            { label: 'Total Posted', value: stats?.totalListings || '0', color: 'text-blue-600' },
            { label: 'Kg Donated', value: `${stats?.totalQuantity || '0'}`, color: 'text-purple-600' },
          ],
          quickActions: [
            { label: 'Create New Listing', link: '/create-listing', primary: true },
            { label: 'View My Listings', link: '/my-listings' },
          ],
        };
      case 'volunteer':
        return {
          title: 'Volunteer Dashboard',
          subtitle: 'Pick up and deliver food to those in need',
          icon: Truck,
          stats: [
            { label: 'Active Tasks', value: stats?.activeTasks || '0', color: 'text-green-600' },
            { label: 'Completed', value: stats?.completedTasks || '0', color: 'text-blue-600' },
            { label: 'Total Distance', value: `${stats?.totalDistance || '0'} km`, color: 'text-purple-600' },
          ],
          quickActions: [
            { label: 'Find Nearby Tasks', link: '/tasks/nearby', primary: true },
            { label: 'My Tasks', link: '/my-tasks' },
          ],
        };
      case 'recipient':
        return {
          title: 'Recipient Dashboard',
          subtitle: 'Track incoming food deliveries',
          icon: Heart,
          stats: [
            { label: 'Pending Deliveries', value: stats?.pendingDeliveries || '0', color: 'text-green-600' },
            { label: 'Received', value: stats?.receivedDeliveries || '0', color: 'text-blue-600' },
            { label: 'Total Kg Received', value: `${stats?.totalKgReceived || '0'}`, color: 'text-purple-600' },
          ],
          quickActions: [
            { label: 'View Deliveries', link: '/deliveries', primary: true },
          ],
        };
      default:
        return null;
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      if (profile.role === 'provider') {
        const response = await api.get('/api/listings/my-listings');
        if (response.data.success) {
          const listings = response.data.data;
          const activeListing = listings.filter(l => l.status === 'Available').length;
          const totalQuantity = listings.reduce((sum, l) => sum + parseFloat(l.quantity_kg), 0).toFixed(1);
          setStats({
            activeListing,
            totalListings: listings.length,
            totalQuantity
          });
        }
      } else if (profile.role === 'volunteer') {
        const response = await api.get('/api/tasks/my-tasks');
        if (response.data.success) {
          const tasks = response.data.data;
          const activeTasks = tasks.filter(t => t.status === 'Assigned').length;
          const completedTasks = tasks.filter(t => t.status === 'Confirmed').length;
          setStats({
            activeTasks,
            completedTasks,
            totalDistance: '0'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchStats();
  };

  const content = getDashboardContent();
  if (!content) return null;

  const Icon = content.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Icon className="w-10 h-10 text-primary-600" />
              <h1 className="text-3xl font-bold text-gray-900">{content.title}</h1>
            </div>
            <p className="text-gray-600">{content.subtitle}</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn btn-secondary disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Welcome Card */}
        <div className="card mb-8 bg-gradient-to-r from-primary-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, {profile?.name}!</h2>
              <p className="opacity-90">Thank you for being part of the FoodBridge community</p>
            </div>
            <TrendingUp className="w-16 h-16 opacity-50" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {content.stats.map((stat, index) => (
            <div key={index} className="card">
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            {content.quickActions.map((action, index) => (
              <a
                key={index}
                href={action.link}
                className={`${
                  action.primary ? 'btn btn-primary' : 'btn btn-secondary'
                } inline-block`}
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>

        {/* Getting Started Section */}
        <div className="mt-8 card bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">📌 Getting Started</h3>
          <ul className="space-y-2 text-gray-700">
            {profile?.role === 'provider' && (
              <>
                <li>✓ Create your first food listing with pickup details</li>
                <li>✓ Set accurate pickup times and locations</li>
                <li>✓ Monitor listing status in real-time</li>
              </>
            )}
            {profile?.role === 'volunteer' && (
              <>
                <li>✓ Browse nearby available tasks</li>
                <li>✓ Accept tasks and coordinate pickup</li>
                <li>✓ Mark tasks as picked up and delivered</li>
              </>
            )}
            {profile?.role === 'recipient' && (
              <>
                <li>✓ View incoming food deliveries</li>
                <li>✓ Confirm receipt when food arrives</li>
                <li>✓ Track your impact over time</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
