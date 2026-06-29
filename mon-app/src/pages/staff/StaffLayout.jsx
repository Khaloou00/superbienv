import { useSelector } from 'react-redux';
import { QrCode } from 'lucide-react';
import { selectCurrentUser } from '../../store/slices/authSlice';
import BottomNav from '../../components/layout/BottomNav';

export default function StaffLayout({ title, children }) {
  const user = useSelector(selectCurrentUser);

  return (
    <div className="min-h-screen bg-night text-white">
      {/* Barre supérieure minimale */}
      <header className="bg-surface border-b border-white/10 px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
            <QrCode size={16} className="text-gold" />
          </div>
          <div className="leading-tight">
            <p className="font-headline font-bold text-sm leading-none">{title || 'SUPERBIENV'}</p>
            <p className="text-gold text-xs font-label">{user?.role === 'admin' ? 'Admin' : 'Staff'} · {user?.nom}</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-5 pb-28">{children}</main>

      <BottomNav persistent />
    </div>
  );
}
