import { Routes, Route, Navigate } from 'react-router-dom';
import ProviderSidebar      from '../components/ProviderSidebar';
import ProviderOverview     from './provider/ProviderOverview';
import PostFoodForm         from './provider/PostFoodForm';
import MyListings           from './provider/MyListings';
import ListingHistory       from './provider/ListingHistory';
import ProviderProfile      from './provider/ProviderProfile';

const ProviderDashboard = () => (
  <div className="flex h-screen bg-gray-50">
    <ProviderSidebar />
    <main className="flex-1 overflow-auto">
      <Routes>
        <Route path="dashboard" element={<ProviderOverview />} />
        <Route path="post"      element={<PostFoodForm />} />
        <Route path="listings"  element={<MyListings />} />
        <Route path="history"   element={<ListingHistory />} />
        <Route path="profile"   element={<ProviderProfile />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Routes>
    </main>
  </div>
);

export default ProviderDashboard;
