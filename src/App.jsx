import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/common/Navbar.jsx";
import Footer from "./components/common/Footer.jsx";
import ProtectedRoute, { AdminRoute } from "./components/common/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Listings from "./pages/Listings.jsx";
import ListingDetail from "./pages/ListingDetail.jsx";
import CreateListing from "./pages/CreateListing.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import Messages from "./pages/Messages.jsx";
import Orders from "./pages/Orders.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import EditListing from "./pages/EditListing.jsx";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-28 px-4 text-center">
      <p className="text-7xl mb-4">🏘️</p>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-gray-500 mb-6">Looks like this street doesn&apos;t exist on NeighborHub.</p>
      <a href="/" className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
        Go Home
      </a>
    </div>
  );
}

const Guard = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <main key={location.pathname} className="flex-1 page-enter">
      <Routes>
        {/* Public */}
        <Route path="/"             element={<Home />} />
        <Route path="/listings"     element={<Listings />} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route path="/register"     element={<Register />} />
        <Route path="/login"        element={<Login />} />
        <Route path="/profile/:id"  element={<Profile />} />

        {/* Protected */}
        <Route path="/edit-profile"      element={<Guard><EditProfile /></Guard>} />
        <Route path="/listings/:id/edit" element={<Guard><EditListing /></Guard>} />
        <Route path="/profile"           element={<Guard><Profile /></Guard>} />
        <Route path="/create-listing"    element={<Guard><CreateListing /></Guard>} />
        <Route path="/messages"          element={<Guard><Messages /></Guard>} />
        <Route path="/orders"            element={<Guard><Orders /></Guard>} />
        <Route path="/admin"             element={<AdminRoute><AdminDashboard /></AdminRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <AnimatedRoutes />
        <Footer />
      </div>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </BrowserRouter>
  );
}
