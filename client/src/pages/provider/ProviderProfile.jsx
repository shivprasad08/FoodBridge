import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

const ProviderProfile = () => {
  const { profile, user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setFullName(profile?.full_name || '');
    setPhone(profile?.phone || '');
    setAddress(profile?.address || '');
  }, [profile]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = await apiFetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ full_name: fullName, phone, address }),
      });

      updateProfile(payload.data.profile);
      setSuccess('Profile updated!');
      toast.success('Profile updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    try {
      await apiFetch('/api/auth/password', {
        method: 'PATCH',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password updated!');
      toast.success('Password updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update password');
      toast.error(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Provider Profile</h1>
      <form onSubmit={handleProfileSave} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input type="text" value={phone} onChange={e => setPhone(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input type="text" value={address} onChange={e => setAddress(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-primary text-white rounded-lg py-2 font-semibold mt-2 transition hover:bg-primary-dark disabled:bg-primary-light text-lg">
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
      <form onSubmit={handlePasswordSave} className="space-y-6 mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Change Password</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-primary text-white rounded-lg py-2 font-semibold mt-2 transition hover:bg-primary-dark disabled:bg-primary-light text-lg">
          {loading ? 'Saving...' : 'Change Password'}
        </button>
      </form>
      {error && <div className="text-red-500 text-sm mt-2 text-center">{error}</div>}
      {success && <div className="text-green-600 text-sm mt-2 text-center">{success}</div>}
    </div>
  );
};

export default ProviderProfile;
