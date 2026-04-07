import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import { Card } from '../../components/ui/card';
import PageHeader from '../../components/PageHeader';
import { useToast } from '../../context/ToastContext';

const ProviderProfile = () => {
  const { profile, user, updateProfile } = useAuth();
  const { toast } = useToast();
  const email = profile?.email || user?.email || '';
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
    <section>
      <PageHeader title="Provider Profile" subtitle="Manage account details and security settings" />
      <div className="mx-auto max-w-[1400px] px-4 py-4 md:px-6 md:py-6 pb-20 md:pb-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-8">
          <Card className="p-5 md:p-6">
            <h2 className="mb-4 text-base font-semibold text-gray-900">Profile Information</h2>
            <form onSubmit={handleProfileSave} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full border border-gray-200 bg-gray-50 text-gray-600 rounded-lg px-4 py-2.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <button type="submit" disabled={loading} className="w-full min-h-[44px] rounded-xl bg-primary px-4 py-3 text-base font-semibold text-white transition hover:bg-primary-dark disabled:bg-primary-light">
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </Card>

          <Card className="p-5 md:p-6">
            <h2 className="mb-4 text-base font-semibold text-gray-900">Change Password</h2>
            <form onSubmit={handlePasswordSave} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <button type="submit" disabled={loading} className="w-full min-h-[44px] rounded-xl bg-primary px-4 py-3 text-base font-semibold text-white transition hover:bg-primary-dark disabled:bg-primary-light">
                {loading ? 'Saving...' : 'Change Password'}
              </button>
            </form>
          </Card>
        </div>

        {error && <div className="mt-4 text-center text-sm text-red-500">{error}</div>}
        {success && <div className="mt-4 text-center text-sm text-green-600">{success}</div>}
      </div>
    </section>
  );
};

export default ProviderProfile;
