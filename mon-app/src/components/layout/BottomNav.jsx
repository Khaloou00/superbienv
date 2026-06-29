import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Home, Film, CalendarDays, User, LogIn, LayoutDashboard } from 'lucide-react';
import { selectCurrentUser, selectIsAuthenticated } from '../../store/slices/authSlice';

// Texture "liquide" subtile (bruit fractal) posée sur le verre
function LiquidTexture() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full rounded-[26px] opacity-[0.06] mix-blend-overlay"
    >
      <filter id="bottomnav-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#bottomnav-noise)" />
    </svg>
  );
}

export default function BottomNav() {
  const { pathname } = useLocation();
  const user = useSelector(selectCurrentUser);
  const isAuth = useSelector(selectIsAuthenticated);

  const items = [
    { to: '/', label: 'Accueil', icon: Home, match: (p) => p === '/' },
    { to: '/programme', label: 'Programme', icon: Film },
    { to: '/evenements', label: 'Events', icon: CalendarDays },
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin', icon: LayoutDashboard }] : []),
    isAuth
      ? { to: '/espace', label: 'Compte', icon: User }
      : { to: '/connexion', label: 'Connexion', icon: LogIn },
  ];

  const isActive = (it) => (it.match ? it.match(pathname) : pathname.startsWith(it.to));

  return (
    <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.55rem)] pointer-events-none">
      <motion.nav
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="liquid-glass liquid-glass-sheen pointer-events-auto relative mx-auto flex max-w-md items-stretch justify-around gap-1 rounded-[26px] p-1.5"
      >
        <LiquidTexture />

        {items.map((it) => {
          const active = isActive(it);
          const Icon = it.icon;
          return (
            <NavLink
              key={it.to}
              to={it.to}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-[20px] py-2 min-w-0"
            >
              {active && (
                <motion.span
                  layoutId="bottomnav-pill"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="absolute inset-0 rounded-[20px] border border-gold/30 bg-gold/15 shadow-[0_0_22px_rgba(245,197,24,0.28)]"
                />
              )}
              <motion.span
                animate={{ y: active ? -1 : 0, scale: active ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 20 }}
                className="relative z-10"
              >
                <Icon size={20} className={active ? 'text-gold' : 'text-muted'} strokeWidth={active ? 2.4 : 2} />
              </motion.span>
              <span
                className={`relative z-10 truncate text-[10px] font-label leading-none transition-colors ${
                  active ? 'text-gold' : 'text-muted'
                }`}
              >
                {it.label}
              </span>
            </NavLink>
          );
        })}
      </motion.nav>
    </div>
  );
}
