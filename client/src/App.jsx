import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import MyListings from './pages/MyListings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Provider Routes */}
            <Route
              path="/create-listing"
              element={
                <ProtectedRoute allowedRoles={['provider']}>
                  <CreateListing />
                </ProtectedRoute>
              }
            />

            <Route
              path="/edit-listing/:id"
              element={
                <ProtectedRoute allowedRoles={['provider']}>
                  <EditListing />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-listings"
              element={
                <ProtectedRoute allowedRoles={['provider']}>
                  <MyListings />
                </ProtectedRoute>
              }
            />

            {/* Volunteer Routes */}
            <Route
              path="/tasks/nearby"
              element={
                <ProtectedRoute allowedRoles={['volunteer']}>
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">Nearby Tasks</h1>
                      <p className="text-gray-600">Coming soon...</p>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-tasks"
              element={
                <ProtectedRoute allowedRoles={['volunteer']}>
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Tasks</h1>
                      <p className="text-gray-600">Coming soon...</p>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Recipient Routes */}
            <Route
              path="/deliveries"
              element={
                <ProtectedRoute allowedRoles={['recipient']}>
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">Deliveries</h1>
                      <p className="text-gray-600">Coming soon...</p>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
