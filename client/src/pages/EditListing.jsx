import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../config/api';
import { Package, MapPin, AlertCircle, CheckCircle } from 'lucide-react';

const EditListing = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity_kg: '',
    food_type: '',
    pickup_address: '',
    pickup_lat: '',
    pickup_lng: '',
    pickup_time_start: '',
    pickup_time_end: '',
    special_instructions: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/listings/${id}`);
      
      if (response.data.success) {
        const listing = response.data.data;
        setFormData({
          title: listing.title || '',
          description: listing.description || '',
          quantity_kg: listing.quantity_kg || '',
          food_type: listing.food_type || '',
          pickup_address: listing.pickup_address || '',
          pickup_lat: listing.pickup_lat || '',
          pickup_lng: listing.pickup_lng || '',
          pickup_time_start: listing.pickup_time_start || '',
          pickup_time_end: listing.pickup_time_end || '',
          special_instructions: listing.special_instructions || '',
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch listing');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      // Validate required fields
      if (!formData.title || !formData.quantity_kg || !formData.pickup_address) {
        setError('Please fill in all required fields');
        setSubmitting(false);
        return;
      }

      const listingData = {
        ...formData,
        pickup_lat: formData.pickup_lat || 19.0760,
        pickup_lng: formData.pickup_lng || 72.8777,
      };

      const response = await api.put(`/api/listings/${id}`, listingData);

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/my-listings');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update listing');
    } finally {
      setSubmitting(false);
    }
  };

  // Get minimum datetime (now)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // At least 30 minutes from now
    return now.toISOString().slice(0, 16);
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Package className="w-10 h-10 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Edit Food Listing</h1>
          </div>
          <p className="text-gray-600">Update your food surplus listing</p>
        </div>

        {/* Form Card */}
        <div className="card">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <span className="text-sm text-green-800">
                Listing updated successfully! Redirecting...
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Food Details Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Food Details</span>
              </h3>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="input"
                    placeholder="e.g., Fresh Cooked Meals, Bakery Items"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    className="input"
                    placeholder="Describe the food items..."
                  />
                </div>

                {/* Quantity & Food Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="quantity_kg" className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity (kg) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="quantity_kg"
                      name="quantity_kg"
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      value={formData.quantity_kg}
                      onChange={handleChange}
                      className="input"
                      placeholder="5.0"
                    />
                  </div>
                  <div>
                    <label htmlFor="food_type" className="block text-sm font-medium text-gray-700 mb-2">
                      Food Type
                    </label>
                    <select
                      id="food_type"
                      name="food_type"
                      value={formData.food_type}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value="">Select type</option>
                      <option value="Cooked Meals">Cooked Meals</option>
                      <option value="Raw Vegetables">Raw Vegetables</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Bakery Items">Bakery Items</option>
                      <option value="Dairy Products">Dairy Products</option>
                      <option value="Packaged Foods">Packaged Foods</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Pickup Details Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Pickup Details</span>
              </h3>

              <div className="space-y-4">
                {/* Address */}
                <div>
                  <label htmlFor="pickup_address" className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="pickup_address"
                    name="pickup_address"
                    rows="2"
                    required
                    value={formData.pickup_address}
                    onChange={handleChange}
                    className="input"
                    placeholder="Full pickup address with landmarks"
                  />
                </div>

                {/* Time Window */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pickup_time_start" className="block text-sm font-medium text-gray-700 mb-2">
                      Pickup Start Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="pickup_time_start"
                      name="pickup_time_start"
                      type="datetime-local"
                      required
                      value={formData.pickup_time_start}
                      onChange={handleChange}
                      className="input"
                      min={getMinDateTime()}
                    />
                  </div>
                  <div>
                    <label htmlFor="pickup_time_end" className="block text-sm font-medium text-gray-700 mb-2">
                      Pickup End Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="pickup_time_end"
                      name="pickup_time_end"
                      type="datetime-local"
                      required
                      value={formData.pickup_time_end}
                      onChange={handleChange}
                      className="input"
                      min={getMinDateTime()}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>

              <div>
                <label htmlFor="special_instructions" className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions
                </label>
                <textarea
                  id="special_instructions"
                  name="special_instructions"
                  rows="2"
                  value={formData.special_instructions}
                  onChange={handleChange}
                  className="input"
                  placeholder="Any special handling or notes for volunteers..."
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Updating...' : 'Update Listing'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/my-listings')}
                className="btn btn-secondary px-8 py-3"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditListing;
