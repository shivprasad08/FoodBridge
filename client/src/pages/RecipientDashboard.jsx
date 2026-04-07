import { Navigate, Route, Routes } from 'react-router-dom'
import RecipientSidebar from '../components/RecipientSidebar'
import RecipientHome from './recipient/RecipientHome'
import BrowseListings from './recipient/BrowseListings'
import ListingDetailNGO from './recipient/ListingDetailNGO'
import MyPickups from './recipient/MyPickups'
import PickupDetail from './recipient/PickupDetail'
import DeliveryHistory from './recipient/DeliveryHistory'
import RecipientProfile from './recipient/RecipientProfile'
import ErrorBoundary from '../components/ErrorBoundary'

const RecipientDashboard = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <RecipientSidebar />
      <main className="flex-1 overflow-auto">
        <ErrorBoundary>
          <Routes>
            <Route path="home" element={<RecipientHome />} />
            <Route path="browse" element={<BrowseListings />} />
            <Route path="listings/:listingId" element={<ListingDetailNGO />} />
            <Route path="pickups" element={<MyPickups />} />
            <Route path="pickups/:taskId" element={<PickupDetail />} />
            <Route path="history" element={<DeliveryHistory />} />
            <Route path="profile" element={<RecipientProfile />} />
            <Route index element={<Navigate to="home" replace />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  )
}

export default RecipientDashboard
