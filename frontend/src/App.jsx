import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import Home from './pages/user/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/user/Profile';
import MyBookings from './pages/user/MyBookings';
import EventDetailsPage from './pages/user/EventDetailsPage';
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import CreateEvent from './pages/organizer/CreateEvent';
import EditEvent from './pages/organizer/EditEvent';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/common/ProtectedRoute';
import SuccessPage from './pages/payment/SuccessPage';
import CancelPage from './pages/payment/CancelPage';
import FakeStripeCheckout from './pages/payment/FakeStripeCheckout';
import ChatBot from './components/common/ChatBot';

import HelpCenter from './pages/user/HelpCenter';
import TicketPage from './pages/user/TicketPage';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <NotificationProvider>
              <Routes>
                {/* User Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/events/:id" element={<EventDetailsPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/user/bookings" element={<MyBookings />} />
                <Route path="/payment/success" element={<SuccessPage />} />
                <Route path="/payment/cancel" element={<CancelPage />} />
                <Route path="/fake-stripe" element={<FakeStripeCheckout />} />
                <Route path="/ticket/:id" element={<TicketPage />} />

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Organizer Routes */}
                <Route element={<ProtectedRoute allowedRoles={['organizer', 'admin']} />}>
                  <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
                  <Route path="/organizer/create-event" element={<CreateEvent />} />
                  <Route path="/organizer/edit-event/:id" element={<EditEvent />} />
                </Route>

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                </Route>
              </Routes>
              <ChatBot />
            </NotificationProvider>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
