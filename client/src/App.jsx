import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Listings from './pages/Listings';
import LandDetail from './pages/LandDetail';
import ListYourLand from './pages/ListYourLand';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import ManageListings from './pages/admin/ManageListings';
import ManageEnquiries from './pages/admin/ManageEnquiries';

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AppRoutes = () => (
  <BrowserRouter>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/listings" element={<Listings />} />
      <Route path="/listings/:id" element={<LandDetail />} />
      <Route path="/list-land" element={<ProtectedRoute><ListYourLand /></ProtectedRoute>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/listings" element={<AdminRoute><ManageListings /></AdminRoute>} />
      <Route path="/admin/enquiries" element={<AdminRoute><ManageEnquiries /></AdminRoute>} />
    </Routes>
    <Footer />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#161d2a',
          color: '#f0f4f8',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
        },
      }}
    />
  </BrowserRouter>
);

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
