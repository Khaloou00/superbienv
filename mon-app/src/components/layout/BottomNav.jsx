import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import {
  Home, Film, CalendarDays, User, LogIn, LayoutDashboard, Camera, Ticket, Bell,
} from 'lucide-react';
import { selectCurrentUser, selectIsAuthenticated } from '../../store/slices/authSlice';
import { useGetUnreadCountQuery } from '../../store/api/notificationsApi';

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

// persistent = visible aussi sur desktop (utilisé par l'app staff)
export default function BottomNav({ persistent = false }) {
  const { pathname } = useLocation();
  const user = useSelector(selectCurrentUser);
  const isAuth = useSelector(selectIsAuthenticated);
  const role = user?.role;

  const { data: unreadData } = useGetUnreadCountQuery(undefined, {
    skip: !isAuth,
    pollingInterval: 60000,
  });
  const unread = unreadData?.unread ?? 0;

  let items;
  if (isAuth && role === 'staff') {
    items = [
      { to: '/staff/scanner', label: 'Scanner', icon: Camera },
      { to: '/staff/tickets', label: 'Tickets', icon: Ticket },
      { to: '/staff/profil', label: 'Profil', icon: User },
      { to: '/staff/notifications', label: 'Alertes', icon: Bell, badge: unread },
    ];
  } else if (isAuth && role === 'admin') {
    items = [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, match: (p) => p === '/admin' },
      { to: '/staff/scanner', label: 'Scanner', icon: Camera },
      { to: '/staff/notifications', label: 'Alertes', icon: Bell, badge: unread },
      { to: '/espace', label: 'Compte', icon: User },
    ];
  } else {
    items = [
      { to: '/', label: 'Accueil', icon: Home, match: (p) => p === '/' },
      { to: '/programme', label: 'Programme', icon: Film },
      { to: '/evenements', label: 'Events', icon: CalendarDays },
      isAuth
        ? { to: '/espace', label: 'Compte', icon: User, badge: unread }
        : { to: '/connexion', label: 'Connexion', icon: LogIn },
    ];
  }

  const isActive = (it) => (it.match ? it.match(pathname) : pathname.startsWith(it.to));

  return (
    <div
      className={`${persistent ? '' : 'lg:hidden'} fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.55rem)] pointer-events-none`}
    >
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
                {it.badge > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-cinema px-1 text-[9px] font-bold text-white">
                    {it.badge > 9 ? '9+' : it.badge}
                  </span>
                )}
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
