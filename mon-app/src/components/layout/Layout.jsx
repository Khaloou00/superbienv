import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';

export default function Layout({ children }) {
  const { pathname } = useLocation();

  // Pages "immersives" : détail film + tunnel de réservation
  const isImmersive = pathname.startsWith('/film/') || pathname.startsWith('/reservation/');
  // Footer masqué sur mobile/tablette pour Programme + pages immersives
  const hideFooterMobile = isImmersive || pathname === '/programme';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>

      {/* Footer caché sur mobile/tablette selon la page, toujours visible sur desktop (lg+) */}
      <div className={hideFooterMobile ? 'hidden lg:block' : ''}>
        <Footer />
      </div>

      {/* Bottom nav masquée sur les pages immersives (détail film, réservation) */}
      {!isImmersive && <BottomNav />}
    </div>
  );
}
