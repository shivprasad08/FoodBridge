import { Navigate, Route, Routes } from 'react-router-dom'
import ErrorBoundary from '../components/ErrorBoundary'
import AdminSidebar from '../components/AdminSidebar'
import MobileHeader from '../components/MobileHeader'
import AdminOverview from './admin/AdminOverview'
import UserManagement from './admin/UserManagement'
import ListingsAdmin from './admin/ListingsAdmin'
import TasksAdmin from './admin/TasksAdmin'
import LiveMap from './admin/LiveMap'
import Analytics from './admin/Analytics'
import AuditLog from './admin/AuditLog'
import AdminProfile from './admin/AdminProfile'

const AdminDashboard = () => (
  <div className="flex flex-col md:flex-row h-screen bg-gray-50">
    <AdminSidebar />
    <main className="flex-1 overflow-auto pb-0 flex flex-col">
      <MobileHeader title="Admin" />
      <ErrorBoundary>
        <Routes>
          <Route path="dashboard" element={<AdminOverview />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="listings" element={<ListingsAdmin />} />
          <Route path="tasks" element={<TasksAdmin />} />
          <Route path="map" element={<LiveMap />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="audit" element={<AuditLog />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Routes>
      </ErrorBoundary>
    </main>
  </div>
)

export default AdminDashboard
