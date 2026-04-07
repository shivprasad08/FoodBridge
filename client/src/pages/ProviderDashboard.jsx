import { Routes, Route, Navigate } from 'react-router-dom';
import ProviderSidebar      from '../components/ProviderSidebar';
import MobileHeader         from '../components/MobileHeader';
import ProviderOverview     from './provider/ProviderOverview';
import PostFoodForm         from './provider/PostFoodForm';
import MyListings           from './provider/MyListings';
import ListingDetail        from './provider/ListingDetail';
import ListingHistory       from './provider/ListingHistory';
import ProviderProfile      from './provider/ProviderProfile';
import ErrorBoundary from '../components/ErrorBoundary';

const ProviderDashboard = () => (
  <div className="flex flex-col md:flex-row h-screen bg-gray-50">
    <ProviderSidebar />
    <main className="flex-1 overflow-auto pb-0 flex flex-col">
      <MobileHeader title="Provider" />
      <ErrorBoundary>
        <Routes>
          <Route path="dashboard" element={<ProviderOverview />} />
          <Route path="post" element={<PostFoodForm />} />
          <Route path="listings" element={<MyListings />} />
          <Route path="listings/:listingId" element={<ListingDetail />} />
          <Route path="history" element={<ListingHistory />} />
          <Route path="profile" element={<ProviderProfile />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Routes>
      </ErrorBoundary>
    </main>
  </div>
);

export default ProviderDashboard;
