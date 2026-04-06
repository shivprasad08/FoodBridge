import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const ProviderOverview = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const session = JSON.parse(sessionStorage.getItem('supabaseSession'));
        const res = await fetch('http://localhost:3001/api/listings/stats', {
          headers: {
            Authorization: `Bearer ${session?.access_token}`
          }
        });
        const data = await res.json();
        if (data.error) throw new Error(data.message);
        setStats(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Provider Overview</h1>
      {loading ? (
        <div>Loading stats...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-lg font-semibold text-gray-700 mb-2">Total Posted</div>
            <div className="text-3xl font-bold text-primary mb-1">{stats.total_posted}</div>
            <div className="text-sm text-gray-400">All time</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-lg font-semibold text-gray-700 mb-2">Completed</div>
            <div className="text-3xl font-bold text-primary mb-1">{stats.total_completed}</div>
            <div className="text-sm text-gray-400">Delivered</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-lg font-semibold text-gray-700 mb-2">Active</div>
            <div className="text-3xl font-bold text-primary mb-1">{stats.total_active}</div>
            <div className="text-sm text-gray-400">Live now</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-lg font-semibold text-gray-700 mb-2">Portions</div>
            <div className="text-3xl font-bold text-primary mb-1">{stats.total_portions}</div>
            <div className="text-sm text-gray-400">Donated</div>
          </div>
        </div>
      )}
      {/* TODO: Add active listings preview and activity feed */}
    </div>
  );
};

export default ProviderOverview;
