import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const MyListings = () => {
  const { profile } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const session = JSON.parse(sessionStorage.getItem('supabaseSession'));
        const res = await fetch('http://localhost:3001/api/listings', {
          headers: {
            Authorization: `Bearer ${session?.access_token}`
          }
        });
        const data = await res.json();
        if (data.error) throw new Error(data.message);
        setListings(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Listings</h1>
      {loading ? (
        <div>Loading listings...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : listings.length === 0 ? (
        <div className="text-gray-500">No listings found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listings.map(listing => (
            <div key={listing.id} className="bg-white rounded-xl shadow p-6">
              <div className="text-lg font-semibold text-gray-700 mb-2">{listing.title}</div>
              <div className="text-sm text-gray-500 mb-1">{listing.food_type}</div>
              <div className="text-sm text-gray-400 mb-1">{listing.quantity} | Portions: {listing.quantity_number}</div>
              <div className="text-sm text-gray-400 mb-1">Status: {listing.status}</div>
              <div className="text-xs text-gray-400">Posted: {new Date(listing.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;
