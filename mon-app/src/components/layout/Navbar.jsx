import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { User, LogOut, LayoutDashboard } from 'lucide-react';
import { selectCurrentUser, selectIsAuthenticated, logout } from '../../store/slices/authSlice';
import { useLogoutMutation } from '../../store/api/authApi';

const links = [
  { to: '/', label: 'Accueil' },
  { to: '/programme', label: 'Programme' },
  { to: '/evenements', label: 'Événements' },
];

export default function Navbar() {
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
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-lg shadow-black/50' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-headline text-xl font-bold text-gradient-gold tracking-wide">SUPERBIENV</span>
          <span className="hidden sm:block text-muted text-xs font-label">Drive-In</span>
        </Link>

        {/* Navigation desktop (≥ lg) — sur mobile/tablette, c'est le BottomNav qui prend le relais */}
        <nav className="hidden lg:flex items-center gap-8">
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

        <div className="hidden lg:flex items-center gap-3">
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
      </div>
    </header>
  );
}
