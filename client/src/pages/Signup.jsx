
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const roles = [
  { key: 'provider', icon: '🏨', title: 'Provider', desc: 'Hotels, events, restaurants' },
  { key: 'recipient', icon: '🏠', title: 'Recipient', desc: 'NGO / Shelter' },
];
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const Signup = () => {
  const { signUp } = useAuth();
  const [step, setStep] = useState('role');
  const [selectedRole, setSelectedRole] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [receivingHours, setReceivingHours] = useState(days.map(() => ({ start: '', end: '', closed: false })));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep('form');
  };
  const handleReceivingHourChange = (idx, field, value) => {
    setReceivingHours(hours => hours.map((h, i) => i === idx ? { ...h, [field]: value, closed: field === 'closed' ? value : h.closed } : h));
  };
  const handleClosedChange = (idx, closed) => {
    setReceivingHours(hours => hours.map((h, i) => i === idx ? { start: '', end: '', closed } : h));
  };
  const validate = () => {
    if (!selectedRole) return 'Please select a role.';
    if (!fullName) return 'Full name is required.';
    if (!email.match(/^[^@]+@[^@]+\.[^@]+$/)) return 'Invalid email.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    if (!phone.match(/^\d{10}$/)) return 'Phone must be 10 digits.';
    if (!address) return 'Address is required.';
    if (selectedRole === 'recipient') {
      if (!receivingHours.some(h => !h.closed)) return 'At least one receiving day must be open.';
    }
    return '';
  };
  const handleSignup = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signUp({
        email,
        password,
        role: selectedRole,
        full_name: fullName,
        phone,
        address,
      });
      setStep('success');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // UI structure
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-white flex flex-col">
      {/* Header */}
      <header className="py-6 flex justify-center items-center bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M12 21C12 21 3 13.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 12.99 5.08C14.07 3.81 15.74 3 17.5 3C20.58 3 23 5.42 23 8.5C23 13.5 12 21 12 21Z" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="text-2xl font-bold text-primary">FoodBridge</span>
        </div>
      </header>
      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="mb-8 text-center">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="mx-auto mb-2"><path d="M12 21C12 21 3 13.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 12.99 5.08C14.07 3.81 15.74 3 17.5 3C20.58 3 23 5.42 23 8.5C23 13.5 12 21 12 21Z" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <h1 className="text-3xl font-bold text-gray-900">Join FoodBridge</h1>
          <p className="text-gray-500 mt-2">Create an account to start making a difference</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Sign Up</h2>
          {/* Step 1: Role selection */}
          {step === 'role' && (
            <div className="mb-6 flex flex-col md:flex-row gap-4 justify-center">
              {roles.map(role => (
                <button
                  key={role.key}
                  onClick={() => handleRoleSelect(role.key)}
                  className={`flex-1 border-2 rounded-lg p-6 flex flex-col items-center transition-all duration-150 text-lg font-semibold ${selectedRole === role.key ? 'border-primary bg-primary-light shadow-md' : 'border-gray-200 bg-white'}`}
                >
                  <span className="text-4xl mb-2">{role.icon}</span>
                  <span>{role.title}</span>
                  <span className="text-gray-500 text-sm mt-1">{role.desc}</span>
                </button>
              ))}
            </div>
          )}
          {/* Step 2: Form */}
          {step === 'form' && (
            <form onSubmit={handleSignup} className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-base"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-base"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-base"
                    minLength={8}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-base"
                    minLength={8}
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="self-end mb-2 px-3 py-1 text-gray-500 hover:text-primary border border-gray-300 rounded-lg text-sm"
                  tabIndex={-1}
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1234567890"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-base"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    placeholder="123 Main St, City, State, ZIP"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-base"
                    required
                  />
                </div>
              </div>
              {selectedRole === 'recipient' && (
                <div className="mt-4">
                  <div className="font-semibold mb-2">Receiving hours</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {days.map((day, idx) => (
                      <div key={day} className="flex flex-col border rounded p-2">
                        <div className="flex items-center mb-2">
                          <span className="w-16 font-medium">{day}</span>
                          <label className="ml-auto flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={receivingHours[idx].closed}
                              onChange={e => handleClosedChange(idx, e.target.checked)}
                            />
                            <span className="text-xs">Closed</span>
                          </label>
                        </div>
                        {!receivingHours[idx].closed && (
                          <div className="flex gap-2">
                            <input
                              type="time"
                              value={receivingHours[idx].start}
                              onChange={e => handleReceivingHourChange(idx, 'start', e.target.value)}
                              className="border rounded px-2 py-1 w-24"
                              required
                            />
                            <span className="mx-1">→</span>
                            <input
                              type="time"
                              value={receivingHours[idx].end}
                              onChange={e => handleReceivingHourChange(idx, 'end', e.target.value)}
                              className="border rounded px-2 py-1 w-24"
                              required
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button
                type="submit"
                className="bg-primary text-white rounded-lg py-2 font-semibold mt-2 transition hover:bg-primary-dark disabled:bg-primary-light text-lg"
                disabled={loading}
              >
                {loading ? (
                  <span className="animate-spin inline-block mr-2 border-2 border-t-transparent border-white rounded-full w-4 h-4"></span>
                ) : null}
                Create Account
              </button>
              {error && <div className="text-red-500 text-sm mt-2 text-center">{error}</div>}
            </form>
          )}
          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-4">✅</span>
              <h2 className="text-xl font-bold text-primary mb-2">Account Created!</h2>
              <div className="text-gray-700 text-center mb-4">
                Your account is pending verification by our FoodBridge admin team.<br />
                This usually takes a few hours.<br />
                You'll be able to login once approved.
              </div>
              <a
                href="/login"
                className="bg-primary text-white rounded-lg py-2 px-6 font-semibold mt-2 transition hover:bg-primary-dark"
              >Back to Login</a>
            </div>
          )}
          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-primary hover:underline font-medium">Sign in here</a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Signup;
