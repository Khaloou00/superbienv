import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { selectCurrentUser, selectIsAuthenticated, logout } from '../../store/slices/authSlice';
import { useLogoutMutation } from '../../store/api/authApi';

const links = [
  { to: '/', label: 'Accueil' },
  { to: '/programme', label: 'Programme' },
  { to: '/evenements', label: 'Événements' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const isAuth = useSelector(selectIsAuthenticated);
  const [logoutMutation] = useLogoutMutation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logoutMutation();
    dispatch(logout());
    navigate('/');
    setOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-lg shadow-black/50' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-headline text-xl font-bold text-gradient-gold tracking-wide">SUPERBIENV</span>
          <span className="hidden sm:block text-muted text-xs font-label">Drive-In</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `font-label text-sm transition-colors ${isActive ? 'text-gold' : 'text-muted hover:text-white'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isAuth ? (
            <div className="flex items-center gap-3">
              {user?.role === 'admin' && (
                <Link to="/admin" className="text-gold hover:text-yellow-400 transition-colors">
                  <LayoutDashboard size={18} />
                </Link>
              )}
              <Link to="/espace" className="flex items-center gap-2 text-sm text-muted hover:text-white transition-colors">
                <User size={16} /> {user?.nom?.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="text-muted hover:text-cinema transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              to="/connexion"
              className="border border-gold/50 text-gold px-4 py-1.5 rounded-lg text-sm font-label hover:bg-gold hover:text-night transition-all"
            >
              Se connecter
            </Link>
          )}
        </div>

        <button className="md:hidden text-muted hover:text-white transition-colors" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden glass border-t border-white/5"
          >
            <div className="flex flex-col px-4 py-4 gap-4">
              {links.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `font-label text-sm py-2 ${isActive ? 'text-gold' : 'text-muted'}`
                  }
                >
                  {label}
                </NavLink>
              ))}
              {isAuth ? (
                <>
                  <Link to="/espace" onClick={() => setOpen(false)} className="text-sm text-muted py-2">Mon espace</Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setOpen(false)} className="text-sm text-gold py-2">Admin</Link>
                  )}
                  <button onClick={handleLogout} className="text-left text-sm text-cinema py-2">Déconnexion</button>
                </>
              ) : (
                <Link to="/connexion" onClick={() => setOpen(false)} className="text-sm text-gold py-2">Se connecter</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
