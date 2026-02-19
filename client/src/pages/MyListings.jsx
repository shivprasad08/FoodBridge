import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { Package, MapPin, Clock, AlertCircle, CheckCircle, Trash2, Edit } from 'lucide-react';

const MyListings = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/listings/my-listings');
      
      if (response.data.success) {
        setListings(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (listingId, newStatus) => {
    try {
      const response = await api.patch(`/api/listings/${listingId}/status`, {
        status: newStatus
      });

      if (response.data.success) {
        // Update local state
        setListings(listings.map(l => 
          l.id === listingId ? { ...l, status: newStatus } : l
        ));
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDelete = async (listingId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await api.delete(`/api/listings/${listingId}`);
      
      if (response.data.success) {
        // Remove from local state
        setListings(listings.filter(l => l.id !== listingId));
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete listing');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Available': 'text-green-600 bg-green-50 border-green-200',
      'Reserved': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'Collected': 'text-blue-600 bg-blue-50 border-blue-200',
      'Delivered': 'text-purple-600 bg-purple-50 border-purple-200',
      'Expired': 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <Package className="w-10 h-10 text-primary-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
                <p className="text-gray-600">Manage your food surplus</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/create-listing')}
              className="btn btn-primary"
            >
              + Create New Listing
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}

        {/* Empty State */}
        {listings.length === 0 ? (
          <div className="card text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Listings Yet</h3>
            <p className="text-gray-600 mb-6">Create your first food listing to get started</p>
            <button
              onClick={() => navigate('/create-listing')}
              className="btn btn-primary inline-block"
            >
              Create Your First Listing
            </button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="card">
                <p className="text-sm text-gray-600 mb-1">Total Listings</p>
                <p className="text-3xl font-bold text-gray-900">{listings.length}</p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600 mb-1">Available</p>
                <p className="text-3xl font-bold text-green-600">
                  {listings.filter(l => l.status === 'Available').length}
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600 mb-1">Total Quantity (kg)</p>
                <p className="text-3xl font-bold text-primary-600">
                  {listings.reduce((sum, l) => sum + parseFloat(l.quantity_kg), 0).toFixed(1)}
                </p>
              </div>
            </div>

            {/* Listings Grid */}
            <div className="space-y-4">
              {listings.map((listing) => (
                <div key={listing.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
                        <span className={`badge px-3 py-1 text-xs font-semibold border ${getStatusColor(listing.status)}`}>
                          {listing.status}
                        </span>
                      </div>
                      {listing.description && (
                        <p className="text-sm text-gray-600 mb-3">{listing.description}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/edit-listing/${listing.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(listing.id, listing.title)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Quantity</p>
                      <p className="font-semibold text-gray-900">{listing.quantity_kg} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Food Type</p>
                      <p className="font-semibold text-gray-900">{listing.food_type || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Food Type</p>
                      <p className="font-semibold text-gray-900">{listing.food_type || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Created</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(listing.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Location & Time */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Pickup Location</p>
                        <p className="text-sm text-gray-900">{listing.pickup_address}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Pickup Window</p>
                        <p className="text-sm text-gray-900">
                          {formatDate(listing.pickup_time_start)} to {formatDate(listing.pickup_time_end)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  {listing.special_instructions && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                      <strong>Instructions:</strong> {listing.special_instructions}
                    </div>
                  )}

                  {/* Status Actions */}
                  {listing.status === 'Available' && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleStatusChange(listing.id, 'Expired')}
                        className="btn btn-secondary text-sm"
                      >
                        Mark as Expired
                      </button>
                    </div>
                  )}
                  {listing.status === 'Reserved' && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleStatusChange(listing.id, 'Available')}
                        className="btn btn-secondary text-sm"
                      >
                        Revert to Available
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyListings;
