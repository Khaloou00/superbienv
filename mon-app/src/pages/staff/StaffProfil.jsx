import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, LogOut } from 'lucide-react';
import { logout, selectCurrentUser } from '../../store/slices/authSlice';
import { useLogoutMutation } from '../../store/api/authApi';
import StaffLayout from './StaffLayout';

export default function StaffProfil() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try { await logoutMutation().unwrap(); } catch { /* on déconnecte quand même */ }
    dispatch(logout());
    navigate('/connexion', { replace: true });
  };

  return (
    <StaffLayout title="Profil">
      <div className="space-y-4">
        <div className="bg-surface border border-white/5 rounded-2xl p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-gold" />
          </div>
          <h2 className="font-headline text-xl font-bold">{user?.nom}</h2>
          <p className="text-gold text-sm font-label capitalize">{user?.role}</p>
        </div>

        <div className="bg-surface border border-white/5 rounded-2xl divide-y divide-white/5">
          <Row icon={Mail} label="Email" value={user?.email} />
          <Row icon={Shield} label="Rôle" value={user?.role} />
        </div>

        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-cinema/10 border border-cinema/30 text-cinema font-label font-semibold text-sm rounded-2xl py-3.5 hover:bg-cinema/20 transition-colors">
          <LogOut size={16} /> Déconnexion
        </button>
      </div>
    </StaffLayout>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="px-4 py-3.5 flex items-center gap-3">
      <Icon size={16} className="text-muted flex-shrink-0" />
      <span className="text-muted text-sm font-label flex-1">{label}</span>
      <span className="text-white text-sm font-label capitalize truncate">{value || '—'}</span>
    </div>
  );
}
