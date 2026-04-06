import React from 'react';
import { useAuth } from '../context/AuthContext'
const AdminDashboard = () => {
  const { profile, signOut } = useAuth()
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-800">
        Admin Dashboard
      </h1>
      <p className="text-gray-500 mt-1">
        Welcome, {profile?.full_name}
      </p>
      <p className="text-sm text-gray-400 mt-4">
        Full dashboard coming in M7.
      </p>
      <button
        onClick={signOut}
        className="mt-6 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">
        Logout
      </button>
    </div>
  )
}
export default AdminDashboard
