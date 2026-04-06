import React from 'react';
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Unauthorized = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const handleGoDashboard = () => {
    if (profile?.role === 'provider')  navigate('/provider/dashboard')
    if (profile?.role === 'recipient') navigate('/recipient/dashboard')
    if (profile?.role === 'admin')     navigate('/admin/dashboard')
    else navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md flex flex-col items-center">
        <span className="text-3xl mb-4">🚫</span>
        <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
        <div className="text-gray-700 text-center mb-4">
          You don't have permission to view this page.
        </div>
        <button
          onClick={handleGoDashboard}
          className="bg-green-600 text-white rounded py-2 px-6 font-semibold mt-2 transition hover:bg-green-700"
        >Go to my dashboard</button>
      </div>
    </div>
  )
}

export default Unauthorized
