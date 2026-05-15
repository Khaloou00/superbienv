import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from './store/slices/authSlice';
import { useAuthHydration } from './hooks/useAuthHydration';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Programme from './pages/Programme';
import Booking from './pages/Booking';
import Evenements from './pages/Evenements';
import Login from './pages/Login';
import Register from './pages/Register';
import MonEspace from './pages/user/MonEspace';
import AdminDashboard from './pages/admin/AdminDashboard';
import FilmDetail from './pages/FilmDetail';
import EventDetail from './pages/EventDetail';
import VerifyOTP from './pages/VerifyOTP';
import VerifyBooking from './pages/VerifyBooking';
import StaffLogin from './pages/staff/StaffLogin';
import StaffScanner from './pages/staff/StaffScanner';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

function PageWrapper({ children }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  );
}

function PrivateRoute({ children }) {
  const isAuth = useSelector(selectIsAuthenticated);
  const location = useLocation();
  if (!isAuth) return <Navigate to="/connexion" state={{ from: location.pathname }} replace />;
  return children;
}

function AdminRoute({ children }) {
  const isAuth = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const location = useLocation();
  if (!isAuth) return <Navigate to="/connexion" state={{ from: location.pathname }} replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function StaffRoute({ children }) {
  const isInitialized = useSelector((state) => state.auth.isInitialized);
  const isAuth = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-night flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuth || (user?.role !== 'staff' && user?.role !== 'admin')) {
    return <Navigate to="/staff/login" replace />;
  }
  return children;
}

export default function App() {
  const location = useLocation();
  const isHydrating = useAuthHydration();
  const noLayout = ['/connexion', '/inscription', '/mot-de-passe-oublie', '/verify-otp'].includes(location.pathname)
    || location.pathname.startsWith('/reset-password')
    || location.pathname.startsWith('/verify/')
    || location.pathname.startsWith('/staff/');

  if (isHydrating) {
    return (
      <div className="min-h-screen bg-night flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <span className="font-label text-muted text-sm">SUPERBIENV</span>
        </div>
      </div>
    );
  }

  const routes = (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
        <Route path="/programme" element={<PageWrapper><Programme /></PageWrapper>} />
        <Route path="/evenements" element={<PageWrapper><Evenements /></PageWrapper>} />
        <Route path="/film/:filmId" element={<PageWrapper><FilmDetail /></PageWrapper>} />
        <Route path="/evenement/:eventId" element={<PageWrapper><EventDetail /></PageWrapper>} />
        <Route path="/connexion" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/inscription" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/verify-otp" element={<PageWrapper><VerifyOTP /></PageWrapper>} />
        <Route path="/verify/:numero" element={<VerifyBooking />} />
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route
          path="/staff/scanner"
          element={<StaffRoute><StaffScanner /></StaffRoute>}
        />
        <Route
          path="/reservation/:filmId"
          element={<PrivateRoute><PageWrapper><Booking /></PageWrapper></PrivateRoute>}
        />
        <Route
          path="/espace"
          element={<PrivateRoute><PageWrapper><MonEspace /></PageWrapper></PrivateRoute>}
        />
        <Route
          path="/admin"
          element={<AdminRoute><PageWrapper><AdminDashboard /></PageWrapper></AdminRoute>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );

  if (noLayout) return <>{routes}<Analytics /></>;

  return <Layout>{routes}<Analytics /></Layout>;
}
