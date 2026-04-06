import React from 'react';
import { useAuth } from '../context/AuthContext'

const PendingVerification = () => {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md flex flex-col items-center">
        <span className="text-3xl mb-4">⏳</span>
        <h2 className="text-xl font-bold text-green-600 mb-2">Verification Pending</h2>
        <div className="text-gray-700 text-center mb-4">
          Your account is under review by the FoodBridge admin team.<br />
          This usually takes a few hours.<br />
          Please check back later.
        </div>
        <button
          onClick={signOut}
          className="bg-green-600 text-white rounded py-2 px-6 font-semibold mt-2 transition hover:bg-green-700"
        >Logout</button>
      </div>
    </div>
  )
}

export default PendingVerification
