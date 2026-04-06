import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const ListingHistory = () => {
  const { profile } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
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
        setListings((data.data || []).filter(l => ['completed','cancelled'].includes(l.status)));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const totalPortions = listings.reduce((sum, l) => sum + (l.quantity_number || 0), 0);
  const totalDeliveries = listings.filter(l => l.status === 'completed').length;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Listing History</h1>
      <div className="mb-4 text-lg text-primary">
        You have donated {totalPortions} meals across {totalDeliveries} deliveries.
      </div>
      {loading ? (
        <div>Loading history...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : listings.length === 0 ? (
        <div className="text-gray-500">No completed or cancelled listings found.</div>
      ) : (
        <table className="min-w-full bg-white rounded-xl shadow">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Food title</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Portions</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Completed at</th>
            </tr>
          </thead>
          <tbody>
            {listings.map(listing => (
              <tr key={listing.id}>
                <td className="px-4 py-2 text-gray-800">{listing.title}</td>
                <td className="px-4 py-2 text-gray-600">{listing.quantity_number}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${listing.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}>
                    {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-500">{listing.completed_at ? new Date(listing.completed_at).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ListingHistory;
